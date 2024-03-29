const mongoose = require('mongoose');
const Sensors = mongoose.model('Sensors');
const { body, validationResult } = require('express-validator/check');

module.exports.validator = (route) => {
    switch (route) {
        case 'register':
            return [
                body('serial', 'Serial é um campo obrigatorio').not().isEmpty().trim().escape(),
                body('sampleTime', 'Data da amostragem é um campo obrigatorio').not().isEmpty().isNumeric().trim(),
            ];
    }
}


module.exports.sensorsOnline = (req, res) => {
    Sensors.find({ online: true }, ['serial', 'online', 'name', 'sampleTime', 'legendX', 'legendY', 'setPoint', 'tolerance', 'function', 'setPointFunction'], (err, sensor) => {
        res.json(sensor);
    });
}

module.exports.update = (req, res) => {
    Sensors.findOne({ serial: req.body.serial }, (err, sensor) => {

        if (sensor) {
            sensor.name = req.body.name;
            sensor.legendX = req.body.legendX;
            sensor.legendY = req.body.legendY;
            sensor.function = req.body.function;
            sensor.setPointFunction = req.body.setPointFunction;
            

            if(sensor.sampleTime != req.body.sampleTime || sensor.setPoint != req.body.setPoint || sensor.tolerance != req.body.tolerance){
                sensor.sampleTime = req.body.sampleTime;
                sensor.setPoint = req.body.setPoint;
                sensor.tolerance = req.body.tolerance;

                res.io.emit('action', {
                    action : 1,
                    message : {
                        addressee : req.body.serial,
                        configs : [sensor.sampleTime, sensor.setPoint, sensor.tolerance]
                    }
                });
            }

            sensor.save((err, result) => {
                if (!err) {
                    res.json({ msg: 'Sensor atualizado com sucesso', error: 0 });
                } else {
                    res.json({ msg: err, error: 1 });
                }
            });
        }
    });
}