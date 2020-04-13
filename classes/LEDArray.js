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

    addFront(red,green,blue,brightness){
        let addedLED = new LED(0);
        addedLED.setColour(red,green,blue,brightness);
        let tmp = [addedLED];

        for (let i = 0; i < (this.leds.length - 1); i++) {
            let led = this.leds[i];
            led.index = led.index +1;
            tmp.push(led);
        }

        this.leds = tmp;
    }
}

module.exports = LEDArray;