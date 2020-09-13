const rateLimiter = require('express-rate-limit');
const { messages } = require('../constants/messages');

const limiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: messages.rate_limit,
});

module.exports = limiter;
