// routes/recommendationRoute/recommendationRoute.js
const express = require("express");
const router  = express.Router();
const { protect } = require("../../middlewares/authMiddleware/authMiddleware");
const { getRecommendations } = require("../../controllers/recommendationController/recommendationController");

router.get("/", protect, getRecommendations);
module.exports = router;