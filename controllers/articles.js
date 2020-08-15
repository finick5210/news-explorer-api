const Article = require('../models/article');
const {
  NotFoundError, AuthorizationError, ServerError, ValidationError,
} = require('../errors');
const { messages } = require('../constants/messages');

module.exports.getArticles = (req, res, next) => {
  Article.find({})
    .then((articles) => res.send({ data: articles }))
    .catch((err) => next(new ServerError(err.message)));
};

module.exports.createArticle = (req, res, next) => {
  const {
    keyword, title, text, date, source, link, image,
  } = req.body;
  const { _id } = req.user;

  Article.create({
    keyword, title, text, date, source, link, image, owner: _id,
  })
    .then((article) => res.send({ data: article }))
    .catch((err) => {
      next(err.name === 'ValidationError' ? new ValidationError(err.message) : new ServerError(err.message));
    });
};

module.exports.deleteArticle = (req, res, next) => {
  Article.findById(req.params.id)
    .then((article) => {
      if (!article) {
        throw new NotFoundError(messages.not_found_article);
      } if (article.owner.toString() !== req.user._id) {
        throw new AuthorizationError(messages.auth_delete_article, 403);
      }

      Article.deleteOne({ _id: article._id })
        .then(() => {
          res.send({ data: article });
        });
    })
    .catch(next);
};
