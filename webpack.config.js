var webpack = require('webpack');
var path = require('path');
var fs = require('fs');

var nodeModules = {};
Object.keys(require('./package.json').dependencies).forEach(x => nodeModules[x] = 'commonjs ' + x);

module.exports = {
  entry: './src/main.js',
  target: 'node',
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'backend.js'
  },
  externals: nodeModules,
  plugins: [
    new webpack.IgnorePlugin(/\.(css|less)$/),
    new webpack.BannerPlugin('require("source-map-support").install();',
                             { raw: true, entryOnly: false })
  ],
  devtool: 'sourcemap'
}
