const fs = require("fs");
const path = require("path");
const { parseBillFromBuffer } = require("./aiParser");

// ─────────────────────────────────────────────
// ✅ Extract & parse from image buffer
// ─────────────────────────────────────────────
const extractTextFromImage = async (buffer) => {
  // No longer running local OCR — Claude reads the image directly
  console.log("📷 Image received, sending to Claude Vision...");
  return await parseBillFromBuffer(buffer, "image/jpeg");
};

// ─────────────────────────────────────────────
// ✅ Extract & parse from PDF buffer
// ─────────────────────────────────────────────
const extractTextFromPDF = async (buffer) => {
  console.log("📄 PDF received, sending to Claude Vision...");
  return await parseBillFromBuffer(buffer, "application/pdf");
};

module.exports = {
  extractTextFromImage,
  extractTextFromPDF,
};