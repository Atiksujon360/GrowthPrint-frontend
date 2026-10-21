/**
 * Production-ready API Integration Client Layer
 * Supports typed REST calls, automatic retries with exponential backoff,
 * timeout cancellation, Bearer token injection, and a transparent mock/real adapter toggle.
 */

export interface ApiRequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  skipAuth?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
  timestamp: string;
}

export class ApiError extends Error {
  public status: number;
  public statusText: string;
  public data: any;
  public isNetworkError: boolean;
  public isTimeout: boolean;
  public correlationId?: string;

  constructor(message: string, options: {
    status?: number;
    statusText?: string;
    data?: any;
    isNetworkError?: boolean;
    isTimeout?: boolean;
    correlationId?: string;
  } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = options.status || 500;
    this.statusText = options.statusText || 'Internal Server Error';
    this.data = options.data;
    this.isNetworkError = options.isNetworkError || false;
    this.isTimeout = options.isTimeout || false;
    this.correlationId = options.correlationId;
  }
}

export class ApiClient {
  private baseUrl: string;
  private defaultTimeoutMs: number;
  private isMockMode: boolean;

  constructor(config: { baseUrl?: string; timeoutMs?: number; isMockMode?: boolean } = {}) {
    // Read public runtime configuration without depending on Vite globals.
    this.baseUrl = config.baseUrl || process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';
    this.defaultTimeoutMs = config.timeoutMs || 10000;
    this.isMockMode = config.isMockMode ?? 
      process.env.NEXT_PUBLIC_USE_MOCK_API !== 'false';
  }

  public setMockMode(enabled: boolean): void {
    this.isMockMode = enabled;
  }

  public getMockMode(): boolean {
    return this.isMockMode;
  }

  /**
   * Internal request executor with timeout and retry logic
   */
  public async request<T = any>(
    endpoint: string, 
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      params,
      timeoutMs = this.defaultTimeoutMs,
      retries = 2,
      retryDelayMs = 400,
      skipAuth = false,
      headers: customHeaders,
      ...fetchOptions
    } = options;

    // Build URL with query parameters
    let url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined) searchParams.append(key, String(val));
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += (url.includes('?') ? '&' : '?') + queryString;
      }
    }

    // Default headers
    const headers = new Headers(customHeaders);
    if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    headers.set('Accept', 'application/json');

    // In a real OAuth or JWT setup, inject the bearer token here
    if (!skipAuth && !headers.has('Authorization')) {
      const token = typeof window !== 'undefined' ? window.sessionStorage?.getItem('gp_auth_token') : null;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    let attempt = 0;
    let lastError: any = null;

    while (attempt <= retries) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          ...fetchOptions,
          headers,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Parse body based on content type
        let data: any = null;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          data = await response.json().catch(() => null);
        } else {
          data = await response.text().catch(() => null);
        }

        if (!response.ok) {
          throw new ApiError(
            data?.message || `HTTP ${response.status}: ${response.statusText}`, 
            {
              status: response.status,
              statusText: response.statusText,
              data,
              correlationId: response.headers.get('x-correlation-id') || undefined
            }
          );
        }

        return {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          timestamp: new Date().toISOString()
        };
      } catch (err: any) {
        clearTimeout(timeoutId);

        const isTimeout = err.name === 'AbortError';
        const isNetworkError = !isTimeout && !(err instanceof ApiError);

        lastError = isTimeout
          ? new ApiError(`Request timed out after ${timeoutMs}ms`, { isTimeout: true, status: 408 })
          : err instanceof ApiError
            ? err
            : new ApiError(err.message || 'Network connection failed', { isNetworkError: true, status: 0 });

        // Don't retry client 4xx errors (except 429 rate limit or 408 timeout)
        const isClientError = lastError.status >= 400 && lastError.status < 500 && lastError.status !== 429 && lastError.status !== 408;
        if (isClientError || attempt >= retries) {
          break;
        }

        // Exponential backoff with jitter
        const delay = retryDelayMs * Math.pow(2, attempt) + Math.random() * 100;
        await new Promise((res) => setTimeout(res, delay));
        attempt++;
      }
    }

    throw lastError;
  }

  // Convenience verbs
  public get<T>(endpoint: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  public post<T>(endpoint: string, body?: any, options?: Omit<ApiRequestOptions, 'method'>) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  public put<T>(endpoint: string, body?: any, options?: Omit<ApiRequestOptions, 'method'>) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  public patch<T>(endpoint: string, body?: any, options?: Omit<ApiRequestOptions, 'method'>) {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  public delete<T>(endpoint: string, options?: Omit<ApiRequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// Global shared client instance
export const apiClient = new ApiClient();

/**
 * Pre-configured Domain Service API Adapters
 * When real Spring Boot microservices are running, these endpoints connect directly.
 */
export const agencyApi = {
  // Leads & CRM
  leads: {
    getAll: () => apiClient.get('/leads'),
    getById: (id: string) => apiClient.get(`/leads/${id}`),
    create: (lead: any) => apiClient.post('/leads', lead),
    updateStage: (id: string, stage: string) => apiClient.patch(`/leads/${id}/stage`, { stage }),
    delete: (id: string) => apiClient.delete(`/leads/${id}`)
  },

  // Clients
  clients: {
    getAll: () => apiClient.get('/clients'),
    getById: (id: string) => apiClient.get(`/clients/${id}`),
    update: (id: string, data: any) => apiClient.patch(`/clients/${id}`, data)
  },

  // Projects & Deliveries
  projects: {
    getAll: () => apiClient.get('/projects'),
    getById: (id: string) => apiClient.get(`/projects/${id}`),
    updateStatus: (id: string, status: string) => apiClient.patch(`/projects/${id}/status`, { status }),
    createMilestone: (projectId: string, milestone: any) => apiClient.post(`/projects/${projectId}/milestones`, milestone)
  },

  // Support & Service Requests
  support: {
    getAll: () => apiClient.get('/support-requests'),
    create: (data: any) => apiClient.post('/support-requests', data),
    classify: (id: string, classification: any) => apiClient.post(`/support-requests/${id}/classify`, classification),
    attachEstimate: (id: string, estimate: any) => apiClient.post(`/support-requests/${id}/estimate`, estimate),
    approveEstimate: (id: string, approvedBy: string) => apiClient.post(`/support-requests/${id}/approve-estimate`, { approvedBy })
  },

  // Invoices & Billing
  invoices: {
    getAll: () => apiClient.get('/invoices'),
    getById: (id: string) => apiClient.get(`/invoices/${id}`),
    markPaid: (id: string, details?: any) => apiClient.post(`/invoices/${id}/reconcile`, details)
  },

  // Outreach Studio
  outreach: {
    getDrafts: () => apiClient.get('/outreach/drafts'),
    approveDraft: (id: string) => apiClient.post(`/outreach/drafts/${id}/approve`),
    sendDraft: (id: string) => apiClient.post(`/outreach/drafts/${id}/send`)
  },

  // Automation Engine
  automations: {
    getAll: () => apiClient.get('/automations'),
    trigger: (id: string) => apiClient.post(`/automations/${id}/run`)
  },

  // Integration Health Check
  systemHealth: {
    checkAll: () => apiClient.get('/health/services')
  }
};
