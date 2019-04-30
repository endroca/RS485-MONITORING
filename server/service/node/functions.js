const mongoose = require('mongoose');
const Sensors = mongoose.model('Sensors');

module.exports.requestFunction = (operation) => {
    switch (operation) {
        case 1:
            operation["action"] = 1
            return operation; // transmiter setting to salves
        case 2:
            return "{action:2}"; // get slaves online
        case 3:
            return "{action:3}"; // reset master
    }
}

module.exports.responseFunctions = (operation, response, callback) => {
    switch (operation) {
        case 2:
            RegisterAndUpdateSensorsOnline(response, callback);
    }
}


function RegisterAndUpdateSensorsOnline(response, callback) {
    /*
    * response = [{"id":"S1","configs":[sampleTime=1000,setPoint=-1,tolerance=5]}]
    */

    Sensors.updateMany({ online: true }, { online: false }, (err, raw) => {

        if (err) {
            console.error(err);
            return false;
        }

        for (let res in response) {
            Sensors.findOne({ serial: response[res]['id'] }, (err, $sensor) => {
                let sensor = $sensor;

                if (!sensor) {
                    sensor = new Sensors();
                    sensor.serial = response[res]['id'];
                    sensor.name = 'Sensor ' + response[res]['id'];
                    sensor.legendX = 'Tempo';
                    sensor.legendY = 'Bit';
                    sensor.function = 'x';
                    sensor.setPointFunction = 'x';
                }

                sensor.online = true;
                sensor.sampleTime = response[res]['configs'][0];
                sensor.setPoint = response[res]['configs'][1];
                sensor.tolerance = response[res]['configs'][2];

                sensor.save((err, result) => {
                    if (!err) {
                        if (callback && typeof (callback) === "function") callback();
                        console.log("Sensor cadastrado/atualizado com sucesso");
                    } else {
                        console.error("Erro ao cadastrado/atualizado as informações do sensor");
                    }
                });
            });
        }
    });
}