const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const {
  AuthorizationError,
} = require('../errors');
const { messages } = require('../constants/messages');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
    trim: true,
    validate: {
      validator(about) {
        return !validator.isEmpty(about);
      },
      message: (props) => `${props.value} ${messages.not_valid_name}`,
    },
  },
  email: {
    type: String,
    required: true,
    validate: {
      validator(email) {
        return validator.isEmail(email);
      },
      message: (props) => `${props.value} ${messages.not_valid_email}`,
    },
    unique: true,
  },
  password: {
    type: String,
    minlength: 4,
    required: true,
    select: false,
    trim: true,
  },
});

userSchema.statics.findUserByCredentials = function findUserByCredentials(email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new AuthorizationError(messages.incorrect_email_or_password));
      }

      return bcrypt.compare(password, user.password)
        .then((matched) => {
          if (!matched) {
            return Promise.reject(new AuthorizationError(messages.incorrect_email_or_password));
          }

          return user;
        });
    });
};

module.exports = mongoose.model('user', userSchema);
