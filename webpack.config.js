var webpack = require('webpack');
var path = require('path');
var fs = require('fs');

var blacklist = ['.bin'];
var node_modules = fs.readdirSync('node_modules').filter(
  function(x) { return blacklist.indexOf(x) === -1; }
);

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
  externals: function(context, request, cb) {
    if(node_modules.indexOf(request) !== -1) {
      cb(null, 'commonjs ' + request);
      return;
    }
    cb();
  },
  plugins: [
    new webpack.IgnorePlugin(/\.(css|less)$/),
    new webpack.BannerPlugin('require("source-map-support").install();',
                             { raw: true, entryOnly: false })
  ]
}
