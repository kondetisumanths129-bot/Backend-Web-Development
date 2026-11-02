'use strict';

require('dotenv').config();

const express = require('express');
const { users } = require('./data');
const { signToken } = require('./utils/jwt');
const requireAuth = require('./middleware/requireAuth');
const requireRole = require('./middleware/requireRole');
const postsRoutes = require('./routes/posts');

const app = express();
app.use(express.json());

app.post('/auth/login', (req, res) => {
  const id = req.body.id || req.body.userId;
  const user = users.find((item) => item.id === id);
  const role = user ? user.role : req.body.role;
  if (!id || !role) {
    return res.status(400).json({ error: { code: 'INVALID_LOGIN', message: 'id and role are required' } });
  }
  res.json({ accessToken: signToken({ sub: id, role }) });
});

app.use('/posts', postsRoutes);

app.delete('/users/:id', requireAuth, requireRole('admin'), (req, res) => {
  const index = users.findIndex((user) => user.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'User not found' } });
  users.splice(index, 1);
  res.json({ ok: true });
});

const port = process.env.PORT || 3000;
if (require.main === module) app.listen(port, () => console.log(`Server running on http://localhost:${port}`));

module.exports = app;