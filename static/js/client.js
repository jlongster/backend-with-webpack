
let canvas, ctx;

let vec2 = {
  sub: function (a, b) {
    return [a[0] - b[0], a[1] - b[1]];
  },

  length: function(a) {
    return Math.sqrt(a[0]*a[0] + a[1]*a[1]);
  }
};

export function register(socket) {
  init();
  socket.on('data', draw);

  window.addEventListener('mousemove', e => {
    let data = [e.clientX, e.clientY];
    socket.emit('data', data);
  });
}

function init() {
  canvas = document.querySelector('canvas');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  ctx = canvas.getContext('2d');
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function draw(data) {
  let color = data.color;
  let point = data.point;
  let lastPoint = data.lastPoint;

  if(data.lastPoint) {
    let len = vec2.length(vec2.sub(point, lastPoint));
    let width = Math.pow(.9, len) * 30;

    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(lastPoint[0], lastPoint[1]);
    ctx.lineTo(point[0], point[1]);
    ctx.stroke();
  }
}

function __eval() {
  // ctx.fillStyle = 'black';
  // ctx.fillRect(0, 0, canvas.width, canvas.height);
}
