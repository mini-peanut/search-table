const path = require('path');
const webpack = require('webpack');
const ProgressBarPlugin = require('progress-bar-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const devConfig = {
  mode: 'development',
  devtool: 'source-map',
  entry: [
    'webpack-hot-middleware/client?noInfo=true&reload=true',
    path.join(__dirname, '../example/index.js')
  ],
  output: {
    filename: '[name].js',
    path: path.join(__dirname, './dist'),
    publicPath: '/'
  },
  resolve: {
    extensions: [
      '.js',
      '.jsx',
      '.ts',
      '.tsx',
      '.css',
      '.less',
      '.png',
      '.jpg',
      'json'
    ]
  },
  module: {
    rules: [
      {
        test: /\.(tsx|ts)?$/,
        exclude: /node_modules/,
        loader: ['babel-loader', 'ts-loader']
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      },
      {
        test: /(\.less)$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader']
      },
      {
        test: /\.(svg|woff2?|ttf|eot|jpe?g|png|gif)(\?.*)?$/i,
        exclude: /node_modules/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 1024,
            name: 'img/[sha512:hash:base64:7].[ext]'
          }
        }
      }
    ]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new ProgressBarPlugin({ summary: false }),
    new MiniCssExtractPlugin({
      filename: `static/css/main.css`
    }),
    new HtmlWebpackPlugin({
      title: 'wui',
      filename: 'index.html',
      template: path.join(__dirname, '../example/index.html'),
      inject: true
    })
  ]
};

module.exports = devConfig;
