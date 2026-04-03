const goalsController = require('../controllers/goalsController');
const authMiddleware = require('../middlewares/auth');
const express = require('express');

const router = express.Router();

router.use(authMiddleware.verifyToken);

router.get('/get-goals', goalsController.getAllGoals);
router.post('/create-goal', goalsController.createGoal);
router.put('/update-goal', goalsController.updateGoal);
router.delete('/delete-goal', goalsController.deleteGoal);

module.exports = router