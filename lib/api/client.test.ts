import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiClient, ApiError } from './client.ts';

test('ApiClient initializes with default configuration', () => {
  const client = new ApiClient({ baseUrl: '/api/v1', timeoutMs: 5000, isMockMode: true });
  assert.equal(client.getMockMode(), true);
});

test('ApiError preserves custom properties and status', () => {
  const error = new ApiError('Resource not found', {
    status: 404,
    statusText: 'Not Found',
    correlationId: 'req-abc-123',
    data: { code: 'ERR_NOT_FOUND' }
  });

  assert.equal(error.name, 'ApiError');
  assert.equal(error.status, 404);
  assert.equal(error.statusText, 'Not Found');
  assert.equal(error.correlationId, 'req-abc-123');
  assert.equal(error.data.code, 'ERR_NOT_FOUND');
  assert.equal(error.isNetworkError, false);
});

test('ApiClient mock mode toggle updates internal state', () => {
  const client = new ApiClient({ isMockMode: true });
  assert.equal(client.getMockMode(), true);
  client.setMockMode(false);
  assert.equal(client.getMockMode(), false);
});
