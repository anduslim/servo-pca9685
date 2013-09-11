var servo = require('../');

var actuator = servo.connect(tessel.port('A'));
actuator.move(0);
actuator.once('move', function () {
  actuator.move(90);
  actuator.once('move', function () {
    actuator.move(180);
  });
})