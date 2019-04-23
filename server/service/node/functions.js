const mongoose = require('mongoose');
const Sensors = mongoose.model('Sensors');

module.exports.requestFunction = (operation) => {
    switch (operation) {
        case 1:
            return ""; // transmiter setting to salves
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
    * response = [{"id":"S1","configs":[sampleTime=1000,setPoint=-1]}]
    */

    Sensors.updateMany({ online: true }, { online: false }, (err, raw) => {

        if (err) {
            console.error(err);
            return false;
        }

        for (let res in response) {
            Sensors.findOne({ serial: response[res]['id'] }, (err, sensor) => {

                if (sensor) {
                    sensor.online = true;

                    sensor.save((err, result) => {
                        if (!err) {
                            if (callback && typeof (callback) === "function") callback();
                            console.log("Sensor atualizado com sucesso");
                        } else {
                            console.error("Erro ao atualizar as informações do sensor");
                        }
                    });
                } else {
                    let sensor = new Sensors();
                    sensor.serial = response[res]['id'];
                    sensor.online = true;
                    sensor.sampleTime = response[res]['configs'][0];
                    sensor.setPoint = response[res]['configs'][1];

                    sensor.save((err, result) => {
                        if (!err) {
                            if (callback && typeof (callback) === "function") callback();
                            console.log("sensor cadastado com sucesso");
                        } else {
                            console.error(err);
                        }
                    });
                }
            });
        }

    });
}