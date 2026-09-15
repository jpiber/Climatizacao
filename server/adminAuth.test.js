import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';

import { app } from './index.js';

test('login aceita senha com espaços extras', async () => {
  const server = app.listen(0);
  await once(server, 'listening');

  const { port } = server.address();
  const res = await fetch(`http://127.0.0.1:${port}/api/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ senha: ' 2026 ' }),
  });

  const data = await res.json();

  assert.equal(res.status, 200, `status esperado 200, recebeu ${res.status}: ${JSON.stringify(data)}`);
  assert.equal(data.token, '2026');

  await new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});
