var tm = process.binding('tm');
var EventEmitter = require('tessel').EventEmitter;

// address bit is 111xy11 where x is controlled by GPIO2 and y is controlled by GPIO1
// by default x and y will be 0
// used http://www.nxp.com/documents/data_sheet/PCA9685.pdf as a reference
var ADDRESS = 0x73;
var LED0_ON_L = 0x06;
var LED0_ON_H = 0x07;
var LED0_OFF_L = 0x08;
var LED0_OFF_H = 0x09;
var MAX = 4096;
var MODE1 = 0x0;
var PRE_SCALE = 0xFE;

function read_registers (addressToRead, bytesToRead)
{
  return tm.i2c_master_request_blocking(tm.I2C_1, ADDRESS, [addressToRead], bytesToRead);
}

function read_register (addressToRead)
{
  return read_registers(addressToRead, 1)[0];
}

// Write a single byte to the register.

function write_register (addressToWrite, dataToWrite)
{
  tm.i2c_master_send_blocking(tm.I2C_1, ADDRESS, [addressToWrite, dataToWrite]);
}

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

// sets the driver frequency. freq has units of Hz
function setFrequency (freq) {
  var prescaleval = (25000000/MAX)/freq - 1;
  var prescale = Math.floor(prescaleval); 
  
  var oldmode = read_register(MODE1);
  // gotta sleep it before we can change the prescale
  var newmode = oldmode | 0x10;
  write_register(MODE1, newmode);
  write_register(PRE_SCALE, prescale); 
  write_register(MODE1, oldmode);
  tm.sleep_ms(100);

  write_register(MODE1, 0xa1);
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
Servo.prototype.move = function (val) {
  this.setPWM(((val/180) * (this.high - this.low)) + this.low);
  
  // TODO async I2C
  var servo = this;
  setImmediate(function () {
    servo.emit('move');
  })
};

// servo: 1... 16
// on: 1...100% of time that the servo is on
Servo.prototype.setPWM = function (on) {
  var convert_on = 0;
  var convert_off = Math.floor(MAX/100*on);

  write_register(LED0_ON_L+(this.idx-1)*4, convert_on);
  write_register(LED0_ON_H+(this.idx-1)*4, convert_on>>8);

  write_register(LED0_OFF_L+(this.idx-1)*4, convert_off);
  write_register(LED0_OFF_H+(this.idx-1)*4, convert_off>>8);
}

exports.port = function () {
  return {
    connect: function (idx, low, high) {
      var servo = new Servo(idx, low, high);

      tm.i2c_initialize(tm.I2C_1);
      tm.i2c_master_enable(tm.I2C_1);
      console.log("Starting up PCA9685...");

      setFrequency(50);
      return servo;
    }
  }
}

exports.connect = connect;
exports.setFrequency = setFrequency;
exports.Servo = Servo;