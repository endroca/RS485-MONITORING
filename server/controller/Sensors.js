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
    Sensors.find({ online: true },['serial','online','name','sampleTime','legendX','legendY','setPoint','function'], (err, sensor) => {
        res.json(sensor);
    });
}