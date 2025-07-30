// in /stress-test.js

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend, Counter } from 'k6/metrics';

// Custom metrics
const registerTrend = new Trend('register_duration');
const loginTrend = new Trend('login_duration');
const createUrlTrend = new Trend('create_url_duration');
const myLinksTrend = new Trend('my_links_duration');
const updateSlugTrend = new Trend('update_slug_duration');
const redirectTrend = new Trend('redirect_duration');
const registerFail = new Counter('register_fail');
const loginFail = new Counter('login_fail');
const createUrlFail = new Counter('create_url_fail');
const myLinksFail = new Counter('my_links_fail');
const updateSlugFail = new Counter('update_slug_fail');
const redirectFail = new Counter('redirect_fail');

export const options = {
  stages: [
    { duration: '10s', target: 50 },
    { duration: '20s', target: 100 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    'http_req_failed': ['rate<0.02'],
    'http_req_duration': ['p(95)<1000'],
  },
};

const API_URL = 'http://localhost:3001';

function randomEmail() {
  return `user_${__VU}_${__ITER}_${Math.floor(Math.random() * 100000)}@example.com`;
}

function strongPassword() {
  return 'Password123$';
}

function randomSlug() {
  return `slug${__VU}${__ITER}${Math.floor(Math.random() * 10000)}`;
}

export default function () {
  const email = randomEmail();
  const password = strongPassword();

  // 1. Register
  const regRes = http.post(`${API_URL}/auth/register`, JSON.stringify({ email, password }), {
    headers: { 'Content-Type': 'application/json' },
  });
  registerTrend.add(regRes.timings.duration);
  const regOk = check(regRes, { 'register: 201': (r) => r.status === 201 });
  if (!regOk) registerFail.add(1);
  sleep(0.5);

  // 2. Wait for registration to be processed, then login
  let loginOk = false;
  let loginRes;
  let token = null;
  const maxAttempts = 30;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    loginRes = http.post(`${API_URL}/auth/login`, JSON.stringify({ email, password }), {
      headers: { 'Content-Type': 'application/json' },
    });
    loginTrend.add(loginRes.timings.duration);
    loginOk = loginRes.status === 200;
    if (loginOk) {
      token = loginRes.json('access_token');
      break;
    }
    sleep(1);
  }
  check(loginRes, { 'login: 200': () => loginOk });
  if (!loginOk) loginFail.add(1);
  if (!token) return;

  // 3. Create short URL
  const slug = randomSlug();
  const createUrlRes = http.post(
    `${API_URL}/url`, 
    JSON.stringify({ originalUrl: 'https://example.com', slug }),
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );
  createUrlTrend.add(createUrlRes.timings.duration);
  const createUrlOk = check(createUrlRes, { 'create_url: 201': (r) => r.status === 201 });
  if (!createUrlOk) createUrlFail.add(1);
  sleep(0.5);

  // 4. Get my links (paginated)
  const myLinksRes = http.get(`${API_URL}/url/my-links?page=1&limit=5&sortBy=createdAt&sortOrder=DESC`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  myLinksTrend.add(myLinksRes.timings.duration);
  const myLinksOk = check(myLinksRes, { 'my_links: 200': (r) => r.status === 200 });
  if (!myLinksOk) myLinksFail.add(1);
  const urls = myLinksRes.json('data');
  sleep(0.5);

  // 5. Update slug (if we have at least one url)
  if (urls && urls.length > 0) {
    const urlId = urls[0].id;
    const newSlug = randomSlug() + 'upd';
    const updateSlugRes = http.patch(
      `${API_URL}/url/${urlId}`,
      JSON.stringify({ slug: newSlug }),
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    updateSlugTrend.add(updateSlugRes.timings.duration);
    const updateSlugOk = check(updateSlugRes, { 'update_slug: 200': (r) => r.status === 200 });
    if (!updateSlugOk) updateSlugFail.add(1);

    // 6. Redirect
    const redirectRes = http.get(`${API_URL}/${newSlug}`, { redirects: 0 });
    redirectTrend.add(redirectRes.timings.duration);
    const redirectOk = check(redirectRes, { 'redirect: 302/301': (r) => r.status >= 300 && r.status < 400 });
    if (!redirectOk) redirectFail.add(1);
    sleep(0.5);
  }
}

// k6 summary output will display all custom metrics and checks.