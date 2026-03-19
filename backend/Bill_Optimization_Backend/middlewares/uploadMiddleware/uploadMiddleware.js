const multer = require("multer");
const path = require("path");

// Storage configuration
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/webp",
    "application/pdf"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only images and PDF files are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter
});

module.exports = upload;