const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const validator = require('validator');
const { getArticles, createArticle, deleteArticle } = require('../controllers/articles');
const {
  ValidationError,
} = require('../errors');
const { messages } = require('../constants/messages');

router.get('/', getArticles);

router.post('/', celebrate({
  body: Joi.object().keys({
    keyword: Joi.string().required(),
    title: Joi.string().required(),
    text: Joi.string().required(),
    date: Joi.string().required(),
    source: Joi.string().required(),
    link: Joi.string().required().custom((value) => {
      if (validator.isURL(value)) {
        return value;
      }
      throw new ValidationError(`${value} ${messages.not_valid_url}`);
    }),
    image: Joi.string().required().custom((value) => {
      if (validator.isURL(value)) {
        return value;
      }
      throw new ValidationError(`${value} ${messages.not_valid_url}`);
    }),
  }),
}), createArticle);

router.delete('/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().hex().length(24),
  }),
}), deleteArticle);

module.exports = router;
