interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}


export const successResponse = <T>(data: T, message?: string, pagination?: ApiResponse<T>['pagination']): ApiResponse<T> => ({
  success: true,
  message,
  data,
  pagination,
});

export const errorResponse = (error: string, message?: string): ApiResponse => ({
  success: false,
  message,
  error,
});