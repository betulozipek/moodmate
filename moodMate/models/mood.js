const mongoose = require('mongoose');

const moodSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', // User modeline referans
        required: true 
    },
    mood: { 
        type: String, 
        required: true 
    },
    date: { 
        type: Date, 
        default: Date.now // Ruh hali girişi oluşturulma zamanı
    }
});

// Eğer Mood modeli daha önce tanımlandıysa mevcut olanı kullan, aksi takdirde yeni bir model oluştur.
const Mood = mongoose.models.Mood || mongoose.model('Mood', moodSchema);

module.exports = Mood;
