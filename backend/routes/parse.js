const express = require('express');
const router = express.Router();
const multer = require('multer');
const pdf = require('pdf-parse');
const fs = require('fs');
const path = require('path');

const upload = multer({ dest: path.join(__dirname, '..', 'uploads') });

// Very simple PDF text parser to extract amounts and make suggestions.
// Works best with text-based PDFs (not scanned images).
router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'file required (PDF)' });
    const dataBuffer = fs.readFileSync(req.file.path);
    const data = await pdf(dataBuffer);
    const text = data.text || '';
    
    // find date (simple regex for YYYY-MM-DD or MM/DD/YYYY)
    const dateRegex = /\b(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})\b/;
    const dateMatch = text.match(dateRegex);
    let extractedDate = null;
    if (dateMatch && dateMatch[0]) {
      const dateObj = new Date(dateMatch[0]);
      if (!isNaN(dateObj.getTime())) { // Check if dateObj is a valid date
        extractedDate = dateObj.toISOString().slice(0, 10);
      }
    }

    // find amounts (simple regex for numbers with decimal or comma)
    const amtRegex = /(?:(?:Total|Amount|Balance|Subtotal|Grand Total)\s*[:]?\s*)?(?:[\$€£])?\s*(\d{1,3}(?:[\d]{0,3})*(?:\.\d{2}))/g;
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const suggestions = [];
    for (const line of lines) {
      const amts = line.match(amtRegex);
      if (amts) {
        // pick largest number in the line as amount (heuristic)
        const nums = amts.map(a => parseFloat(a.replace(/,/g, ''))).filter(n => !isNaN(n));
        if (nums.length) {
          const amount = Math.max(...nums);
          suggestions.push({ description: line, amount, date: extractedDate, category: 'Uncategorized' });
        }
      }
    }
    // cleanup uploaded file
    fs.unlinkSync(req.file.path);
    res.json({ suggestions });
  } catch (err) {
    console.error("PDF parsing error:", err);
    next(err);
  }
});

module.exports = router;
