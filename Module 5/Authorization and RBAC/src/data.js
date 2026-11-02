'use strict';

const users = [
  { id: 'u-A', role: 'member' },
  { id: 'u-B', role: 'member' },
  { id: 'u-M', role: 'moderator' },
  { id: 'u-admin', role: 'admin' },
];

const posts = [
  { id: '1', authorId: 'u-A', title: 'First post', hidden: false },
  { id: '2', authorId: 'u-B', title: 'Second post', hidden: false },
];

module.exports = { users, posts };