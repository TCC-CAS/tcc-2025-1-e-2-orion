const accountController = require('../controllers/accountController');
const authMiddleware = require('../middlewares/auth');
const express = require('express'); 

const router = express.Router();

router.use(authMiddleware.verifyToken);

router.get('/profile', accountController.getProfile);
router.put('/deactivateProfile', accountController.deactivateAccount);
router.put('/updateAccount', accountController.updateAccount);
router.post('/subtract-life', accountController.subtractLife);
router.get('/statistics', accountController.getStatistics);
router.get('/notifications', accountController.getNotifications);
router.put('/update-password', accountController.updatePassword);
router.put('/equip-avatar', accountController.equipAvatar);
router.post('/set-premium', accountController.setPremium);

module.exports = router;