const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authenticate');
const Activity = require('../models/Activity');
const UserActivity = require('../models/userActivity');

router.post('/user-activities', authenticate, async (req, res) => {
    const { activityId } = req.body;
    const userId = req.userId;

    try {
        const activity = await Activity.findById(activityId);

        if (!activity) {
            return res.status(404).json({ error: 'Bu aktivite bulunamadı!' });
        }

        // Aktiviteyi güncelle: completedBy listesine kullanıcıyı ekle
        activity.completedBy.push(userId);
        await activity.save();

        // UserActivity modeline de ekle
        const newUserActivity = new UserActivity({
            userId: userId,
            activityId: activity._id,
            status: 'completed',
            activityName: activity.name,  // Burada activityName'e değer atıyoruz
            time: activity.time,  // Burada time'a değer atıyoruz (örneğin: "morning")
        });

        await newUserActivity.save();

        // Başarı durumunda yanıt gönder
        res.status(200).json({
            message: 'Aktivite başarıyla tamamlandı!',
            activity: {
                _id: activity._id,
                name: activity.name,
                time: activity.time,
                completedBy: activity.completedBy,
                likedBy: activity.likedBy,
                userId: userId,
                __v: activity.__v,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'Aktivite tamamlanırken bir hata oluştu!',
            details: err.message,
        });
    }
});
// GET: /user-activities/:userId - Kullanıcının gerçekleştirdiği tüm aktiviteleri listele
router.get('/user-activities/:userId', authenticate, async (req, res) => {
    const { userId } = req.params;

    try {
        // Kullanıcının gerçekleştirdiği tüm aktiviteleri sorgula
        const userActivities = await UserActivity.find({ userId: userId })
            .populate('activityId', 'name time')  // Activity modelindeki name ve time alanlarını da getir
            .exec();

        if (userActivities.length === 0) {
            return res.status(404).json({ message: 'Bu kullanıcı için aktivite bulunamadı!' });
        }

        res.status(200).json({
            message: 'Kullanıcının gerçekleştirdiği aktiviteler listelendi.',
            activities: userActivities,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'Aktiviteler listelenirken bir hata oluştu!',
            details: err.message,
        });
    }
});
module.exports = router;
