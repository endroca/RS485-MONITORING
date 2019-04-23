const express = require('express');
const router = express.Router();
const controller = require('../controller/Sensors');

router.get('/sensorsOnline', controller.sensorsOnline);

router.post('/updateSetting', (req, res) => {

});

router.get('/', (req, res) => {
    res.json({ API: 'online' });
});

module.exports = router;
