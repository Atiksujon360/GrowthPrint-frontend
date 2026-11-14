import { test, expect } from '@playwright/test';

/**
 * Authentication UX and route protection. Backend calls are stubbed with page.route, so these run without a
 * database; the backend's own tests cover the server-side rules (RoleMatrixSecurityTest, workflow tests).
 */
test.describe('Login form', () => {
  test('password visibility toggle keeps the typed value and is accessible', async ({ page }) => {
    await page.goto('/client-hub/login');
    const password = page.getByLabel(/^Password/);
    await password.fill('S3cret-value-123');
    await expect(password).toHaveAttribute('type', 'password');

    const toggle = page.getByRole('button', { name: 'Show password' });
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await toggle.click();
    await expect(password).toHaveAttribute('type', 'text');
    await expect(password).toHaveValue('S3cret-value-123');
    await expect(page.getByRole('button', { name: 'Hide password' })).toHaveAttribute('aria-pressed', 'true');

    await page.getByRole('button', { name: 'Hide password' }).click();
    await expect(password).toHaveAttribute('type', 'password');
    await expect(password).toHaveValue('S3cret-value-123');
  });

  test('shows inline validation and a generic error for wrong credentials', async ({ page }) => {
    await page.route('**/auth/login', route => route.fulfill({
      status: 401, contentType: 'application/json',
      body: JSON.stringify({ status: 401, message: 'Invalid credentials' }),
    }));
    await page.goto('/client-hub/login');
    await page.getByRole('button', { name: /^sign in$/i }).click();
    await expect(page.getByText('Enter your email address.')).toBeVisible();
    await expect(page.getByText('Enter your password.')).toBeVisible();

    await page.getByLabel('Email address').fill('someone@example.com');
    await page.getByLabel(/^Password/).fill('wrong-password');
    await page.getByRole('button', { name: /^sign in$/i }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Invalid email or password.' })).toBeVisible();
    await expect(page.getByLabel(/^Password/)).toHaveValue('');
  });

  test('links to the forgot-password page', async ({ page }) => {
    await page.goto('/studio/ops/login');
    await page.getByRole('link', { name: 'Forgot password?' }).click();
    await expect(page).toHaveURL('/forgot-password');
  });
});

test.describe('Password recovery', () => {
  test('forgot password shows the same confirmation for any address', async ({ page }) => {
    await page.route('**/auth/password/forgot', route => route.fulfill({
      status: 202, contentType: 'application/json',
      body: JSON.stringify({ message: "If an account exists for that email, we've sent a link to reset the password." }),
    }));
    await page.goto('/forgot-password');
    await page.getByLabel('Email address').fill('unknown@example.com');
    await page.getByRole('button', { name: 'Send reset link' }).click();
    await expect(page.getByRole('heading', { name: 'Check your email' })).toBeVisible();
    await expect(page.getByText(/If an account exists for/)).toBeVisible();
  });

  test('reset page rejects a missing or invalid link', async ({ page }) => {
    await page.route('**/auth/password/reset/verify', route => route.fulfill({
      status: 400, contentType: 'application/json', body: JSON.stringify({ message: 'invalid' }),
    }));
    await page.goto('/reset-password#token=abcdefghijklmnopqrstuvwxyz012345');
    await expect(page.getByText("This reset link can't be used")).toBeVisible();
    // The token is removed from the address bar
    expect(new URL(page.url()).hash).toBe('');
  });

  test('reset page validates and submits a new password', async ({ page }) => {
    await page.route('**/auth/password/reset/verify', route => route.fulfill({ status: 204 }));
    await page.route('**/auth/password/reset', route => route.fulfill({ status: 204 }));
    await page.goto('/reset-password#token=abcdefghijklmnopqrstuvwxyz012345');
    await page.getByLabel(/^New password/).fill('short');
    await page.getByLabel(/^Confirm new password/).fill('different');
    await page.getByRole('button', { name: 'Save new password' }).click();
    await expect(page.getByText('The password does not meet all requirements yet.')).toBeVisible();
    await expect(page.getByText('The passwords do not match.')).toBeVisible();

    await page.getByLabel(/^New password/).fill('Fresh-Start-2026');
    await page.getByLabel(/^Confirm new password/).fill('Fresh-Start-2026');
    await page.getByRole('button', { name: 'Save new password' }).click();
    await expect(page.getByRole('heading', { name: 'Password updated' })).toBeVisible();
  });
});

test.describe('Routes', () => {
  test('legacy /portal links redirect to the client hub', async ({ page }) => {
    await page.goto('/portal/login');
    await expect(page).toHaveURL('/client-hub/login');
  });

  test('legacy /admin returns 404 without revealing the studio path', async ({ request }) => {
    const response = await request.get('/admin/login', { maxRedirects: 0 });
    expect(response.status()).toBe(404);
    expect(await response.text()).not.toContain('studio');
  });

  test('private workspace pages are marked noindex', async ({ request }) => {
    const response = await request.get('/studio/ops/login');
    expect(response.headers()['x-robots-tag']).toContain('noindex');
  });

  test('signed-out visitors are sent from the studio to its login page', async ({ page }) => {
    await page.goto('/studio/ops');
    await expect(page).toHaveURL('/studio/ops/login');
  });

  test('signed-out visitors are sent from the client hub to its login page', async ({ page }) => {
    await page.goto('/client-hub/settings');
    await expect(page).toHaveURL('/client-hub/login');
  });
});
