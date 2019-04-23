require('dotenv').config({ path: '../../.env' });
const socket = require('socket.io-client')('http://localhost:3000');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const mongoose = require('mongoose');

/*
* DB Connection
*/
let userAndPass = '';
if (process.env.MONGO_USER != '') {
    userAndPass = process.env.MONGO_USER + ':' + process.env.MONGO_USER_PASS + '@';
}

mongoose.connect('mongodb://' + userAndPass + process.env.MONGO_HOST + ':' + process.env.MONGO_PORT + '/' + process.env.MONGO_SCHEMA, { useCreateIndex: true, useNewUrlParser: true }, (err, response) => {
    if (err) {
        console.log("Erro in connect db: ", err);
    } else {
        console.log("Connection has been added: mongoDB server");
    }
});


/*
* DB Models
*/
require('../../models/Sensors');


/*
* Parser
*/
const port = new SerialPort(process.env.USB_PORT, { baudRate: parseInt(process.env.USB_RATE) });
const parser = port.pipe(new Readline());


/*
* Functions
*/
const functions = require('./functions');

port.on('error', (err) => {
    console.log('Error: ', err.message);
});

port.on('open', () => {
    //starting the service with ping
    port.write(functions.requestFunction(2));
});

parser.on('data', (line) => {
    line = JSON.parse(line);
    
    if("action" in line){
        //model -> {"action":2,"response":[{"id":"S1","configs":[1000,-1]}]}
        switch (line.action) {
            case 2:
                functions.responseFunctions(2, line.response, socket.emit('action', 2));
        }
    }else{
        socket.emit('read', line);
        console.log('Sendo room(read): ', line);
    }
});

socket.on('connect', () => {
    /*if (!port.isOpen) {
        port.open();
    }*/
});

socket.on('disconnect', () => {
    //port.close();
});