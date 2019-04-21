const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const cors = require('cors');
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');

/*
* Parser
*/
const port = new SerialPort('/dev/ttyUSB0', { baudRate: 500000 });
const parser = port.pipe(new Readline());

/*
* VARIABLES
*/
let slavesOnline = [];
let requestSlaves = false;


/*
* Function
*/
function _slavesOnline(){
    port.write('{function:2}');
    requestSlaves = true;
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
    if(requestSlaves){
        salvesOnline = JSON.parse(line);
        requestSlaves = false;
    }else{
        io.emit('slave', JSON.parse(line));
    }
    console.log(line);
});


io.on("connection", (client) => {
    console.log('user connected');
});  

app.use(cors());

app.get('/slavesOnline', (req, res) => {
    res.json(salvesOnline);
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

http.listen(3000, console.log('listening on port 3000'));
