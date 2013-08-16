var tm = process.binding('tm');

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

// servo: 1... 16
// on: 1...100% of time that the servo is on
function setPWM(servo, on){
  console.log(servo, on);
  if (servo < 1 || servo > 16) {
    throw "Hey, servos are 1 indexed! Servos can be between 1...16";
  }
  var convert_on = 0;
  var convert_off = Math.floor(MAX/100*on);

  write_register(LED0_ON_L+(servo-1)*4, convert_on);
  write_register(LED0_ON_H+(servo-1)*4, convert_on>>8);

  write_register(LED0_OFF_L+(servo-1)*4, convert_off);
  write_register(LED0_OFF_H+(servo-1)*4, convert_off>>8);
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

// 0...1
function setPosition (i, val) {
  setPWM(i, (val * (exports.upper - exports.lower)) + exports.lower);
}

function initialize (next)
{
  tm.i2c_initialize(tm.I2C_1);
  tm.i2c_master_enable(tm.I2C_1);
  console.log("Starting up PCA9685...");

  setFrequency(50);
}

exports.lower = 4;
exports.upper = 15;
exports.initialize = initialize;
exports.setPWM = setPWM;
exports.setFrequency = setFrequency;
exports.setPosition = setPosition;