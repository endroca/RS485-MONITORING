require('dotenv').config({ path: '../../.env' });
const net = require('net');
const defaultGateway = require('default-gateway');
const readline = require('readline');
const mongoose = require('mongoose');
const socket = require('socket.io-client')('http://localhost:3000');

const IPGateway = defaultGateway.v4.sync();

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
* Functions
*/
const functions = require('./functions');

/*
* Connection and Parser
*/
const client = new net.Socket();
const line = readline.createInterface(client, client);


client.connect(80, IPGateway.gateway, () => {
    client.write(functions.requestFunction(2));
});


line.on('line', ($line) => {
    try{
        line = JSON.parse($line);
    }catch(e){
        console.log($line);
    }
    
    console.log(line);

    if ("action" in line) {
        //model -> {"action":2,"response":[{"id":"S1","configs":[1000,-1]}]}
        switch (line.action) {
            case 2:
                functions.responseFunctions(2, line.response, socket.emit('action', 2));
                break;
        }
    } else {
        socket.emit('read', line);
        console.log('Sendo room(read): ', line);
    }
});

socket.on('action', (msg) => {
    switch(msg.action){
        case 1:
            msg.message["action"] = 1;
            port.write(JSON.stringify(msg.message));
            break;
        case 2:
            port.write(functions.requestFunction(2));
            break;
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