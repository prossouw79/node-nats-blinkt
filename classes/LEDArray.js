const LED = require('./LED');

class LEDArray{
    constructor(hostname){
        this.hostname = hostname;
        this.leds = [];
        for (let i = 0; i < 8; i++) {
            this.leds.push(new LED(i))
        }
    }

    setLED(index,red,green,blue,brightness){
        if(index > 7)
            throw `Cannot set LED with index:${index}`;

        this.leds[index].setColour(red,green,blue,brightness);
    }
}

module.exports = LEDArray;