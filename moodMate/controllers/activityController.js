const Activity = require('../models/Activity');
const UserActivity = require('../models/userActivity');

// Yeni etkinlik önerisi eklemek
const addActivitySuggestion = async (req, res) => {
    try {
        const { activityName, mood, city, time, userId } = req.body;

        // Geçerli bir tarih olup olmadığını kontrol et
        const parsedTime = new Date(time);
        if (isNaN(parsedTime)) {
            return res.status(400).json({ error: 'Geçersiz tarih formatı!' });
        }

        const newActivity = new Activity({
            activityName,
            mood,
            city,
            time: parsedTime,
            userId
        });

        await newActivity.save();

        res.status(201).send("Activity suggestion added successfully");
    } catch (error) {
        res.status(500).json({ error: 'Veritabanına ekleme hatası', details: error });
    }
};

// Aktivite önerilerini almak
const getActivitySuggestions = async (req, res) => {
    try {
        const { mood, city, time } = req.query;

        const query = {};
        if (mood) query.mood = mood;
        if (city) query.city = city;
        if (time) query.time = new Date(time);

        const activities = await Activity.find(query);

        if (!activities.length) {
            return res.status(204).send(); // No Content
        }

        res.status(200).json(activities);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching activity suggestions', details: error });
    }
};

// Aktiviteyi tamamlayan kullanıcıyı ekleme
const completeActivity = async (req, res) => {
    const { activityId } = req.body; // activityId alıyoruz, activityName yerine
    const userId = req.userId;

    try {
        // Aktiviteyi activityId ile veritabanında bul
        const activity = await Activity.findById(activityId);

        if (!activity) {
            return res.status(404).json({ error: 'Bu aktivite bulunamadı!' });
        }

        // Kullanıcı zaten tamamlamış mı?
        if (activity.completedBy.includes(userId)) {
            return res.status(400).json({ message: 'Bu aktivite zaten tamamlandı!' });
        }

        // Aktiviteyi güncelle: completedBy listesine kullanıcıyı ekle
        activity.completedBy.push(userId);

        // Aktiviteyi kaydet
        await activity.save();

        // UserActivity modeline de ekle
        const newUserActivity = new UserActivity({
            userId: userId,  // Kullanıcı ID'sini ekliyoruz
            activityId: activity._id,  // Aktivite ID'sini ekliyoruz
            status: 'completed',
            activityName: activity.activityName,
            time: activity.time
        });

        await newUserActivity.save();

        // Başarı durumunda yanıt gönder
        res.status(200).json({
            message: 'Aktivite başarıyla tamamlandı!',
            activity: {
                _id: activity._id,
                activityName: activity.activityName,
                time: activity.time,
                completedBy: activity.completedBy, // Tamamlayan kullanıcılar
                likedBy: activity.likedBy, // Beğenen kullanıcılar
                userId: userId,  // Aktiviteyi yapan kullanıcı ID'si
                date: activity.date,
                __v: activity.__v
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Aktivite tamamlanırken bir hata oluştu!' });
    }
};

// Trending aktiviteleri almak
const getTrendingActivities = async (req, res) => {
    try {
        // Aktiviteleri popülerliklerine göre sıralıyoruz (beğeni ve tamamlanma sayısına göre)
        const activities = await Activity.aggregate([
            {
                $project: {
                    activityName: 1,
                    likesCount: { $size: "$likedBy" }, // Beğenilen kullanıcı sayısı
                    completionsCount: { $size: "$completedBy" }, // Tamamlayan kullanıcı sayısı
                    totalPopularity: {
                        $add: [
                            { $size: "$likedBy" },
                            { $size: "$completedBy" }
                        ]
                    }
                }
            },
            {
                $sort: { totalPopularity: -1 } // En popülerden en az popülerine sıralama
            },
            {
                $limit: 10 // En popüler 10 aktiviteyi alıyoruz
            }
        ]);

        if (!activities.length) {
            return res.status(204).send(); // No content
        }

        res.status(200).json(activities);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching trending activities', details: error });
    }
};

module.exports = { addActivitySuggestion, getActivitySuggestions, completeActivity, getTrendingActivities };
