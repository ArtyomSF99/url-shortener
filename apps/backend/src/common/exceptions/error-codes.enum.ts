export enum ErrorCode {
  // ===============================================================
  // General Errors (1xxx)
  // ===============================================================
  /**
   * An unknown or unexpected error occurred on the server.
   */
  INTERNAL_SERVER_ERROR = 'E1000_INTERNAL_SERVER_ERROR',
  /**
   * The request payload is invalid or malformed.
   * Used by the global ValidationPipe.
   */
  VALIDATION_FAILED = 'E1001_VALIDATION_FAILED',
  /**
   * A required dependency or upstream service is unavailable.
   */
  SERVICE_UNAVAILABLE = 'E1002_SERVICE_UNAVAILABLE',

  // ===============================================================
  // Authentication Errors (2xxx)
  // ===============================================================
  /**
   * The request is missing valid authentication credentials.
   */
  UNAUTHENTICATED = 'E2000_UNAUTHENTICATED',
  /**
   * Provided email/password combination is incorrect.
   */
  INVALID_CREDENTIALS = 'E2001_INVALID_CREDENTIALS',
  /**
   * The provided JWT is malformed or invalid.
   */
  JWT_MALFORMED = 'E2002_JWT_MALFORMED',
  /**
   * The provided JWT has expired.
   */
  JWT_EXPIRED = 'E2003_JWT_EXPIRED',

  // ===============================================================
  // Authorization Errors (3xxx)
  // ===============================================================
  /**
   * The user is authenticated but does not have permission for this resource.
   */
  FORBIDDEN_RESOURCE = 'E3000_FORBIDDEN_RESOURCE',
  /**
   * The user's role does not grant them access to this feature.
   */
  INSUFFICIENT_PERMISSIONS = 'E3001_INSUFFICIENT_PERMISSIONS',

  // ===============================================================
  // User-related Errors (4xxx)
  // ===============================================================
  /**
   * The requested user was not found.
   */
  USER_NOT_FOUND = 'E4000_USER_NOT_FOUND',
  /**
   * A user with the given email already exists.
   */
  USER_ALREADY_EXISTS = 'E4001_USER_ALREADY_EXISTS',

  // ===============================================================
  // URL-related Errors (5xxx)
  // ===============================================================
  /**
   * The requested custom slug is already in use.
   */
  SLUG_ALREADY_EXISTS = 'E5000_SLUG_ALREADY_EXISTS',
  /**
   * The requested URL (by slug or ID) was not found.
   */
  URL_NOT_FOUND = 'E5001_URL_NOT_FOUND',
  /**
   * The provided URL is invalid or the domain is not reachable.
   */
  INVALID_URL = 'E5002_INVALID_URL',

  // ===============================================================
  // Rate Limiting Errors (8xxx)
  // ===============================================================
  /**
   * The user has sent too many requests in a given amount of time.
   */
  TOO_MANY_REQUESTS = 'E8001_TOO_MANY_REQUESTS',
}
