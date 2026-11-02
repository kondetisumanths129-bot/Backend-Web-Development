'use strict';

const jwt = require('jsonwebtoken');

function secret() {
  return process.env.ACCESS_SECRET || 'lu51-test-secret';
}

function signToken(payload) {
  return jwt.sign(payload, secret(), { expiresIn: '15m' });
}

function verifyToken(token) {
  return jwt.verify(token, secret());
}

module.exports = { signToken, verifyToken };