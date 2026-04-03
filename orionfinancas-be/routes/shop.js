const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware.verifyToken);

router.get('/items', shopController.getItems);
router.post('/buy', shopController.buyItem);

module.exports = router;
