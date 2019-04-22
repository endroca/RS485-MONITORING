require('dotenv').config();
const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

const path = require('path');
const logger = require('morgan');
const cors = require('cors');

const mongoose = require('mongoose');

const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');



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
require('./models/Sensors');

/*
* Routes
*/
const indexRouter = require('./routes/sensors');

if(process.env.NODE_ENV == 'development'){
	app.use(logger('dev'));
}

app.use(function (req, res, next) {
	res.io = io;
	next();
});
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.use('/', indexRouter);

/*
* Parser
*/
const port = new SerialPort(process.env.USB_PORT, { baudRate: parseInt(process.env.USB_RATE) });
const parser = port.pipe(new Readline());

/*
* VARIABLES
*/
let slavesOnline = [];
let requestSlaves = false;


/*
* Function
*/
function _slavesOnline() {
    port.write('{function:2}');
    requestSlaves = true;
}

function _registerUpdateSensor(){

}


/*
* EVENTS
*/
port.on('error', (err) => {
    console.log('Error: ', err.message);
});

port.on('open', () => {
    //Get slaves connected
    _slavesOnline();
});

parser.on('data', (line) => {
    if (requestSlaves) {
        salvesOnline = JSON.parse(line);
        requestSlaves = false;
    } else {
        io.emit('slave', JSON.parse(line));
    }
    console.log(line);
});


io.on("connection", (client) => {
    console.log('user connected');
});




// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// [SH] Catch unauthorised errors
app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401);
        res.json({ "message": err.name + ": " + err.message });
    }
});


module.exports = { app: app, server: server };
