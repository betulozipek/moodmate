const jwt = require('jsonwebtoken');
require('dotenv').config(); // .env dosyasını yükle

const authenticate = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; // Authorization header'dan token'ı al

    if (!token) {
        return res.status(401).json({ error: 'Token bulunamadı!' });
    }

    const secretKey = process.env.JWT_SECRET;

    jwt.verify(token, secretKey, (err, decoded) => {  // Token'ı doğrula
        if (err) {
            return res.status(401).json({ error: 'Geçersiz token!' });
        }

        // Token doğrulandıktan sonra req.user'ı ayarlıyoruz
        req.user = decoded;  // decoded'dan tüm bilgileri req.user'a aktar
        req.userId = decoded.userId;  // userId'yi ayrıca ayarlıyoruz
        next();  // İleriye yönlendir
    });
};


module.exports = authenticate;
