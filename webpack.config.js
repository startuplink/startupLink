const path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const MinifyPlugin = require('babel-minify-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const GenerateJsonPlugin = require('generate-json-webpack-plugin');
const ZipPlugin = require('zip-webpack-plugin');
const webpack = require('webpack');
const merge = require('webpack-merge');


const extractPlugin = new ExtractTextPlugin({ filename: './popup/startupLinkPopup.css' });

module.exports = function (env) {
  const [mode, browser, benchmark, firefoxBeta] = Object.keys(env)[0].split(':');
  let version = require('./manifest/common.json').version;
  if (firefoxBeta) {
    version += 'beta';
  }

  const config = {
    entry: {
      popup: "./popup/startupLinkPopup.js"
    },
    output: {
      path: path.resolve(__dirname, "addon_" + browser),
      filename: "[name]/index.js"
    },
    module: {
      rules: [
        {
          test: /\.html$/,
          use: ['html-loader']
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    plugins: [
      new webpack.optimize.ModuleConcatenationPlugin(),
      new CopyWebpackPlugin([
        {
          from: 'static'
        }
      ]),
      new GenerateJsonPlugin('manifest.json', merge(
        require('./manifest/common.json'),
        require(`./manifest/${browser}.json`)
      ), null, 2),
      new HtmlWebpackPlugin({
        inject: false,
        hash: true,
        template: './popup/startupLinkPopup.html',
        filename: 'popup/startupLinkPopup.html'
      }),
      new ZipPlugin({
        filename: `addon_${browser}.zip`,
      }),
    ]
  }

  const browserDefines = {
    'BROWSER': JSON.stringify(browser),
    'CHROME': JSON.stringify(browser === 'chrome'),
    'FIREFOX': JSON.stringify(browser === 'firefox'),
  };


  if (mode === 'prod') {
    config.plugins = config.plugins.concat([
      new MinifyPlugin(),
      new webpack.DefinePlugin(Object.assign({
        'process.env.NODE_ENV': JSON.stringify('production'),
        'DEBUG': JSON.stringify(false),
        'VERSION': JSON.stringify(version),
        'BENCHMARK': JSON.stringify(true)
      }, browserDefines))
    ]);
  } else {
    config.plugins = config.plugins.concat([
      new webpack.DefinePlugin(Object.assign({
        'process.env.NODE_ENV': JSON.stringify('development'),
        'DEBUG': JSON.stringify(true),
        'VERSION': JSON.stringify(version + ' dev'),
        'BENCHMARK': JSON.stringify(benchmark === 'benchmark')
      }, browserDefines))
    ]);
  }

  return config;
};
