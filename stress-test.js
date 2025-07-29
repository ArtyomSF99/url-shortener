// in /stress-test.js

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Trend } from 'k6/metrics';

// Custom metrics to track response times for specific actions
const registerTrend = new Trend('post_auth_register');
const loginTrend = new Trend('post_auth_login');
const shortenTrend = new Trend('post_url');
const redirectTrend = new Trend('get_slug');

export const options = {
  stages: [
    { duration: '30s', target: 500 }, // Ramp-up to 500 users over 30s
    { duration: '1m', target: 1000 }, // Stay at 1000 users for 1 minute
    { duration: '30s', target: 0 },   // Ramp-down to 0 users
  ],
  thresholds: {
    'http_req_failed': ['rate<0.01'], // less than 1% of requests should fail
    'http_req_duration': ['p(95)<500'], // 95% of requests should be below 500ms
  },
};

export default function () {
  const BASE_URL = 'http://localhost:3000';

  // Use a unique email for each virtual user to avoid conflicts
  const uniqueEmail = `user_${__VU}@example.com`;
  const password = 'password123';

  // 1. Register a new user
  const regRes = http.post(
    `${BASE_URL}/auth/register`,
    JSON.stringify({ email: uniqueEmail, password: password }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  check(regRes, { 'register successful': (r) => r.status === 201 });
  registerTrend.add(regRes.timings.duration);
  sleep(1);

  // 2. Login
  const loginRes = http.post(
    `${BASE_URL}/auth/login`,
    JSON.stringify({ email: uniqueEmail, password: password }),
    { headers: { 'Content-Type': 'application/json' } }
  );
  check(loginRes, { 'login successful': (r) => r.status === 200 });
  loginTrend.add(loginRes.timings.duration);
  const authToken = loginRes.json('access_token');
  sleep(1);

  // 3. Create a short URL
  const shortenRes = http.post(
    `${BASE_URL}/url`,
    JSON.stringify({ originalUrl: 'https://google.com' }),
    { 
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
        } 
    }
  );
  check(shortenRes, { 'shorten successful': (r) => r.status === 201 });
  shortenTrend.add(shortenRes.timings.duration);
  const slug = shortenRes.json('slug');
  sleep(1);

  // 4. Visit the short URL (redirect)
  const redirectRes = http.get(`${BASE_URL}/${slug}`, { redirects: 0 }); // We stop redirects to measure the server's response time
  check(redirectRes, { 'redirect successful': (r) => r.status >= 300 && r.status < 400 });
  redirectTrend.add(redirectRes.timings.duration);
  sleep(1);
}