import t from 'transducers.js';

export default function(req, res) {
  var arr = JSON.parse(req.query.arr || '[]');
  res.send(t.map(arr, function(x) { return x + 1; }));
};
