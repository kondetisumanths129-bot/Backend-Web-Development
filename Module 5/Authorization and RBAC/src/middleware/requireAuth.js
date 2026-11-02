'use strict';

const { verifyToken } = require('../utils/jwt');

function requireAuth(req, res, next) {
  const match = (req.headers.authorization || '').match(/^Bearer (.+)$/i);
  if (!match) {
    return res.status(401).json({
      error: { code: 'UNAUTHENTICATED', message: 'Bearer token required' },
    });
  }

  try {
    const payload = verifyToken(match[1]);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch {
    return res.status(401).json({
      error: { code: 'UNAUTHENTICATED', message: 'Invalid or expired token' },
    });
  }
}

module.exports = requireAuth;