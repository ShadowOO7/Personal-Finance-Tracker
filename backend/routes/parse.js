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
      if (!isNaN(dateObj.getTime())) {
        extractedDate = dateObj.toISOString().slice(0, 10);
      }
    }

    // --- Amount extraction strategy ---
    // 1) Only consider summary/payment lines (Grand Total, Total Value, Amount of INR, Payable, etc.)
    //    and/or lines that explicitly contain currency markers.
    // 2) Ignore tax/rate/metadata lines (CGST, SGST, HSN, GSTIN, Rate, Qty, Item(s) Total, Packaging, etc.).
    // 3) Robust token regex that DOES NOT capture partial decimals (e.g., "3.735" won't become "3.73").
    // 4) Drop long digit-only integers (likely IDs) with >= 6 digits and no decimal.
    // 5) Choose best candidate per line:
    //    - if currency is present on the line -> take the last currency-tagged number
    //    - else if it’s a summary line -> take the MAX on that line
    //    - else skip

    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    // STRONG summary keywords (keep precise; do not include generic "total" to avoid noise)
    const strongSummary = [
      'grand total',
      'total value',
      'amount due',
      'amount payable',
      'balance due',
      'net total',
      'net amount',
      'amount of',
      'amount (in words)'
    ];

    // Lines to ignore entirely
    const excludeTerms = [
      'cgst', 'sgst', 'igst', 'tax', 'rate', 'hsn', 'gstin', 'fssai',
      'qty', 'quantity', 'item(s) total', 'packaging'
    ];

    // Robust number token with optional currency.
    // Captures as group 2 to enforce "not part of larger number" via group1 boundary + (?![0-9.])
    // Examples matched: "₹ 1,234.50", "INR 198.87", "249", "189.4"
    // Will NOT partially match "3.735" (because (?![0-9.]) prevents truncation).
    const amtRegex = /(^|[^0-9.])((?:₹|Rs\.?|INR|\$|€|£)?\s*\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)(?![0-9.])/gi;

    const suggestions = [];

    for (const line of lines) {
      const lower = line.toLowerCase();

      // Skip clearly non-summary / tax / metadata lines
      if (excludeTerms.some(t => lower.includes(t))) {
        // Special case: don't skip if it's clearly a payable line even if it mentions "tax"
        // (not needed for the provided sample, but kept for safety)
        const payableHint = /(amount\s+due|amount\s+payable|amount\s+of|total\s+value|grand\s+total)/i.test(lower);
        if (!payableHint) continue;
      }

      const hasCurrency = /(\bINR\b|₹|Rs\.?|\$|€|£)/i.test(line);
      const isStrongSummary = strongSummary.some(k => lower.includes(k));

      // Require a strong summary keyword OR a currency marker in the line
      if (!isStrongSummary && !hasCurrency) continue;

      // Gather candidate tokens from this line
      const matches = [...line.matchAll(amtRegex)];
      if (!matches.length) continue;

      const tokens = [];
      for (const m of matches) {
        const raw = m[2].trim(); // group 2 is the actual token (with optional currency)
        const numeric = parseFloat(raw.replace(/[^0-9.]/g, ''));

        if (isNaN(numeric)) continue;

        // Ignore integers with >= 6 digits and no decimal (likely IDs, e.g., 7200542499)
        const onlyDigits = raw.replace(/\D/g, '');
        const hasDecimal = /\.\d{1,2}$/.test(raw); // only treat as decimal if ends with .d or .dd
        if (!hasDecimal && onlyDigits.length >= 6) continue;

        // Ignore 3+ decimal numbers (e.g., 3.735) to avoid CGST/SGST rates being truncated
        if (/\.\d{3,}/.test(raw)) continue;

        // Keep the token, also mark if it had an explicit currency
        const tokenHasCurrency = /(\bINR\b|₹|Rs\.?|\$|€|£)/i.test(raw);
        tokens.push({ raw, num: numeric, currencyTagged: tokenHasCurrency });
      }

      if (!tokens.length) continue;

      let chosenAmount = null;

      const currencyTagged = tokens.filter(t => t.currencyTagged);
      if (currencyTagged.length) {
        // Prefer the last currency-tagged number in the line (e.g., "Amount of INR 198.87 ...")
        chosenAmount = currencyTagged[currencyTagged.length - 1].num;
      } else if (isStrongSummary) {
        // For lines like "Total Value ... 198.87" choose the MAX on that line
        chosenAmount = Math.max(...tokens.map(t => t.num));
      } else {
        // If we reached here, it's a weak line; skip to avoid noise
        continue;
      }

      suggestions.push({
        description: line,
        amount: chosenAmount,
        date: extractedDate,
        category: 'Uncategorized'
      });
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