export interface Url {
  id: string;
  slug: string;
  originalUrl: string;
  visits: number;
  createdAt: string;
  userId: string;
}

export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  errorCode: string;
  timestamp: string;
  path: string;
}

export interface PaginatedUrlsResponse {
  data: Url[];
  total: number;
  page: number;
  limit: number;
}

export type SortByType = "createdAt" | "visits";
