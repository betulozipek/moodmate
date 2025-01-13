const express = require('express');
const mongoose = require('mongoose');
const weatherRoutes = require('./routes/weatherRoutes');
const activityRoutes = require('./routes/activityRoutes');
const userRoutes = require('./routes/userRoutes');  // Kullanıcı işlemleri için route
const motivationRoutes = require('./routes/motivationRoutes');  // Motivasyon mesajları için route
const userActivityRoutes = require('./routes/userActivityRoutes'); // Yeni rota dosyasını import et
const moodRoutes = require('./routes/moodRoutes');

// .env dosyasını yüklemek için dotenv kullanımı
require('dotenv').config();

const app = express();

// Gelen veriyi JSON formatında alabilmek için express'in yerleşik JSON middleware'ini kullanıyoruz
app.use(express.json());

// Rotalar
app.use('/api', weatherRoutes);
app.use('/api', activityRoutes);
app.use('/api/users', userRoutes);  // `/api/users` altındaki tüm route'lar userRoutes dosyasından gelecek
app.use('/api/motivation', motivationRoutes);  // `/api/motivation` altındaki motivasyon mesajları için route
app.use('/api', userActivityRoutes);
app.use('/api/moods', moodRoutes)
// MongoDB bağlantısı
mongoose.connect('mongodb://localhost:27017/moodmate')  // MongoDB bağlantısı
    .then(() => console.log("MongoDB bağlantısı başarılı"))
    .catch((err) => console.log("MongoDB bağlantısı hatası", err));

// Sunucu başlatma
app.listen(5000, () => {
    console.log("Server çalışıyor: http://localhost:5000");
});
