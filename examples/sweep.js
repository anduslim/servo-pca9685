var servo = require('../');

var actuator = servo.port('A').connect(1);
actuator.move(0);
actuator.once('move', function () {
  actuator.move(90);
  actuator.once('move', function () {
    actuator.move(180);
  });
})