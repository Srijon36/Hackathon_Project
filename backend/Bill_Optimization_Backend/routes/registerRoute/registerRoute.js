const express = require("express");
const router = express.Router();

const registerController = require("../../controllers/registerController/registerController");

// Routes
router.post("/create-register", registerController.createregister);
router.post("/create-register-admin", registerController.createDefaultAdmin);

module.exports = router;
