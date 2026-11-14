import test from 'node:test';
import assert from 'node:assert/strict';
import { checkPasswordRules, isPasswordAcceptable, readTokenFromHash, validateNewPassword } from './passwordRules.ts';

test('password rules mirror the backend policy', () => {
  assert.equal(isPasswordAcceptable('Correct-Horse-42'), true);
  assert.equal(isPasswordAcceptable('short1'), false);
  assert.equal(isPasswordAcceptable('onlylettersonly'), false);
  assert.equal(isPasswordAcceptable('123456789012345'), false);
  assert.equal(isPasswordAcceptable('a'.repeat(129) + '1'), false);
});

test('password must not contain the email name', () => {
  const rules = checkPasswordRules('sarahchen-2026', 'sarahchen@example.com');
  assert.equal(rules.find(r => r.id === 'email')?.met, false);
  assert.equal(checkPasswordRules('Correct-Horse-42', 'sarahchen@example.com').every(r => r.met), true);
});

test('new password + confirmation validation', () => {
  assert.deepEqual(validateNewPassword('', ''), { password: 'Enter a new password.', confirm: 'Confirm your new password.' });
  assert.equal(validateNewPassword('Correct-Horse-42', 'Correct-Horse-43').confirm, 'The passwords do not match.');
  assert.equal(validateNewPassword('weak', 'weak').password, 'The password does not meet all requirements yet.');
  assert.deepEqual(validateNewPassword('Correct-Horse-42', 'Correct-Horse-42'), {});
});

test('one-time tokens are read from the URL fragment and validated', () => {
  const token = 'Abc_def-0123456789xyzABCDEFGHIJ';
  assert.equal(readTokenFromHash(`#token=${token}`), token);
  assert.equal(readTokenFromHash(`token=${token}`), token);
  assert.equal(readTokenFromHash(''), null);
  assert.equal(readTokenFromHash('#token=short'), null);
  assert.equal(readTokenFromHash('#token=<script>alert(1)</script>'), null);
});
