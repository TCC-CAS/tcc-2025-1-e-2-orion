const express = require('express');
const router = express.Router();
const missionsController = require('../controllers/missionsController.js');
const authMiddleware = require('../middlewares/auth.js');

// Admin: CRUD missions
router.post('/', authMiddleware.verifyAdminToken, missionsController.createMission);
router.get('/', authMiddleware.verifyAdminToken, missionsController.getAllMissions);
router.put('/:id', authMiddleware.verifyAdminToken, missionsController.updateMission);
router.delete('/:id', authMiddleware.verifyAdminToken, missionsController.deleteMission);

// User: Mission progress
router.get('/user', authMiddleware.verifyToken, missionsController.getUserMissions);
router.post('/claim', authMiddleware.verifyToken, missionsController.claimReward);

module.exports = router;
