
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  storageMethod?: string;
}

export function isApiSuccess<T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: true; data: T } {
  return response.success && response.data !== undefined;
}

export function isApiError<T>(response: ApiResponse<T>): response is ApiResponse<T> & { success: false; error: string } {
  return !response.success && response.error !== undefined;
}
