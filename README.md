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

## License

MIT