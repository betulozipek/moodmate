const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',  // User modeline referans
    },
    activityId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Activity',  // Activity modeline referans
    },
    activityName: {
        type: String,
        required: true,
    },
    time: {
        type: String,  // Date tipi kullanıldı
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
    completedBy: {
        type: [mongoose.Schema.Types.ObjectId],  // Kullanıcı ID'lerinin listesi
        ref: 'User',  // User modeline referans
        default: []
    },
    date: {
        type: Date,
        default: Date.now,
    },
});

// Modeli export et
const UserActivity = mongoose.models.UserActivity || mongoose.model('UserActivity', userActivitySchema);
module.exports = UserActivity;
