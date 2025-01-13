const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    moodType: { type: String, required: true },
    message: { type: String, required: true },
});

// Eğer Message modeli daha önce tanımlandıysa mevcut olanı kullan, aksi takdirde yeni bir model oluştur.
const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

module.exports = Message;
