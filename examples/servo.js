var servo = require('../');

// Initialize the servo.
console.log("initalizing");
servo.initialize();


var pos = 0;
setInterval(function () {
  console.log("Position float:", pos);
  servo.setPosition(1, pos);
  pos += .025;
  if (pos > 1.0) {
    pos = 0;
  }
}, 150);