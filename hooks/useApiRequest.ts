import { useCallback } from 'react';
import { apiClient, type ApiRequestOptions, type ApiResponse } from '../lib/api/client.ts';
import { useAsyncRequest } from './useAsyncRequest.ts';

/**
 * Shared request lifecycle for client components that call the REST gateway.
 * Components receive loading, success, error, retry, and response state without
 * duplicating fetch orchestration.
 */
export function useApiRequest<T>() {
  const request = useCallback(
    (endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<T>> => apiClient.request<T>(endpoint, options),
    []
  );

  return useAsyncRequest<ApiResponse<T>, [string, ApiRequestOptions?]>(request);
}
