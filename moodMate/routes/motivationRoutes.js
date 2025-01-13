const express = require('express');
const router = express.Router();
const motivationController = require('../controllers/motivationController');

// Kullanıcı ID'ye göre motivasyon mesajı döndürme
router.get('/user/:user_id', motivationController.getMotivation);

module.exports = router;
