const { createWorker } = require("tesseract.js");
const pdfParse = require("pdf-parse");
const pdfPoppler = require("pdf-poppler");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

// ✅ Run OCR on image
const runOCR = async (imagePath) => {
  const worker = await createWorker("eng");

  await worker.setParameters({
    tessedit_char_whitelist:
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz./:- ₹,",
    preserve_interword_spaces: "1",
  });

  const { data } = await worker.recognize(imagePath);
  await worker.terminate();

  return data.text;
};

// ✅ Preprocess image for better OCR
const preprocessImage = async (inputPath, outputPath) => {
  await sharp(inputPath)
    .grayscale()
    .resize({ width: 2000, withoutEnlargement: false }) // upscale for clarity
    .normalize()
    .sharpen()
    .threshold(140)
    .toFile(outputPath);
};

// ✅ Extract text from image buffer
const extractTextFromImage = async (buffer) => {
  const uploadsDir = path.join(__dirname, "../../uploads");

  // Make sure uploads dir exists
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const tempImage = path.join(uploadsDir, `temp_${Date.now()}.png`);
  const processedImage = path.join(uploadsDir, `processed_${Date.now()}.png`);

  try {
    // Write buffer to temp file
    fs.writeFileSync(tempImage, buffer);

    // Preprocess for better OCR
    await preprocessImage(tempImage, processedImage);

    const text = await runOCR(processedImage);
    console.log("📄 OCR extracted text length:", text?.length);

    return text;
  } finally {
    // Cleanup temp files
    if (fs.existsSync(tempImage)) fs.unlinkSync(tempImage);
    if (fs.existsSync(processedImage)) fs.unlinkSync(processedImage);
  }
};

// ✅ Extract text from PDF buffer
const extractTextFromPDF = async (buffer) => {
  const uploadsDir = path.join(__dirname, "../../uploads");

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Try direct text extraction first
  try {
    const pdfData = await pdfParse(buffer);
    if (pdfData.text && pdfData.text.trim().length > 20) {
      console.log("✅ Text extracted directly from PDF");
      return pdfData.text;
    }
  } catch (err) {
    console.warn("⚠️ Direct PDF text extraction failed:", err.message);
  }

  console.log("⚠️ Scanned PDF detected. Converting to image for OCR...");

  const tempPdf = path.join(uploadsDir, `temp_${Date.now()}.pdf`);
  const pageImage = path.join(uploadsDir, `page-1.png`);
  const processedImage = path.join(uploadsDir, `processed_${Date.now()}.png`);

  try {
    fs.writeFileSync(tempPdf, buffer);

    const opts = {
      format: "png",
      out_dir: uploadsDir,
      out_prefix: "page",
      page: 1,
    };

    await pdfPoppler.convert(tempPdf, opts);

    // Preprocess the PDF page image
    await preprocessImage(pageImage, processedImage);

    const text = await runOCR(processedImage);
    console.log("📄 OCR from PDF text length:", text?.length);

    return text;
  } finally {
    // Cleanup
    if (fs.existsSync(tempPdf)) fs.unlinkSync(tempPdf);
    if (fs.existsSync(pageImage)) fs.unlinkSync(pageImage);
    if (fs.existsSync(processedImage)) fs.unlinkSync(processedImage);
  }
};

module.exports = {
  extractTextFromImage,
  extractTextFromPDF,
};