const express = require('express');
const router = express.Router();
const controller = require('../controller/Sensors');

const request = require('request');

router.get('/sensorsOnline', controller.sensorsOnline);

router.post('/updateSetting', controller.update);

router.get('/', (req, res) => {
    res.json({ API: 'online', gateway: res.ip });
});

router.get('/testnode', (req, res) => {
    request.post('http://' + res.ip, {
        json: {
            test : 'teste'
        }
    }, (error, res, body) => {
        if(error){
            console.error(error);
            return;
        }
        console.log(`statusCode: ${res.statusCode}`);
        console.log(body);
    })
});

module.exports = router;
