# PCA9685 servo driver

Install:

```
npm install servo-pca9685
```

Import:

```
var servo = require('servo-pca9685');
```

API:

*  *actuator* = **`servo`.port('a').connect(1-16)**

*  **`servo`.setFrequency(hertz)** 

*  `actuator`.move(0-180)** 

*  `actuator` emits **("move", deg)**

Example:

```javascript
var actuator = servo.port('A').connect(1);
actuator.move(0);
actuator.once('move', function () {
  actuator.move(90);
  actuator.once('move', function () {
    actuator.move(180);
  });
})
```

## License

MIT