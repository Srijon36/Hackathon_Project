const express = require("express");
const router = express.Router();

const upload = require("../../middlewares/uploadMiddleware/uploadMiddleware");

const {
  scanAndCreateBill
} = require("../../controllers/uploadController/uploadController");

const { protect } = require("../../middlewares/authMiddleware/authMiddleware");

// ✅ FIXED ROUTE WITH ERROR HANDLING
router.post(
  "/upload-bill",
  protect,
  (req, res, next) => {
    upload.single("bill")(req, res, function (err) {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "File upload error"
        });
      }
      next();
    });
  },
  scanAndCreateBill
);

module.exports = router;