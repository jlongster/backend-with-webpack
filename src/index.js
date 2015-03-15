var t = require('transducers.js');

module.exports = function(req, res) {
  var arr = JSON.parse(req.query.arr || '[]');
  res.send(t.map(arr, function(x) { return x + 1; }));
};
