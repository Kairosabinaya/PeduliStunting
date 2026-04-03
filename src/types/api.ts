/** API response types for consistent response structure. */

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  count: number;
  page: number;
  pageSize: number;
}
