const express = require('express');
const router = express.Router();
const quizzesController = require('../controllers/quizzesController.js');
const authMiddleware = require('../middlewares/auth.js');
const auditAdmin = require('../middlewares/auditAdmin.js');

// Admin: Catalog + status management
router.get('/admin/catalog', authMiddleware.verifyAdminToken, quizzesController.getAdminCatalog);
router.put('/admin/trails/:trailId/status', authMiddleware.verifyAdminToken, auditAdmin('UPDATE_TRAIL_STATUS'), quizzesController.updateTrailStatus);
router.put('/admin/modules/:moduleId/status', authMiddleware.verifyAdminToken, auditAdmin('UPDATE_MODULE_STATUS'), quizzesController.updateModuleStatus);
router.put('/admin/quizzes/:quizId/status', authMiddleware.verifyAdminToken, auditAdmin('UPDATE_QUIZ_STATUS'), quizzesController.updateQuizStatus);

// Admin/User: List all quizzes
router.get('/', authMiddleware.verifyToken, quizzesController.getAllQuizzes);

// User: Get single quiz
router.get('/:id', authMiddleware.verifyToken, quizzesController.getQuizById);

// User: Complete quiz
router.post('/complete', authMiddleware.verifyToken, quizzesController.completeQuiz);

module.exports = router;
