const Message = require('../models/Message');  // Message modelini dahil et
const Mood = require('../models/mood');

exports.getMotivation = async (req, res) => {
    try {
        const userId = req.params.user_id;  // Kullanıcı ID'sini al
        const userMood = await getUserMood(userId);  // Kullanıcının mood bilgisini al

        // Mevcut mood'a göre mesajları filtrele
        const messages = await Message.find({ moodType: userMood });

        if (messages.length === 0) {
            return res.status(404).send({ message: 'No motivational messages found for this mood.' });
        }

        // Mesajlar arasından rastgele birini seç
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];

        // Rastgele seçilen mesajı döndür
        res.json({ message: randomMessage.message });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'An error occurred while fetching the motivation.' });
    }
};

// Kullanıcının mood bilgisini almak için örnek fonksiyon (gerçek veritabanından alınabilir)
async function getUserMood(userId) {
    const userMoodEntry = await Mood.findOne({ userId }).sort({ date: -1 }); // En son mood kaydını getir
    if (!userMoodEntry) {
        throw new Error('Mood not found for this user.');
    }
    return userMoodEntry.mood; // Mood bilgisini döndür
}
