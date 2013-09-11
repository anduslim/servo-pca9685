var tessel = require('tessel');

var servo = require('../').connect(tessel.port('a'));

servo.move(180);

var dgram = require('dgram');

var udp = dgram.createSocket('udp4');

udp.bind(3333);

udp.on('data', function (str) {
  servo.move(Number(str));
})