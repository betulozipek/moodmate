const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true },
    duration: { type: Number, required: true },
    moodType: { type: String, required: true },
    city: { type: String, required: true },
    time: { type: String, required: true },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, {
    timestamps: true,
});

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
