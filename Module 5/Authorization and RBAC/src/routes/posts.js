'use strict';

const router = require('express').Router();
const { posts } = require('../data');
const requireAuth = require('../middleware/requireAuth');
const requireRole = require('../middleware/requireRole');

const privilegedRoles = ['moderator', 'admin'];

function findPost(req, res) {
  const post = posts.find((item) => item.id === req.params.id);
  if (!post) {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Post not found' } });
    return null;
  }
  return post;
}

function canModify(post, user) {
  return post.authorId === user.id || privilegedRoles.includes(user.role);
}

router.patch('/:id', requireAuth, (req, res) => {
  const post = findPost(req, res);
  if (!post) return;
  if (!canModify(post, req.user)) {
    return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'You cannot modify this post' } });
  }
  Object.assign(post, req.body);
  res.json(post);
});

router.delete('/:id', requireAuth, (req, res) => {
  const post = findPost(req, res);
  if (!post) return;
  if (!canModify(post, req.user)) {
    return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'You cannot modify this post' } });
  }
  posts.splice(posts.indexOf(post), 1);
  res.json({ ok: true });
});

router.post('/:id/hide', requireAuth, requireRole('moderator', 'admin'), (req, res) => {
  const post = findPost(req, res);
  if (!post) return;
  post.hidden = true;
  res.json(post);
});

module.exports = router;