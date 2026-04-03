const express = require('express');
const router = express.Router();
const lessonsController = require('../controllers/lessonsController.js');
const authMiddleware = require('../middlewares/auth.js');

// User: Mark lesson as complete
router.post('/complete', authMiddleware.verifyToken, lessonsController.completeLesson);

// User: Get lesson progress
router.get('/progress', authMiddleware.verifyToken, lessonsController.getLessonProgress);

// User: Submit module review
router.post('/review', authMiddleware.verifyToken, lessonsController.submitReview);

// Admin: Get all reviews
router.get('/reviews', authMiddleware.verifyAdminToken, lessonsController.getAllReviews);

module.exports = router;
