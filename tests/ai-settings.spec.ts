import { test, expect, type Page, type Route } from '@playwright/test';

/**
 * Studio → AI providers: the three-step set-up (set up, test, turn on) against a stubbed /admin/ai API.
 * The stub applies the same rules as the backend (confirm before the saved key is discarded, test before turning on),
 * so no backend, database or real AI provider is involved and no key leaves the browser.
 */
const KEY = 'sk-test-not-a-real-key-7890';

type Stub = {
  enabled: boolean; provider: string | null; model: string | null; baseUrl: string | null; keyConfigured: boolean;
  keyLast4: string | null; status: string; lastTestMessage: string | null; sawKeyInRequests: number;
};

async function stubStudioAndAi(page: Page): Promise<Stub> {
  await page.addInitScript(() => window.sessionStorage.setItem('gp_auth_token', 'e2e-stub-token'));
  const state: Stub = { enabled: false, provider: null, model: null, baseUrl: null, keyConfigured: false, keyLast4: null,
    status: 'NOT_CONFIGURED', lastTestMessage: null, sawKeyInRequests: 0 };

  const view = () => ({
    enabled: state.enabled, provider: state.provider, providerDisplayName: state.provider, model: state.model,
    baseUrl: state.baseUrl, timeoutSeconds: 30, maxOutputTokens: 800, dailyRequestLimitPerUser: 50,
    apiKeyConfigured: state.keyConfigured, apiKeyMasked: state.keyLast4 ? `••••${state.keyLast4}` : null,
    encryptionConfigured: true, status: state.status, lastTestAt: state.lastTestMessage ? '2026-11-15T10:00:00Z' : null,
    lastTestMessage: state.lastTestMessage, updatedAt: '2026-11-15T10:00:00Z', keyUnreadable: false,
  });

  const answer = async (route: Route, status: number, body: unknown) => {
    const origin = await route.request().headerValue('origin');
    const cors = {
      'Access-Control-Allow-Origin': origin ?? 'http://localhost:3000',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Allow-Headers': 'authorization, content-type, x-requested-with, x-correlation-id',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    };
    if (route.request().method() === 'OPTIONS') return route.fulfill({ status: 204, headers: cors });
    return route.fulfill({ status, headers: cors, contentType: 'application/json', body: JSON.stringify(body) });
  };
  const problem = (code: string, message: string) => ({ type: `urn:growthprint:ai:${code}`, title: code, status: 409, message });

  await page.route('**/auth/me', route => answer(route, 200,
    { id: 'e2e-admin', email: 'admin@example.test', role: 'ADMIN', fullName: 'Ada Admin' }));
  await page.route('**/admin/ai/providers', route => answer(route, 200, [
    { id: 'OPENAI', displayName: 'OpenAI', requiresBaseUrl: false, supportsModelListing: true },
    { id: 'GEMINI', displayName: 'Google Gemini', requiresBaseUrl: false, supportsModelListing: true },
    { id: 'OPENAI_COMPATIBLE', displayName: 'Custom OpenAI-compatible endpoint', requiresBaseUrl: true, supportsModelListing: true },
  ]));
  await page.route('**/admin/ai/settings', async route => {
    const method = route.request().method();
    if (method === 'GET') return answer(route, 200, view());
    if (method !== 'PUT') return answer(route, 204, {});
    const body = route.request().postDataJSON() as Record<string, unknown>;
    const provider = (body.provider as string | null) ?? null;
    const model = ((body.model as string) || null);
    const baseUrl = ((body.baseUrl as string) || null);
    const providerChanged = provider !== state.provider;
    const endpointChanged = baseUrl !== state.baseUrl;
    const connectionChanged = providerChanged || endpointChanged || model !== state.model;
    if ((providerChanged || endpointChanged) && state.keyConfigured) {
      if (body.confirmKeyReset !== true) {
        return answer(route, 409, problem('KEY_RESET_NOT_CONFIRMED', 'Changing the provider or endpoint removes the saved API key. Confirm to continue.'));
      }
      state.keyConfigured = false; state.keyLast4 = null; state.enabled = false;
    }
    if (body.enabled === true) {
      if (!state.keyConfigured) return answer(route, 409, problem('KEY_MISSING', 'Add an API key for the selected AI provider first.'));
      if (connectionChanged || state.status !== 'CONNECTED') return answer(route, 409, problem('CONNECTION_NOT_TESTED', 'Test the connection successfully before turning AI on.'));
    }
    state.provider = provider; state.model = model; state.baseUrl = baseUrl; state.enabled = body.enabled === true;
    if (connectionChanged) { state.status = state.keyConfigured ? 'NOT_TESTED' : (provider && model ? 'KEY_MISSING' : 'NOT_CONFIGURED'); state.lastTestMessage = null; }
    return answer(route, 200, view());
  });
  await page.route('**/admin/ai/settings/api-key', async route => {
    const method = route.request().method();
    if (method === 'PUT') {
      const { apiKey } = route.request().postDataJSON() as { apiKey: string };
      if (apiKey === KEY) state.sawKeyInRequests += 1;
      state.keyConfigured = true; state.keyLast4 = apiKey.slice(-4); state.status = 'NOT_TESTED'; state.lastTestMessage = null;
      return answer(route, 200, view());
    }
    if (method === 'DELETE') {
      state.keyConfigured = false; state.keyLast4 = null; state.enabled = false; state.status = 'KEY_MISSING';
      return answer(route, 200, view());
    }
    return answer(route, 204, {});
  });
  await page.route('**/admin/ai/settings/test', async route => {
    if (route.request().method() === 'POST') {
      state.status = 'CONNECTED'; state.lastTestMessage = 'Connected successfully.';
      return answer(route, 200, view());
    }
    return answer(route, 204, {});
  });
  return state;
}

async function openAiProviders(page: Page) {
  await page.goto('/studio/ops');
  await page.getByRole('button', { name: 'AI providers' }).click();
  await expect(page.getByRole('heading', { name: 'AI providers', level: 1 })).toBeVisible();
}

test.describe('Studio AI providers', () => {
  test('walks through set up, test and turn on, and never shows the key again', async ({ page }) => {
    const state = await stubStudioAndAi(page);
    await openAiProviders(page);

    // Nothing can be tested or turned on yet, and the screen says why.
    await expect(page.getByRole('button', { name: 'Test connection' })).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Turn on', exact: true })).toBeDisabled();

    // Step 1: provider, model and key are saved together.
    await page.getByLabel('Provider', { exact: true }).selectOption('OPENAI');
    await page.getByLabel('Model ID').fill('model-x');
    await page.getByLabel('API key', { exact: true }).fill(KEY);
    await page.getByRole('button', { name: 'Save settings and key' }).click();
    await expect(page.getByText('A key is saved (••••7890)')).toBeVisible();
    expect(state.sawKeyInRequests).toBe(1);
    await expect(page.getByLabel('API key', { exact: true })).toHaveValue('');
    expect(await page.content()).not.toContain(KEY);

    // Step 2: test.
    await expect(page.getByRole('button', { name: 'Turn on', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: 'Test connection' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Connected' })).toBeVisible();

    // Step 3: turn on, and back off.
    await page.getByRole('button', { name: 'Turn on', exact: true }).click();
    await expect(page.getByText('AI suggestions are on', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Turn off' }).click();
    await expect(page.getByText('AI suggestions are off', { exact: true })).toBeVisible();
  });

  test('asks before discarding the saved key when the provider changes', async ({ page }) => {
    const state = await stubStudioAndAi(page);
    await openAiProviders(page);

    await page.getByLabel('Provider', { exact: true }).selectOption('OPENAI');
    await page.getByLabel('Model ID').fill('model-x');
    await page.getByLabel('API key', { exact: true }).fill(KEY);
    await page.getByRole('button', { name: 'Save settings and key' }).click();
    await expect(page.getByText('A key is saved (••••7890)')).toBeVisible();

    await page.getByLabel('Provider', { exact: true }).selectOption('GEMINI');
    await expect(page.getByText('Saving this change removes the current API key')).toBeVisible();
    await page.getByRole('button', { name: 'Save settings', exact: true }).click();

    // Cancel: nothing changes and the key survives.
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(dialog).toBeHidden();
    expect(state.keyConfigured).toBe(true);
    expect(state.provider).toBe('OPENAI');

    // Confirm: the provider changes and the key is gone.
    await page.getByRole('button', { name: 'Save settings', exact: true }).click();
    await page.getByRole('alertdialog').getByRole('button', { name: 'Remove key and save' }).click();
    await expect(page.getByText('A key is saved')).toBeHidden();
    expect(state.keyConfigured).toBe(false);
    expect(state.provider).toBe('GEMINI');
    await expect(page.getByRole('button', { name: 'Test connection' })).toBeDisabled();
  });

  test('changing the model after a passing test requires testing again before AI can stay on', async ({ page }) => {
    await stubStudioAndAi(page);
    await openAiProviders(page);

    await page.getByLabel('Provider', { exact: true }).selectOption('OPENAI');
    await page.getByLabel('Model ID').fill('model-x');
    await page.getByLabel('API key', { exact: true }).fill(KEY);
    await page.getByRole('button', { name: 'Save settings and key' }).click();
    await page.getByRole('button', { name: 'Test connection' }).click();
    await page.getByRole('button', { name: 'Turn on', exact: true }).click();
    await expect(page.getByText('AI suggestions are on', { exact: true })).toBeVisible();

    await page.getByLabel('Model ID').fill('model-y');
    await expect(page.getByText('Saving these changes turns AI off until you test the connection again.')).toBeVisible();
    await page.getByRole('button', { name: 'Save settings', exact: true }).click();
    await expect(page.getByText('AI suggestions are off', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Turn on', exact: true })).toBeDisabled();
  });
});
