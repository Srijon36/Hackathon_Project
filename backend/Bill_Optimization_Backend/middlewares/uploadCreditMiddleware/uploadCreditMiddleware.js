const User = require("../../models/userModel/userModel");

const checkUploadCredits = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Case 1: Free upload not used yet — allow and mark it used
    if (!user.freeUploadUsed) {
      await User.findByIdAndUpdate(req.user.id, { freeUploadUsed: true });
      return next();
    }

    // Case 2: Has paid credits — allow and deduct 1
    if (user.uploadCredits > 0) {
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { uploadCredits: -1 }
      });
      return next();
    }

    // Case 3: No free upload, no credits — block
    return res.status(403).json({
      success: false,
      message: "PURCHASE_REQUIRED",
      freeUploadUsed: true,
      uploadCredits: 0,
    });

  } catch (error) {
    console.error("Credit Check Error:", error);
    res.status(500).json({ success: false, message: "Server error during credit check" });
  }
};

module.exports = { checkUploadCredits };