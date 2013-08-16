var servo = require('../');

// Initialize the servo.
console.log("initalizing");

// Port A, servo 1, calibrate min/max PWM of 4-15
var cs61 = servo.port('A').connect(1, 4, 15);

var pos = 0;
setInterval(function () {
  console.log("Deg rotation:", pos);
  cs61.move(pos);

  // Increment by 45 deg
  pos += 45;
  if (pos > 180) {
    pos = 0;
  }
}, 1500);