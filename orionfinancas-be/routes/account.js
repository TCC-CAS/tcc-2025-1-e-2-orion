const accountController = require('../controllers/accountController');
const authMiddleware = require('../middlewares/auth');
const auditAdmin = require('../middlewares/auditAdmin');
const express = require('express');

const router = express.Router();

// Rotas de ADMIN — declaradas ANTES do router.use(verifyToken) para que sejam
// protegidas apenas pelo verifyAdminToken (cookie adminToken). Caso contrário, o
// verifyToken global exigiria o cookie de usuário comum ("token") e barraria o
// admin com 401 antes de chegar no verifyAdminToken.
router.get('/admin/stats', authMiddleware.verifyAdminToken, accountController.getAdminStats);
router.get('/admin/activity', authMiddleware.verifyAdminToken, accountController.getAdminActivity);
router.get('/admin/settings', authMiddleware.verifyAdminToken, accountController.getSystemSettings);
router.put('/admin/settings', authMiddleware.verifyAdminToken, auditAdmin('UPDATE_SETTINGS'), accountController.updateSystemSettings);

// A partir daqui, todas as rotas exigem autenticação de usuário comum.
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
router.post('/abacatepay-checkout', accountController.abacatepayCheckout);
router.post('/cancel-subscription', accountController.cancelSubscription);
router.get('/export', accountController.exportUserData);
router.delete('/permanent', accountController.permanentDeleteAccount);

module.exports = router;