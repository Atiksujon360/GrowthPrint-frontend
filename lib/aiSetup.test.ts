import test from 'node:test';
import assert from 'node:assert/strict';
import { nextStep, setupState } from './aiSetup.ts';
import type { AiProviderOption, AiSettings, UpdateAiSettingsInput } from './api/ai.ts';

const providers: AiProviderOption[] = [
  { id: 'OPENAI', displayName: 'OpenAI', requiresBaseUrl: false, supportsModelListing: true },
  { id: 'GEMINI', displayName: 'Google Gemini', requiresBaseUrl: false, supportsModelListing: true },
  { id: 'OPENAI_COMPATIBLE', displayName: 'Custom', requiresBaseUrl: true, supportsModelListing: true },
];

const saved = (o: Partial<AiSettings> = {}): AiSettings => ({
  enabled: false, provider: 'OPENAI', providerDisplayName: 'OpenAI', model: 'm1', baseUrl: null, timeoutSeconds: 30,
  maxOutputTokens: 800, dailyRequestLimitPerUser: 50, apiKeyConfigured: true, apiKeyMasked: '••••1234',
  encryptionConfigured: true, status: 'NOT_TESTED', lastTestAt: null, lastTestMessage: null, updatedAt: '2026-11-15T00:00:00Z',
  keyUnreadable: false, ...o,
});
const form = (o: Partial<UpdateAiSettingsInput> = {}): UpdateAiSettingsInput => ({
  enabled: false, provider: 'OPENAI', model: 'm1', baseUrl: '', timeoutSeconds: 30, maxOutputTokens: 800,
  dailyRequestLimitPerUser: 50, ...o,
});

test('nothing changed means nothing to save', () => {
  const s = setupState(saved(), form(), providers, '');
  assert.deepEqual(s, { connectionChanged: false, keyWouldBeDiscarded: false, hasUnsavedKey: false, hasUnsavedChanges: false });
});

test('changing the provider discards the saved key; changing only the model does not', () => {
  assert.equal(setupState(saved(), form({ provider: 'GEMINI' }), providers, '').keyWouldBeDiscarded, true);
  const modelOnly = setupState(saved(), form({ model: 'm2' }), providers, '');
  assert.equal(modelOnly.connectionChanged, true);
  assert.equal(modelOnly.keyWouldBeDiscarded, false);
});

test('a different custom endpoint discards the key, whitespace and built-in providers do not', () => {
  const custom = saved({ provider: 'OPENAI_COMPATIBLE', baseUrl: 'https://one.example.com/v1' });
  assert.equal(setupState(custom, form({ provider: 'OPENAI_COMPATIBLE', baseUrl: 'https://two.example.com/v1' }), providers, '').keyWouldBeDiscarded, true);
  assert.equal(setupState(custom, form({ provider: 'OPENAI_COMPATIBLE', baseUrl: '  https://one.example.com/v1 ' }), providers, '').connectionChanged, false);
  // A leftover base URL typed for a built-in provider is ignored (the server pins built-ins to their official host).
  assert.equal(setupState(saved(), form({ baseUrl: 'https://ignored.example.com' }), providers, '').connectionChanged, false);
});

test('no key means no discard prompt', () => {
  assert.equal(setupState(saved({ apiKeyConfigured: false }), form({ provider: 'GEMINI' }), providers, '').keyWouldBeDiscarded, false);
});

test('a typed key counts as an unsaved change', () => {
  const s = setupState(saved(), form(), providers, '  sk-new  ');
  assert.equal(s.hasUnsavedKey, true);
  assert.equal(s.hasUnsavedChanges, true);
});

test('the steps unlock in order: save, key, test, then turn on', () => {
  const clean = setupState(saved(), form(), providers, '');
  assert.deepEqual(nextStep(saved(), clean), { canTest: true, canTurnOn: false, hint: 'Test the connection before turning AI on.' });
  assert.deepEqual(nextStep(saved({ status: 'CONNECTED' }), clean), { canTest: true, canTurnOn: true, hint: null });
  assert.equal(nextStep(saved({ apiKeyConfigured: false }), clean).canTest, false);
  assert.equal(nextStep(saved({ provider: null, model: null }), clean).canTest, false);
});

test('unsaved changes block testing and turning on', () => {
  const dirty = setupState(saved({ status: 'CONNECTED' }), form({ model: 'other' }), providers, '');
  const step = nextStep(saved({ status: 'CONNECTED' }), dirty);
  assert.equal(step.canTest, false);
  assert.equal(step.canTurnOn, false);
});

test('an unreadable key or a missing server encryption key blocks the flow with a specific reason', () => {
  const clean = setupState(saved(), form(), providers, '');
  assert.match(nextStep(saved({ keyUnreadable: true }), clean).hint!, /Enter the API key again/);
  assert.match(nextStep(saved({ encryptionConfigured: false }), clean).hint!, /AI_CREDENTIALS_ENCRYPTION_KEY/);
});
