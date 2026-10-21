import { useCallback, useEffect, useRef, useState } from 'react';
import { getErrorMessage } from '../lib/api/errors.ts';

export type AsyncRequestStatus = 'idle' | 'loading' | 'success' | 'error';

interface UseAsyncRequestOptions<TResult> {
  onSuccess?: (result: TResult) => void;
  onError?: (error: unknown) => void;
}

export function useAsyncRequest<TResult, TArgs extends readonly unknown[]>(
  request: (...args: TArgs) => Promise<TResult>,
  options: UseAsyncRequestOptions<TResult> = {}
) {
  const [status, setStatus] = useState<AsyncRequestStatus>('idle');
  const [data, setData] = useState<TResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async (...args: TArgs) => {
    const requestId = ++requestIdRef.current;
    setStatus('loading');
    setError(null);

    try {
      const result = await request(...args);
      if (!mountedRef.current || requestId !== requestIdRef.current) return result;
      setData(result);
      setStatus('success');
      options.onSuccess?.(result);
      return result;
    } catch (caughtError) {
      if (mountedRef.current && requestId === requestIdRef.current) {
        setStatus('error');
        setError(getErrorMessage(caughtError));
        options.onError?.(caughtError);
      }
      throw caughtError;
    }
  }, [options, request]);

  const reset = useCallback(() => {
    requestIdRef.current += 1;
    setStatus('idle');
    setData(null);
    setError(null);
  }, []);

  return {
    data,
    error,
    status,
    isIdle: status === 'idle',
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    execute,
    reset
  };
}
