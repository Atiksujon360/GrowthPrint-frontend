import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiClient, ApiError, filenameFromContentDisposition, saveBlobAsFile } from './client.ts';

const PDF_BYTES = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34]); // "%PDF-1.4"

type FetchCall = { url: string; init: RequestInit };

/** Replaces global fetch (and window.sessionStorage for the token) for one test; returns the recorded calls. */
function stubFetch(t: { after: (fn: () => void) => void }, respond: () => Response, token: string | null = 'jwt-token') {
  const calls: FetchCall[] = [];
  const originalFetch = globalThis.fetch;
  const originalWindow = (globalThis as any).window;
  globalThis.fetch = (async (url: string, init: RequestInit) => {
    calls.push({ url: String(url), init });
    return respond();
  }) as typeof fetch;
  (globalThis as any).window = { sessionStorage: { getItem: (key: string) => (key === 'gp_auth_token' ? token : null) } };
  t.after(() => {
    globalThis.fetch = originalFetch;
    (globalThis as any).window = originalWindow;
  });
  return calls;
}

function pdfResponse(disposition: string | null = 'attachment; filename="GrowthPrint-Invoice-INV-2026-0042.pdf"') {
  const headers: Record<string, string> = { 'Content-Type': 'application/pdf' };
  if (disposition) headers['Content-Disposition'] = disposition;
  return new Response(PDF_BYTES, { status: 200, headers });
}

test('download fetches with the bearer token, reads the body as a blob and saves it', async (t) => {
  const calls = stubFetch(t, () => pdfResponse());
  const saved: { blob: Blob; filename: string }[] = [];
  const client = new ApiClient({ baseUrl: '/api/v1', isMockMode: false });

  const result = await client.download('/invoices/abc/pdf', {
    filename: 'fallback.pdf',
    save: (blob, filename) => saved.push({ blob, filename }),
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, '/api/v1/invoices/abc/pdf');
  const headers = new Headers(calls[0].init.headers);
  assert.equal(headers.get('Authorization'), 'Bearer jwt-token');
  assert.match(headers.get('Accept') ?? '', /application\/pdf/);
  assert.equal(calls[0].init.method, 'GET');

  assert.equal(saved.length, 1);
  assert.equal(saved[0].filename, 'GrowthPrint-Invoice-INV-2026-0042.pdf');
  assert.deepEqual(new Uint8Array(await saved[0].blob.arrayBuffer()), PDF_BYTES);
  assert.deepEqual(result, {
    filename: 'GrowthPrint-Invoice-INV-2026-0042.pdf',
    size: PDF_BYTES.length,
    contentType: 'application/pdf',
  });
});

test('download falls back to the given file name without Content-Disposition', async (t) => {
  stubFetch(t, () => pdfResponse(null));
  const names: string[] = [];
  const client = new ApiClient({ baseUrl: '/api/v1', isMockMode: false });

  await client.download('/invoices/my/abc/pdf', { filename: 'GrowthPrint-Invoice-X.pdf', save: (_b, name) => names.push(name) });

  assert.deepEqual(names, ['GrowthPrint-Invoice-X.pdf']);
});

test('download surfaces the backend JSON error message and saves nothing', async (t) => {
  stubFetch(t, () => new Response(JSON.stringify({ status: 404, message: 'Invoice not found' }), {
    status: 404,
    statusText: 'Not Found',
    headers: { 'Content-Type': 'application/json' },
  }));
  let saved = false;
  const client = new ApiClient({ baseUrl: '/api/v1', isMockMode: false });

  await assert.rejects(
    client.download('/invoices/my/other/pdf', { save: () => { saved = true; } }),
    (err: unknown) => err instanceof ApiError && err.status === 404 && err.message === 'Invoice not found',
  );
  assert.equal(saved, false);
});

test('download calls the unauthorized handler on 401', async (t) => {
  stubFetch(t, () => new Response(JSON.stringify({ message: 'Authentication required' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  }));
  let unauthorized = 0;
  const client = new ApiClient({ baseUrl: '/api/v1', isMockMode: false, onUnauthorized: () => { unauthorized++; } });

  await assert.rejects(client.download('/invoices/abc/pdf', { save: () => {} }), ApiError);
  assert.equal(unauthorized, 1);
});

test('download maps network failures to an ApiError', async (t) => {
  stubFetch(t, () => { throw new TypeError('Failed to fetch'); });
  const client = new ApiClient({ baseUrl: '/api/v1', isMockMode: false });

  await assert.rejects(
    client.download('/invoices/abc/pdf', { save: () => {} }),
    (err: unknown) => err instanceof ApiError && err.isNetworkError,
  );
});

test('download refuses in mock mode without calling fetch', async (t) => {
  const calls = stubFetch(t, () => pdfResponse());
  const client = new ApiClient({ baseUrl: '/api/v1', isMockMode: true });

  await assert.rejects(client.download('/invoices/abc/pdf', { save: () => {} }), ApiError);
  assert.equal(calls.length, 0);
});

test('saveBlobAsFile clicks a temporary link and always revokes the object URL', () => {
  const events: string[] = [];
  const anchor: any = {
    style: {},
    click: () => events.push(`click:${anchor.download}:${anchor.href}`),
    remove: () => events.push('remove'),
  };
  const fakeDocument: any = {
    createElement: (tag: string) => { events.push(`create:${tag}`); return anchor; },
    body: { appendChild: () => events.push('append') },
  };
  const fakeUrl = {
    createObjectURL: () => { events.push('createObjectURL'); return 'blob:fake-1'; },
    revokeObjectURL: (url: string) => events.push(`revoke:${url}`),
  };

  saveBlobAsFile(new Blob([PDF_BYTES], { type: 'application/pdf' }), 'invoice.pdf', { document: fakeDocument, URL: fakeUrl });

  assert.deepEqual(events, [
    'createObjectURL', 'create:a', 'append', 'click:invoice.pdf:blob:fake-1', 'remove', 'revoke:blob:fake-1',
  ]);
});

test('filenameFromContentDisposition handles quoted, unquoted and RFC 5987 names', () => {
  assert.equal(filenameFromContentDisposition('attachment; filename="a b.pdf"'), 'a b.pdf');
  assert.equal(filenameFromContentDisposition('inline; filename=plain.pdf'), 'plain.pdf');
  assert.equal(filenameFromContentDisposition("attachment; filename*=UTF-8''Rechnung%20%C3%BC.pdf"), 'Rechnung ü.pdf');
  assert.equal(filenameFromContentDisposition('attachment'), null);
  assert.equal(filenameFromContentDisposition(null), null);
});
