const express = require("express");
const authMiddleware = require("../middlewares/auth.js");
const subscriptionsController = require("../controllers/subscriptionsController.js");

const router = express.Router();

router.get("/admin", authMiddleware.verifyAdminToken, subscriptionsController.getAdminSubscriptions);

module.exports = router;
