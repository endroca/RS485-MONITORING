const server = require('http').createServer();
const io = require('socket.io')(server);
const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const port = new SerialPort('/dev/ttyUSB0', { baudRate: 500000 });

const parser = new Readline();
port.pipe(parser);

parser.on('data', (line) => {
    io.emit('sensors', JSON.parse(line));
});


io.listen(3000);