var servo = require('../');

// Initialize the accelerometer.
console.log("initalizing");
servo.initialize();
console.log("done initalizing");

console.log("set first pwm");
while(true){
  // go from 0 to 100% duty cycle
  for (var i = 0; i<100; i++){
    console.log("duty cycle: ", i);
    servo.set_pwm(1, i);
  } 
  
}