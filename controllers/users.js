const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { messages } = require('../constants/messages');

const {
  NotFoundError, ValidationError, ServerError, AuthorizationError, ConflictError,
} = require('../errors');

module.exports.createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name,
      email,
      password: hash,
    }))
    .then(() => res.send({
      name,
      email,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new ValidationError(err.message));
      }
      if (err.name === 'MongoError' && err.code === 11000) {
        return next(new ConflictError(err.message));
      }
      return next(new ServerError(err.message));
    });
};

module.exports.getUser = (req, res, next) => {
  const { _id } = req.user;
  User.findById(_id)
    .then((user) => {
      if (!user) {
        throw new NotFoundError(messages.not_found_user);
      }
      res.send({
        data: {
          email: user.email,
          name: user.name,
        },
      });
    })
    .catch(next);
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const { NODE_ENV, JWT_SECRET } = process.env;

      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );

      res
        .cookie('token', token, {
          httpOnly: true,
          maxAge: 3600000 * 24 * 7,
        });

      return res.send({ token });
    })
    .catch((err) => next(new AuthorizationError(err.message)));
};
