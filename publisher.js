//parse .env file
require('dotenv').config();
const os = require('os')
const LEDArray = require('./classes/LEDArray')
const _ = require('lodash')
const keypress = require('keypress');

//setup nats
const NATS = require('nats')
const nc = NATS.connect({
    servers: [`nats://${process.env.NATS_HOST}:${process.env.NATS_PORT}`],
    user: process.env.NATS_USERNAME,
    pass: process.env.NATS_PASSWORD
});

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

const targetHostnames = ["hackathon-pi-1", "hackathon-pi-2", "hackathon-pi-3"]
let overrideBrightness = 0;

// make `process.stdin` begin emitting "keypress" events
keypress(process.stdin);

// listen for the "keypress" event
process.stdin.on('keypress', function (ch, key) {
    if(key.ctrl && key.name == 'c'){
        console.log('Exiting.')
        process.exit(0)
    }
    switch (key.name) {
        case 'up': {
            if (overrideBrightness < 100) {
                overrideBrightness++;
                console.log('Brightness set to', overrideBrightness);
                nc.publish(`led.brightness`, `${overrideBrightness}`);
            }


            break;
        }

        case 'down': {
            if (overrideBrightness > 0) {
                overrideBrightness--;
                console.log('Brightness set to', overrideBrightness);
                nc.publish(`led.brightness`, `${overrideBrightness}`);
            }
            break;
        }

        default:
            break;
    }
});

process.stdin.setRawMode(true);
process.stdin.resume();

setInterval(() => {
    targetHostnames.forEach(hostname => {
        let model = new LEDArray(hostname);
        for (let i = 0; i < 8; i++) {
            let r = _.random(0, 255);
            let g = _.random(0, 255);
            let b = _.random(0, 255);
            // let brightness = _.random(0.05, 1.0);
            let brightness = 0.05;
            model.setLED(i, r, g, b, brightness);
        }
        updateLEDs(model)
    });
}, 100);

function updateLEDs(model) {
    nc.publish(`led.${model.hostname}`, JSON.stringify(model))
}
