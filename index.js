// address bit is 111xy11 where x is controlled by GPIO2 and y is controlled by GPIO1
// by default x and y will be 0
// used http://www.nxp.com/documents/data_sheet/PCA9685.pdf as a reference

var tessel = require('tessel');
var EventEmitter = require('tessel').EventEmitter;

//
// I2C Configuration
//

var I2C_ADDRESS = 0x73;
var LED0_ON_L = 0x06;
var LED0_ON_H = 0x07;
var LED0_OFF_L = 0x08;
var LED0_OFF_H = 0x09;
var MAX = 4096;
var MODE1 = 0x0;
var PRE_SCALE = 0xFE;

var i2c = tessel.i2c(I2C_ADDRESS);

function readRegister (register, next) {
  i2c.request([register], 1, function (err, data) {
    next(err, data[0]);
  });
}

function writeRegister (register, data, next) {
  i2c.send([register, data], next)
}

/**
 * Frequency
 */

// sets the driver frequency. freq has units of Hz
function setFrequency (freq, next) {
  var prescaleval = (25000000/MAX)/freq - 1;
  var prescale = Math.floor(prescaleval); 
  
  readRegister(MODE1, function (err, oldmode) {
    // gotta sleep it before we can change the prescale
    var newmode = oldmode | 0x10;
    writeRegister(MODE1, newmode);
    writeRegister(PRE_SCALE, prescale); 
    writeRegister(MODE1, oldmode, function () {
      // Delay 100ms
      setTimeout(function () {
        writeRegister(MODE1, 0xa1);
        next && next();
      }, 100)
    });
  });
}

function Servo (idx, low, high) {
  if (idx < 1 || idx > 16) {
    throw "Servos are 1-indexed. Servos can be between 1-16.";
  }
  this.idx = idx;
  this.low = low || 5;
  this.high = high || 15;
}

Servo.prototype = new EventEmitter();

// 0...180
Servo.prototype.move = function (val, next) {
  var servo = this;
  // servo.onconnect(function () {
    this.setPWM(((val/180) * (this.high - this.low)) + this.low, function () {
      // this.emit('move'); TODO
      next && next();
    });
  // });
};

// Servo.prototype.onconnect = function (fn) {
//   if (!this._connected) {
//     this.on('connect', fn);
//   } else {
//     fn();
//   }
// };

// servo: 1... 16
// on: 1...100% of time that the servo is on
Servo.prototype.setPWM = function (on, next) {
  var convert_on = 0;
  var convert_off = Math.floor(MAX/100*on);

  // Queue writes
  writeRegister(LED0_ON_L+(this.idx-1)*4, convert_on);
  writeRegister(LED0_ON_H+(this.idx-1)*4, convert_on>>8);
  writeRegister(LED0_OFF_L+(this.idx-1)*4, convert_off);
  writeRegister(LED0_OFF_H+(this.idx-1)*4, convert_off>>8, next);
}

function port (id) {
  return {
    connect: function (idx, low, high) {
      i2c.initialize();

      var servo = new Servo(idx, low, high);
      setFrequency(50, function () {
        servo._connected = true;
        servo.emit('connected');
      });
      return servo;
    }
  }
}

//
// Reading
//

// TODO: fix this
// function read_servo(servo){
//   var on_low = read_register(LED0_ON_L+(servo-1)*4);
//   var on_high = read_register(LED0_ON_H+(servo-1)*4)>>8;
//   console.log("on_low: ", on_low, " on_high: ", on_high);
//   var on = on_low + on_high;
//   var off_low = read_register(LED0_OFF_L+(servo-1)*4);
//   var off_high = read_register(LED0_OFF_H+(servo-1)*4)>>8;
//   console.log("off_low: ", off_low, " off_high: ", off_high);

//   var off = off_low + off_high;

//   console.log("Servo: ", servo, " on: ", on, " off: ", off);
// }


//
// Public API
//

exports.port = port;
exports.setFrequency = setFrequency;
exports.Servo = Servo;