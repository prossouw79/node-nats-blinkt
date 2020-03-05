//parse .env file
require('dotenv').config();
const os = require('os')
const LEDArray = require('./classes/LEDArray')

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

let model = new LEDArray("hackathon-pi-1");
for (let i = 0; i < 8; i++) {
    model.setLED(i,50,50,50,0.2);    
}
updateLEDs(model)


function updateLEDs(model){
    nc.publish(`led.${model.hostname}`, JSON.stringify(model))
}
