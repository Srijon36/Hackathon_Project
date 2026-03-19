const { createWorker } = require("tesseract.js");
const pdfParse = require("pdf-parse");
const pdfPoppler = require("pdf-poppler");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// OCR worker (IMPROVED)
const runOCR = async (imagePath) => {
  const worker = await createWorker("eng");

  // ✅ Improve OCR accuracy
  await worker.setParameters({
    tessedit_char_whitelist:
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz./:- ₹",
    preserve_interword_spaces: "1"
  });

  const { data } = await worker.recognize(imagePath);

  await worker.terminate();

  return data.text;
};


// Image OCR (WITH PREPROCESSING)
const extractTextFromImage = async (buffer) => {
  const tempImage = path.join(__dirname, "../uploads/temp.png");

  // ✅ Convert to grayscale + high contrast
  await sharp(buffer)
    .grayscale()
    .normalize()
    .threshold(150)
    .toFile(tempImage);

  const text = await runOCR(tempImage);

  fs.unlinkSync(tempImage);

  return text;
};


// PDF extraction
const extractTextFromPDF = async (buffer) => {
  const pdfData = await pdfParse(buffer);

  // ✅ If text exists → use directly
  if (pdfData.text && pdfData.text.trim().length > 20) {
    console.log("✅ Text extracted directly from PDF");
    return pdfData.text;
  }

  console.log("⚠️ Scanned PDF detected. Converting to image...");

  const tempPdf = path.join(__dirname, "../uploads/temp.pdf");

  fs.writeFileSync(tempPdf, buffer);

  const opts = {
    format: "png",
    out_dir: path.join(__dirname, "../uploads"),
    out_prefix: "page",
    page: 1
  };

  await pdfPoppler.convert(tempPdf, opts);

  const imagePath = path.join(__dirname, "../uploads/page-1.png");

  // ✅ Apply preprocessing to PDF image also
  const processedImage = path.join(__dirname, "../uploads/processed.png");

  await sharp(imagePath)
    .grayscale()
    .normalize()
    .threshold(150)
    .toFile(processedImage);

  const text = await runOCR(processedImage);

  fs.unlinkSync(tempPdf);
  fs.unlinkSync(imagePath);
  fs.unlinkSync(processedImage);

  return text;
};

module.exports = {
  extractTextFromImage,
  extractTextFromPDF
};