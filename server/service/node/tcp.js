const net = require('net');
const network = require('network');
const readline = require('readline');

const client = new net.Socket();
client.connect(80, '192.168.4.1');

const line = readline.createInterface(client, client);

line.on('line', (line) => {
    console.log(line);
});


client.on('close', () => {
    console.log("exit");
})