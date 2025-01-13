// routes/weatherRoutes.js
const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');

// Şehir adı ile hava durumu sorgulama
router.get('/weather/:city', weatherController.getWeather);

module.exports = router;
