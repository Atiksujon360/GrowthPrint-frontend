import test from 'node:test';
import assert from 'node:assert/strict';
import { aiApi, aiErrorCode, AI_STATUS_TEXT } from './ai.ts';
import { ApiError } from './client.ts';

type Call = { url: string; method: string; body: unknown };

function stubFetch(status: number, body: unknown) {
  const original = globalThis.fetch;
  const calls: Call[] = [];
  globalThis.fetch = (async (url: string | URL | Request, init?: RequestInit) => {
    calls.push({ url: String(url), method: init?.method ?? 'GET', body: init?.body ? JSON.parse(String(init.body)) : undefined });
    return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
  }) as typeof fetch;
  return { calls, restore: () => { globalThis.fetch = original; } };
}

const view = {
  enabled: false, provider: 'GEMINI', providerDisplayName: 'Google Gemini', model: 'gemini-test', baseUrl: null,
  timeoutSeconds: 30, maxOutputTokens: 800, dailyRequestLimitPerUser: 50, apiKeyConfigured: true,
  apiKeyMasked: '••••9876', encryptionConfigured: true, status: 'NOT_TESTED', lastTestAt: null,
  lastTestMessage: null, updatedAt: '2026-11-01T12:00:00Z'
};

test('the API key is sent once, to the write-only endpoint, and only the masked value comes back', async () => {
  const { calls, restore } = stubFetch(200, view);
  try {
    const result = await aiApi.setApiKey('sk-secret-ABCD9876');
    assert.equal(calls[0]!.method, 'PUT');
    assert.match(calls[0]!.url, /\/admin\/ai\/settings\/api-key$/);
    assert.deepEqual(calls[0]!.body, { apiKey: 'sk-secret-ABCD9876' });
    assert.equal(result.apiKeyMasked, '••••9876');
    assert.equal(JSON.stringify(result).includes('sk-secret'), false);
  } finally {
    restore();
  }
});

test('settings updates never include the API key', async () => {
  const { calls, restore } = stubFetch(200, view);
  try {
    await aiApi.updateSettings({
      enabled: false, provider: 'GEMINI', model: 'gemini-test', baseUrl: '', timeoutSeconds: 30,
      maxOutputTokens: 800, dailyRequestLimitPerUser: 50
    });
    assert.match(calls[0]!.url, /\/admin\/ai\/settings$/);
    assert.equal(Object.keys(calls[0]!.body as object).includes('apiKey'), false);
  } finally {
    restore();
  }
});

test('a connection test is only made on request and uses POST', async () => {
  const { calls, restore } = stubFetch(200, { ...view, status: 'CONNECTED' });
  try {
    const result = await aiApi.testConnection();
    assert.equal(calls.length, 1);
    assert.equal(calls[0]!.method, 'POST');
    assert.match(calls[0]!.url, /\/admin\/ai\/settings\/test$/);
    assert.equal(result.status, 'CONNECTED');
  } finally {
    restore();
  }
});

test('support triage calls the suggestion endpoint for that request', async () => {
  const { calls, restore } = stubFetch(200, { requestId: 'r1', aiGenerated: true });
  try {
    await aiApi.suggestSupportTriage('r1');
    assert.equal(calls[0]!.method, 'POST');
    assert.match(calls[0]!.url, /\/support-requests\/r1\/ai\/triage$/);
  } finally {
    restore();
  }
});

test('AI error codes are read from the RFC 9457 type of the error body', () => {
  const error = new ApiError('Add an API key first.', {
    status: 409,
    data: { type: 'urn:growthprint:ai:KEY_MISSING', message: 'Add an API key first.' }
  });
  assert.equal(aiErrorCode(error), 'KEY_MISSING');
  assert.equal(aiErrorCode(new Error('boom')), null);
});

test('every connection status has human-readable text', () => {
  for (const status of ['AI_DISABLED', 'NOT_CONFIGURED', 'KEY_MISSING', 'NOT_TESTED', 'CONNECTED', 'INVALID_CREDENTIALS',
    'UNSUPPORTED_MODEL', 'RATE_LIMITED', 'TIMEOUT', 'PROVIDER_UNAVAILABLE', 'PROVIDER_ERROR'] as const) {
    assert.ok(AI_STATUS_TEXT[status].label.length > 0, status);
  }
});
