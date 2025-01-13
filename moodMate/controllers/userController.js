const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User'); // User modelini dahil et

const createUser = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Şifreyi hash'le
        const hashedPassword = await bcrypt.hash(password, 10);

        // Yeni kullanıcı oluştur
        const newUser = new User({ name, email, password: hashedPassword });

        // Kullanıcıyı kaydet
        await newUser.save();

        // Başarılı yanıt
        res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu!' });
    } catch (err) {
        console.error('Hata:', err.message);
        res.status(500).json({ error: 'Sunucu hatası!' });
    }
};

module.exports = { createUser };


const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Kullanıcıyı email ile bul
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ error: 'Kullanıcı bulunamadı!' });
        }

        // Şifreyi kontrol et
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Şifre yanlış!' });
        }

        // JWT token oluştur
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,  // .env dosyasından alınan gizli anahtar
            { expiresIn: '10h' }  // Token 1 saat geçerli olacak şekilde ayarlanabilir
        );

        res.json({ token });  // Token'ı döndür
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası!' });
    }
};

// Kullanıcıyı ID'ye göre alma
const getUser = async (req, res) => {
    const { id } = req.params;

    try {
        // Geçerli kullanıcı ID kontrolü
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Geçersiz kullanıcı ID!' });
        }

        // Kullanıcıyı ID ile bul
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı!' });
        }

        res.json(user); // Kullanıcıyı döndür
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası!' });
    }
};



const updateUser = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    // E-posta doğrulama
    if (updates.email && !/\S+@\S+\.\S+/.test(updates.email)) {
        return res.status(400).json({ error: 'Geçersiz e-posta adresi!' });
    }

    // Eğer şifre güncellenmişse, hash'leme işlemi
    if (updates.password) {
        const salt = await bcrypt.genSalt(10);
        updates.password = await bcrypt.hash(updates.password, salt);
    }

    try {
        // Kullanıcıyı ID'ye göre bul ve güncelle
        const user = await User.findByIdAndUpdate(id, updates, { new: true });

        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı!' });
        }

        res.json(user);  // Güncellenen kullanıcıyı döndür
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Sunucu hatası!' });
    }
};


// Kullanıcıyı silme
const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ error: 'Kullanıcı bulunamadı!' });
        }
        res.json({ message: 'Kullanıcı başarıyla silindi!' });
    } catch (err) {
        res.status(500).json({ error: 'Sunucu hatası!' });
    }
};

module.exports = { createUser, loginUser, getUser, updateUser, deleteUser };
