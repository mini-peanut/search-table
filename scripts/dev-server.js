const history = require('connect-history-api-fallback');
const path = require('path');
const express = require('express');
const webpack = require('webpack');

const port = '1234';
const app = express();
const webpackConfig = require('./webpack.config.dev');
const compiler = webpack(webpackConfig);

app.use(
  history({
    rewrites: [{ from: /\w+\.html/, to: '/' }]
  })
);

const devMiddleware = require('webpack-dev-middleware')(compiler, {
  publicPath: webpackConfig.output.publicPath
});
app.use(require('webpack-hot-middleware')(compiler));
app.use(devMiddleware);

app.use(path.posix.join('', '/'), express.static('./static'));

const uri = 'http://localhost:' + port;

devMiddleware.waitUntilValid(() => {
  console.log('> Listening at ' + uri + '\n')
});

app.listen(port, err => {
  if (err) {
    console.log(err);
  }
});
