var servo = require('../');

// Initialize the servo.
console.log("initalizing");

var cs61 = servo.port('A').connect(1, 4, 15);

var pos = 0;
setInterval(function () {
  console.log("Position float:", pos);
  cs61.move(pos);
  pos += 45;
  if (pos > 180) {
    pos = 0;
  }
}, 1500);