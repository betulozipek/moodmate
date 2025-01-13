// controllers/moodController.js
const Mood = require('../models/mood'); // Mood modelini import et

// Ruh hali girişini ekle
const addMoodEntry = async (req, res) => {
    const { mood } = req.body;
    const { userId } = req.user;  // Token'dan alınan userId'yi kullanıyoruz

    if (!mood || !userId) {
        return res.status(400).json({ error: 'Mood or user ID is missing.' });
    }

    try {
        const newMood = new Mood({ userId: userId, mood });
        await newMood.save();
        res.status(201).json(newMood); // Başarılıysa yeni ruh halini döndür
    } catch (error) {
        console.log('Error saving mood entry:', error);  // MongoDB hatası
        res.status(500).json({ error: 'Mood entry could not be added.' });
    }
};


// Kullanıcıya ait tüm ruh hali girişlerini listelemek için fonksiyon
const getAllMoodEntries = async (req, res) => {
    const { user_id } = req.params;  // Kullanıcı ID'sini URL'den al
    try {
        const moods = await Mood.find({ userId: user_id });  // Kullanıcıya ait tüm ruh hali girişlerini al

        if (!moods || moods.length === 0) {
            return res.status(404).json({ message: 'No mood entries found for this user.' });
        }

        res.status(200).json(moods);  // Moodları döndür
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving mood entries.' });
    }
};


// Haftalık ruh hali trendini almak için fonksiyon
const getWeeklyMoodTrend = async (req, res) => {
    const { user_id } = req.params;  // Kullanıcı ID'sini URL'den al
    try {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);  // Son 7 günün tarih aralığını al

        // Haftalık ruh hali verilerini al
        const moods = await Mood.find({
            userId: user_id,
            date: { $gte: weekAgo.toISOString() }  // UTC zaman formatında sorgu yap
        });

        if (!moods || moods.length === 0) {
            return res.status(404).json({ message: 'No mood entries found for this user in the last week.' });
        }

        // Ruh halleri arasında sayım yap
        const moodCounts = moods.reduce((acc, moodEntry) => {
            acc[moodEntry.mood] = (acc[moodEntry.mood] || 0) + 1;  // Ruh haline göre sayımı artır
            return acc;
        }, {});

        // En yaygın ruh halini bul
        const mostFrequentMood = Object.entries(moodCounts).reduce((max, entry) => {
            if (entry[1] > max[1]) {
                return entry;
            }
            return max;
        }, ['', 0]);

        res.status(200).json({
            moodTrend: mostFrequentMood[0], // En yaygın ruh hali
            count: mostFrequentMood[1]      // Sayısı
        });
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving weekly mood trend.' });
    }
};

module.exports = { addMoodEntry, getAllMoodEntries, getWeeklyMoodTrend };
