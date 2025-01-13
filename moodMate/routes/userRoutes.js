const express = require('express');
const { createUser, loginUser, getUser, updateUser, deleteUser } = require('../controllers/userController');  // Controller'dan fonksiyonlar

const router = express.Router();

// Kullanıcı işlemleri
router.post('/', createUser);  // Kullanıcı kaydı
router.post('/login', loginUser);  // Kullanıcı giriş
router.get('/:id', getUser);  // Kullanıcıyı ID ile getirme
router.put('/:id', updateUser);  // Kullanıcıyı güncelleme
router.delete('/:id', deleteUser);  // Kullanıcıyı silme

module.exports = router;
