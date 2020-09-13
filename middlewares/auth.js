const jwt = require('jsonwebtoken');
const { AuthorizationError } = require('../errors');
const { messages } = require('../constants/messages');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new AuthorizationError(messages.auth));
  }

  const token = authorization.replace('Bearer ', '');
  let payload;

  try {
    const { NODE_ENV, JWT_SECRET } = process.env;
    payload = jwt.verify(token, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret');
  } catch (err) {
    return next(new AuthorizationError(messages.auth));
  }

  req.user = payload;

  return next();
};
