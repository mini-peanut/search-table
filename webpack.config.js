/* eslint no-param-reassign: 0 */
// This config is for building dist files
const getWebpackConfig = require('antd-tools/lib/getWebpackConfig');
const PacktrackerPlugin = require('@packtracker/webpack-plugin');

const { webpack } = getWebpackConfig;

// noParse still leave `require('./locale' + name)` in dist files
// ignore is better: http://stackoverflow.com/q/25384360
function ignoreMomentLocale(webpackConfig) {
  delete webpackConfig.module.noParse;
  webpackConfig.plugins.push(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/));
}

function addLocales(webpackConfig) {
  let packageName = 'searchTable-with-locales';
  webpackConfig.entry[packageName] = './index-with-locales.js';
  webpackConfig.output.filename = '[name].js';
}

function externalMoment(config) {
  config.externals.moment = {
    root: 'moment',
    commonjs2: 'moment',
    commonjs: 'moment',
    amd: 'moment',
  };
}

const webpackConfig = getWebpackConfig(false);
if (process.env.RUN_ENV === 'PRODUCTION') {
  webpackConfig.forEach(config => {
    ignoreMomentLocale(config);
    externalMoment(config);
    addLocales(config);
    // https://docs.packtracker.io/uploading-your-webpack-stats/webpack-plugin
    config.plugins.push(
      new PacktrackerPlugin({
        project_token: 'cb67cfe6-c8e8-4b2e-bd2a-6f8d541efd90',
        upload: process.env.CI === 'true',
        fail_build: true,
        exclude_assets: name => !['search-table.min.js', 'search-table.min.css'].includes(name),
      }),
    );
  });
}

module.exports = webpackConfig;
