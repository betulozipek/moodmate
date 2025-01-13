const axios = require('axios');

// OpenWeather API anahtarınız
const WEATHER_API_KEY = '66ef9df2ef884b59da2bb39cb1c140ca';  // Kendi API anahtarınızı kullanın

// Şehir adı ile hava durumu verilerini al
const getWeatherByCity = async (city) => {
    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${WEATHER_API_KEY}&units=metric`;
        const response = await axios.get(url);

        const { weather, main, wind } = response.data;
        return {
            description: weather[0].description,
            temperature: main.temp,
            feelsLike: main.feels_like,
            windSpeed: wind.speed,
            humidity: main.humidity,
        };
    } catch (error) {
        console.error('Hava durumu bilgisi alınamadı:', error.message);
        throw new Error('Hava durumu bilgisi alınırken bir hata oluştu');
    }
};

module.exports = { getWeatherByCity };
