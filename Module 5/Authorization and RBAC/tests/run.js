'use strict';

process.env.ACCESS_SECRET = 'lu51-test-secret';

const http = require('http');
const app = require('../src/app');
const { signToken } = require('../src/utils/jwt');

let passed = 0;
let failed = 0;
function assert(label, condition) {
  if (condition) { console.log(`  ✓ ${label}`); passed++; }
  else { console.error(`  ✗ ${label}`); failed++; }
}
function request(method, path, token, body) {
  return new Promise((resolve) => {
    const payload = body ? JSON.stringify(body) : '';
    const req = http.request({ hostname: 'localhost', port: 3001, method, path,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) } }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let body;
        try { body = JSON.parse(data); } catch { body = data; }
        resolve({ status: res.statusCode, body });
      });
    });
    req.end(payload);
  });
}
function token(id, role) { return signToken({ sub: id, role }); }

const server = app.listen(3001, async () => {
  const memberA = token('u-A', 'member');
  const memberB = token('u-B', 'member');
  const moderator = token('u-M', 'moderator');
  const admin = token('u-admin', 'admin');

  const ownEdit = await request('PATCH', '/posts/1', memberA, { title: 'updated' });
  assert('owner edits own post', ownEdit.status === 200);
  const foreignEdit = await request('PATCH', '/posts/1', memberB, { title: 'blocked' });
  assert('member cannot edit another user post', foreignEdit.status === 403 && foreignEdit.body.error.code === 'FORBIDDEN');
  const moderatorDelete = await request('DELETE', '/posts/2', moderator);
  assert('moderator deletes any post', moderatorDelete.status === 200);
  const memberHide = await request('POST', '/posts/1/hide', memberA);
  assert('member cannot hide post', memberHide.status === 403);
  const moderatorHide = await request('POST', '/posts/1/hide', moderator);
  assert('moderator hides post', moderatorHide.status === 200);
  const memberAdminDelete = await request('DELETE', '/users/u-A', memberA);
  assert('member cannot delete users', memberAdminDelete.status === 403);
  const adminDelete = await request('DELETE', '/users/u-B', admin);
  assert('admin deletes users', adminDelete.status === 200);
  const missing = await request('PATCH', '/posts/999', memberA, { title: 'missing' });
  assert('missing post returns 404 before ownership check', missing.status === 404);
  const unauthenticated = await request('PATCH', '/posts/1', null, { title: 'blocked' });
  assert('protected route without token returns 401', unauthenticated.status === 401);
  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  server.close();
  process.exit(failed ? 1 : 0);
});