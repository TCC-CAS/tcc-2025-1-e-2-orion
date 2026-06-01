const express = require('express');
const router = express.Router();
const webhooksController = require('../controllers/webhooksController');

// Captura o corpo cru para validação de assinatura HMAC
router.use(express.json({
    verify: (req, _res, buf) => { req.rawBody = buf.toString('utf8'); }
}));

router.post('/abacatepay', webhooksController.abacatepay);

module.exports = router;
