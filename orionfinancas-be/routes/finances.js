const express = require('express');
const router = express.Router();
const financesController = require('../controllers/financesController');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware.verifyToken);

router.get('/dashboard', financesController.getDashboard);
router.post('/transaction', financesController.createTransaction);
router.put('/transaction', financesController.updateTransaction);
router.delete('/transaction', financesController.deleteTransaction);

module.exports = router;
