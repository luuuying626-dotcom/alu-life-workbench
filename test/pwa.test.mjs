import test from 'node:test';
import assert from 'node:assert/strict';
import { registerServiceWorker } from '../src/pwa.js';

test('registers the offline worker when the browser supports it', async () => {
  let registeredPath = '';
  await registerServiceWorker({
    serviceWorker: {
      register: async path => { registeredPath = path; }
    }
  });
  assert.equal(registeredPath, './sw.js');
});

test('does nothing in browsers without service worker support', async () => {
  await assert.doesNotReject(() => registerServiceWorker({}));
});
