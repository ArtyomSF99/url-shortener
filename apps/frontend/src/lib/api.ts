import { ApiErrorResponse, PaginatedUrlsResponse, Url } from "../types";
import { API_ENDPOINTS } from "./constants";
import { toast } from "sonner";
import { SignInDto } from "../types/dto/sign-in.dto";
import { CreateUserDto } from "@/types/dto/create-user.dto";

/**
 * A generic response handler to process fetch responses.
 * It checks for errors and parses the JSON body.
 * @param response The fetch Response object.
 * @returns A promise that resolves with the parsed JSON data.
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData: ApiErrorResponse = await response.json();
    const errorMessage = Array.isArray(errorData.message)
      ? errorData.message.join(", ")
      : errorData.message;

    toast.error(errorMessage || "An unknown API error occurred");

    throw new Error(errorMessage || "An unknown API error occurred");
  }
  return response.json() as Promise<T>;
}

/**
 * Creates the authorization headers for a request.
 * @param token The JWT authentication token.
 * @returns A HeadersInit object.
 */
function getAuthHeaders(token: string | null): HeadersInit {
  const headers: HeadersInit = { "Content-Type": "application/json" };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

// --- API Service Object ---

export const apiService = {
  /**
   * Logs in a user.
   * @param credentials The user's email and password.
   * @returns A promise that resolves with an access token.
   */
  login: async (credentials: SignInDto): Promise<{ access_token: string }> => {
    const response = await fetch(API_ENDPOINTS.LOGIN, {
      method: "POST",
      headers: getAuthHeaders(null), // No token needed for login
      body: JSON.stringify(credentials),
    });

    return handleResponse<{ access_token: string }>(response);
  },

  /**
   * Registers a new user.
   * @param userData The new user's email and password.
   * @returns A promise that resolves with the created user object.
   */
  register: async (userData: CreateUserDto): Promise<{ message: string }> => {
    const response = await fetch(API_ENDPOINTS.REGISTER, {
      method: "POST",
      headers: getAuthHeaders(null),
      body: JSON.stringify(userData),
    });

    return handleResponse<{ message: string }>(response);
  },

  /**
   * Fetches a paginated list of URLs for the authenticated user.
   * @param token The user's JWT.
   * @param page The page number to fetch (default is 1).
   * @param sortBy The field to sort by (default is 'createdAt').
   * @returns A promise that resolves with a paginated response containing Url objects.
   */
  getMyLinks: async (
    token: string | null,
    page: number = 1,
    sortBy: string = "createdAt"
  ): Promise<PaginatedUrlsResponse> => {
    const query = new URLSearchParams({
      page: page.toString(),
      limit: "10",
      sortBy: sortBy,
      sortOrder: "DESC",
    });

    const response = await fetch(`${API_ENDPOINTS.MY_LINKS}?${query}`, {
      headers: getAuthHeaders(token),
    });

    return handleResponse<PaginatedUrlsResponse>(response);
  },

  /**
   * Creates a new short URL.
   * @param originalUrl The URL to shorten.
   * @param token The user's JWT.
   * @returns A promise that resolves with the created Url object.
   */
  createShortUrl: async (
    originalUrl: string,
    token: string | null
  ): Promise<Url> => {
    const response = await fetch(API_ENDPOINTS.CREATE_URL, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ originalUrl }),
    });

    return handleResponse<Url>(response);
  },

  /**
   * Updates the slug for a specific URL.
   * @param id The ID of the URL to update.
   * @param slug The new slug.
   * @param token The user's JWT.
   * @returns A promise that resolves with the updated Url object.
   */
  updateSlug: async (
    id: string,
    slug: string,
    token: string | null
  ): Promise<Url> => {
    const response = await fetch(API_ENDPOINTS.UPDATE_URL(id), {
      method: "PATCH",
      headers: getAuthHeaders(token),
      body: JSON.stringify({ slug }),
    });

    return handleResponse<Url>(response);
  },
};
