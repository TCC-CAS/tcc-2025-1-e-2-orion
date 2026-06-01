const express = require('express');
const router = express.Router();
const trailsController = require('../controllers/trailsController.js');
const authMiddleware = require('../middlewares/auth.js');

// User: Get all modules/trails
router.get('/', authMiddleware.verifyToken, trailsController.getAllTrails);

// User: Get single trail
router.get('/:id', authMiddleware.verifyToken, trailsController.getTrailById);

module.exports = router;
