export const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/auth/login`,
  REGISTER: `${API_BASE_URL}/auth/register`,
  MY_LINKS: `${API_BASE_URL}/url/my-links`,
  CREATE_URL: `${API_BASE_URL}/url`,
  UPDATE_URL: (id: string): string => `${API_BASE_URL}/url/${id}`,
};

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: "authToken",
};
