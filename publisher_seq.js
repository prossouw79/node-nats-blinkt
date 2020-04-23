//parse .env file
require('dotenv').config();
const os = require('os');
const _ = require('lodash')
const keypress = require('keypress');

//setup nats connection using environment variables
const NATS = require('nats')
const nc = NATS.connect({
    servers: [`nats://${process.env.NATS_HOST}:${process.env.NATS_PORT}`],
    user: process.env.NATS_USERNAME,
    pass: process.env.NATS_PASSWORD
});

const LEDArray = require('./classes/LEDArray')


//#region nats events
// emitted whenever there's an error. if you don't implement at least
// the error handler, your program will crash if an error is emitted.
nc.on('error', (err) => {
    console.log(err)
})

// connect callback provides a reference to the connection as an argument
nc.on('connect', (nc) => {
    console.log(`connect to ${nc.currentServer.url.host}`)
})

// emitted whenever the client disconnects from a server
nc.on('disconnect', () => {
    console.log('disconnect')
})

// emitted whenever the client is attempting to reconnect
nc.on('reconnecting', () => {
    console.log('reconnecting')
})

// emitted whenever the client reconnects
// reconnect callback provides a reference to the connection as an argument
nc.on('reconnect', (nc) => {
    console.log(`reconnect to ${nc.currentServer.url.host}`)
})

// emitted when the connection is closed - once a connection is closed
// the client has to create a new connection.
nc.on('close', function () {
    console.log('close')
})

// emitted whenever the client unsubscribes
nc.on('unsubscribe', function (sid, subject) {
    console.log('unsubscribed subscription', sid, 'for subject', subject)
})

// emitted whenever the server returns a permission error for
// a publish/subscription for the current user. This sort of error
// means that the client cannot subscribe and/or publish/request
// on the specific subject
nc.on('permission_error', function (err) {
    console.error('got a permissions error', err.message)
})
//#endregion

const targetHostnames = ["pi1", "pi2", "pi3"] // set this to the hostnamces of the available machines
let overrideBrightness = 5;
let overrideRate = 1024;
let currentModel = [];

// make `process.stdin` begin emitting "keypress" events
keypress(process.stdin);

// listen for the "keypress" event
process.stdin.on('keypress', function (ch, key) {
  // CTRL + C stops the program
    if (key && key.ctrl && key.name == 'c') {
        console.log('Exiting.')
        process.exit(0)
    }
    if (key && key.name) {
        switch (key.name) {
            case 'up': {
                if (overrideBrightness < 100) {
                    overrideBrightness++;
                    console.log(`Brightness set to ${overrideBrightness}%`);
                    nc.publish(`led.brightness`, `${overrideBrightness / 100}`);
                }
                break;
            }

            case 'down': {
                if (overrideBrightness > 3) {
                    overrideBrightness--;
                    console.log(`Brightness set to ${overrideBrightness}%`);
                    nc.publish(`led.brightness`, `${overrideBrightness / 100}`);
                }
                break;
            }

            case 'right': {
                if (overrideRate > 1) {
                    overrideRate = Math.floor(overrideRate / 2);
                    console.log(`Update rate set to ${overrideRate}ms`);
                }
                break;
            }

            case 'left': {
                if (overrideRate < 1023) {
                    overrideRate = Math.floor(overrideRate * 2);;
                    console.log(`Update rate set to ${overrideRate}ms`);
                }
                break;
            }

            default:
                break;
        }
    }
});

let standardColours = [
    {
        r: 255,
        g: 0,
        b: 0
    },
    {
        r: 255,
        g: 128,
        b: 0
    },
    {
        r: 255,
        g: 255,
        b: 0
    },
    {
        r: 128,
        g: 255,
        b: 0
    },
    {
        r: 0,
        g: 255,
        b: 0
    },
    {
        r: 0,
        g: 255,
        b: 128
    },
    {
        r: 0,
        g: 255,
        b: 255
    },
    {
        r: 0,
        g: 128,
        b: 255
    },
    {
        r: 0,
        g: 0,
        b: 255
    },
    {
        r: 128,
        g: 0,
        b: 255
    },
    {
        r: 255,
        g: 0,
        b: 255
    },
    {
        r: 255,
        g: 0,
        b: 128
    }
];


process.stdin.setRawMode(true);
process.stdin.resume();

function randomRGB() {
    return {
        r: _.random(0, 255),
        g: _.random(0, 255),
        b: _.random(0, 255)
    }
}

let randomColour = false;

function updateAllHosts() {
    //call this function again in x ms
    setTimeout(updateAllHosts, overrideRate);

    if (currentModel.length > 0) {
        currentModel.forEach(host => {

            if (randomColour) {
                let colour = randomRGB()
                host.addFront(colour.r, colour.g, colour.b, 0.05);
            } else {
                let colour = _.sample(standardColours);
                host.addFront(colour.r, colour.g, colour.b, 0.05);
            }

            updateLEDs(host);
        });
    } else {
        currentModel = targetHostnames.map(hostname => {
            //initialize model for this host
            let array = new LEDArray(hostname);
            for (let i = 0; i < 8; i++) {
                let r = 0;
                let g = 0;
                let b = 0;
                let brightness = 0.05;
                array.setLED(i, r, g, b, brightness);
            }
            return array;
        })
    }


}
updateAllHosts();

function updateLEDs(model) {
    console.log("Sending model:", model)
    nc.publish(`ledseq.${model.hostname}`, JSON.stringify(model))
}
