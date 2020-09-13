const allowedDomains = [
  'https://www.news-explorer-yandex.tk',
  'http://www.news-explorer-yandex.tk',
  'https://news-explorer-yandex.tk',
  'https://news-explorer-yandex.tk',
  'http://localhost:8080',
];


const cors = (req, res, next) => {
  if (req.headers.origin && allowedDomains.includes(req.headers.origin)) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
  } else {
    res.header('Access-Control-Allow-Origin', 'https://news-explorer-yandex.tk');
  }

  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers, Authorization');
  next();
};

module.exports = cors;