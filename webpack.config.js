var webpack = require('webpack');
var path = require('path');
var fs = require('fs');

var node_modules = {};
fs.readdirSync('node_modules')
  .filter(function(x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function(mod) {
    node_modules[mod] = 'commonjs ' + mod;
  });

console.log(node_modules);

module.exports = {
  entry: './src/main.js',
  target: 'node',
  output: {
    // library: 'poop',
    // libraryTarget: 'commonjs2',
    path: path.join(__dirname, 'build'),
    filename: 'backend.js'
  },
  module: {
    loaders: [
      {test: /\.json$/, loader: 'json'}
    ]
  },
  externals: node_modules,
  plugins: [
    new webpack.IgnorePlugin(/\.(css|less)$/),
    new webpack.BannerPlugin('require("source-map-support").install();',
                             { raw: true, entryOnly: false })
  ]
}
