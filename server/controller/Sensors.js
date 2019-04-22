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

module.exports.register = (serial) => {
    const sensors = new Sensors();
    sensors.serial = serial;

    sensors.save();
}

module.exports.update = (req, res) => {
    try {
        validationResult(req).throw();

        Sensors.find({ serial: req.body.serial }, (err, sensor) => {
            sensor.name = req.body.name;
            sensor.sampleTime = req.body.sampleTime;
            sensor.legendX = req.body.legendX;
            sensor.legendY = req.body.legendY;
            sensor.setPoint = req.body.setPoint;
            sensor.function = req.body.function;

            sensor.save((err, result) => {
                if (err) {
                    return res.status(500).json({ error: "Ops... não conseguimos realizar o registro no banco de dados", verbose: err });
                } else {
                    return res.status(200).json({ message: "Dados do sensor atualizados com sucesso", verbose: result });
                }
            });
        });

    } catch (err) {
        return res.status(422).json({ errors: err.array() });
    }
}

/*
    try {
        validationResult(req).throw();

        const sensors = new Sensors();
        sensors.serial = req.body.serial;
        sensors.name = req.body.name;
        sensors.sampleTime = req.body.sampleTime;
        sensors.legendX = req.body.legendX;
        sensors.legendY = req.body.legendY;
        sensors.setPoint = req.body.setPoint;
        sensors.function = req.body.function;

        sensors.save((err, result) => {
            if (err) {
                return res.status(500).json({ error: "Ops... não conseguimos realizar o registro no banco de dados", verbose: err });
            } else {
                return res.status(200).json({ message: "Sensor Cadastrado com sucesso", verbose: result });
            }
        });

    } catch (err) {
        return res.status(422).json({ errors: err.array() });
    }
*/