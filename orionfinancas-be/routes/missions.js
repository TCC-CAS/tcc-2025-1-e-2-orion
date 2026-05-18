const express = require('express');
const router = express.Router();
const missionsController = require('../controllers/missionsController.js');
const authMiddleware = require('../middlewares/auth.js');
const auditAdmin = require('../middlewares/auditAdmin.js');

// Admin: CRUD missions
router.post('/', authMiddleware.verifyAdminToken, auditAdmin('CREATE_MISSION'), missionsController.createMission);
router.get('/', authMiddleware.verifyAdminToken, missionsController.getAllMissions);
router.put('/:id', authMiddleware.verifyAdminToken, auditAdmin('UPDATE_MISSION'), missionsController.updateMission);
router.delete('/:id', authMiddleware.verifyAdminToken, auditAdmin('DELETE_MISSION'), missionsController.deleteMission);

// User: Mission progress
router.get('/user', authMiddleware.verifyToken, missionsController.getUserMissions);
router.post('/claim', authMiddleware.verifyToken, missionsController.claimReward);

module.exports = router;
