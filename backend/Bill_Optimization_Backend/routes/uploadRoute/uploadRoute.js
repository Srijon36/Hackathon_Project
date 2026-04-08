const express = require("express");
const router = express.Router();

const upload = require("../../middlewares/uploadMiddleware/uploadMiddleware");
const { protect } = require("../../middlewares/authMiddleware/authMiddleware");
const { checkUploadCredits } = require("../../middlewares/uploadCreditMiddleware/uploadCreditMiddleware");

const { scanAndCreateBill } = require("../../controllers/uploadController/uploadController");

router.post(
  "/upload-bill",
  protect,                          // 1. verify JWT
  checkUploadCredits,               // 2. check free/paid credits
  (req, res, next) => {             // 3. handle file upload
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
  scanAndCreateBill                 // 4. process bill
);

module.exports = router;