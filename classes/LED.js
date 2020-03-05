class LED{
    constructor(index = -1, r = 0, g = 0, b = 0, brightness = 0){
        if(index < 0)
            throw `Cannot initialize LED with index:'${index}`;

        this.index = index;
        this.red = r;
        this.green = g;
        this.blue = b;
        this.brightness = brightness;
    }

    setColour(r,g,b,brightness){
        this.red = r;
        this.green = g;
        this.blue = b;
        this.brightness = brightness;
    }
}

module.exports = LED;