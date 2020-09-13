require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { errors } = require('celebrate');
const auth = require('./middlewares/auth');
const { users, articles, authorization } = require('./routes');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const limiter = require('./middlewares/rate-limiter');

const { PORT = 3000 } = process.env;

const whitelist = [
  'http://news-explorer-yandex.tk',
  'http://www.news-explorer-yandex.tk',
  'https://news-explorer-yandex.tk',
  'https://www.news-explorer-yandex.tk',
];
const corsOptions = {
  origin(origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

const app = express();
app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(helmet());
app.use(limiter);

const { NODE_ENV, MONGO_ADDRESS } = process.env;

mongoose.connect(NODE_ENV === 'production' ? MONGO_ADDRESS : 'mongodb://localhost:27017/newsdb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.use(requestLogger);

app.use('/', authorization);

app.use(auth);

app.use('/users', users);
app.use('/articles', articles);

app.use(errorLogger);

app.use(errors());

app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({ message: statusCode === 500 ? 'Unexpected server error' : message });
  next();
});

app.listen(PORT);
