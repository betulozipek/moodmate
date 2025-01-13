// routes/moodRoutes.js
const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authenticate');
const moodController = require('../controllers/moodController');
const { addMoodEntry } = require('../controllers/moodController');
const activityController = require('../controllers/activityController');

// Ruh hali girişini ekle
router.post('/mood-entry', authenticateToken, addMoodEntry);

// Kullanıcıya ait tüm ruh hali girişlerini listele
router.get('/mood-entry/user/:user_id', moodController.getAllMoodEntries);

// Haftalık ruh hali trendini al
router.get('/mood-trends/user/:user_id/weekly', moodController.getWeeklyMoodTrend);

// Aktivite önerisi (mood, city, time) için yeni route
router.get('/activity-suggestions/mood-weather', activityController.getActivitySuggestions); 

module.exports = router;
