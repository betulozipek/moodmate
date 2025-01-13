// controllers/weatherController.js
const weatherAPI = require('../utils/weatherAPI');

const getWeather = async (req, res) => {
    const city = req.params.city;  // URL'den şehir bilgisini al
    if (!city) {
        return res.status(400).json({ error: "City parameter is missing" });
    }
    try {
        const weather = await weatherAPI.getWeatherByCity(city);  // Hava durumu verisini al
        res.json(weather);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getWeather };
