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
router.put('/notifications/mark-read', accountController.markNotificationsRead);
router.put('/update-password', accountController.updatePassword);
router.put('/equip-avatar', accountController.equipAvatar);
router.post('/set-premium', accountController.setPremium);
router.post('/cancel-subscription', accountController.cancelSubscription);
router.get('/admin/stats', accountController.getAdminStats);
router.get('/admin/activity', accountController.getAdminActivity);
router.get('/admin/settings', accountController.getSystemSettings);
router.put('/admin/settings', accountController.updateSystemSettings);

module.exports = router;