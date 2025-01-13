const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const Mood = require('../models/mood');
const authenticate = require('../middleware/authenticate');

// Aktivite önerisi almak için route
router.get('/activity-suggestions/mood-weather', authenticate, async (req, res) => {
    const { city, time } = req.query;

    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);  // Bugünün başlangıcı (saat:00:00)

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);  // Bugünün sonu (saat:23:59)

        // Bugünün tarih aralığında olan ruh halini sorgula:
        const moodEntry = await Mood.findOne({
            userId: req.userId,
            date: { $gte: startOfDay, $lt: endOfDay }
        }).sort({ date: -1 });

        if (!moodEntry) {
            return res.status(404).json({ error: 'Bugün için ruh hali kaydı bulunamadı!' });
        }

        const userMood = moodEntry.mood;
        const activities = await Activity.find({
            moodType: userMood,
            type: time
        }).select('name description type');

        if (activities.length === 0) {
            return res.status(404).json({ message: 'Uygun aktivite bulunamadı!' });
        }

        res.status(200).json(activities);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Aktivite önerisi alınırken bir hata oluştu!' });
    }
});

// Kullanıcının beğendiği aktiviteleri listeleme
router.get('/activity-suggestions/user/:user_id/saved', authenticate, async (req, res) => {
    const { user_id } = req.params;

    try {
        const activities = await Activity.find({ likedBy: user_id });

        if (!activities || activities.length === 0) {
            return res.status(404).json({ message: 'Beğenilen aktiviteler bulunamadı!' });
        }

        res.status(200).json(activities);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Aktiviteler alınırken bir hata oluştu!' });
    }
});

// Aktiviteyi beğenme
router.post('/activity-suggestions/:suggestion_id/like', authenticate, async (req, res) => {
    const { suggestion_id } = req.params;

    try {
        const activity = await Activity.findById(suggestion_id);

        if (!activity) {
            return res.status(404).json({ error: 'Aktivite bulunamadı!' });
        }

        // Kullanıcı zaten beğenmiş mi kontrol et
        if (activity.likedBy.includes(req.userId)) {
            return res.status(400).json({ message: 'Zaten beğenildi!' });
        }

        // Kullanıcıyı beğeni listesine ekle
        activity.likedBy.push(req.userId);
        await activity.save();

        res.status(200).json({ message: 'Beğeni başarıyla eklendi!', activity });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Beğeni eklenirken bir hata oluştu!' });
    }
});

// Aktiviteyi beğeniden çıkarma
router.delete('/activity-suggestions/:suggestion_id/unlike', authenticate, async (req, res) => {
    const { suggestion_id } = req.params;

    try {
        const activity = await Activity.findById(suggestion_id);

        if (!activity) {
            return res.status(404).json({ error: 'Aktivite bulunamadı!' });
        }

        // Kullanıcı beğeni listesinde mi kontrol et
        if (!activity.likedBy.includes(req.userId)) {
            return res.status(400).json({ message: 'Beğeni bulunamadı!' });
        }

        // Kullanıcıyı beğeni listesinden çıkar
        activity.likedBy = activity.likedBy.filter(id => id.toString() !== req.userId);
        await activity.save();

        res.status(200).json({ message: 'Beğeni başarıyla kaldırıldı!', activity });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Beğeni kaldırılırken bir hata oluştu!' });
    }
});

// Trending activities endpoint
router.get('/activities/trending', async (req, res) => {
    try {
        // Aktiviteleri beğeniler (likedBy) ve tamamlamalar (completedBy) sayısına göre sıralıyoruz
        const activities = await Activity.aggregate([
            {
                $project: {
                    name: 1,
                    description: 1,
                    type: 1,
                    likedByCount: { $size: "$likedBy" },  // likedBy'nin uzunluğu
                    completedByCount: { $size: "$completedBy" },  // completedBy'nin uzunluğu
                    likedBy: 1,
                    completedBy: 1,
                }
            },
            {
                $addFields: {
                    totalScore: {
                        $add: [
                            { $multiply: ["$likedByCount", 2] },  // Beğeniler daha yüksek ağırlık
                            { $multiply: ["$completedByCount", 1] },  // Tamamlamalar düşük ağırlık
                        ]
                    }
                }
            },
            {
                $sort: { totalScore: -1 }  // TotalScore'a göre azalan sırayla sıralıyoruz
            },
            { $limit: 3 }  // İlk3 popüler aktiviteyi alıyoruz
        ]);

        if (activities.length === 0) {
            return res.status(404).json({ message: 'Popüler aktivite bulunamadı!' });
        }

        // Popüler aktiviteleri döndürüyoruz
        res.status(200).json(activities);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Aktiviteler alınırken bir hata oluştu!' });
    }
});

module.exports = router;
