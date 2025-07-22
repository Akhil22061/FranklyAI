/**
 * scripts/sentiment.ts
 * -------------------------------------------------------------
 * Reads Playwright artefacts, asks Gemini for a UX-sentiment report,
 * and writes JSON → artifacts/sentiment.json
 * -------------------------------------------------------------
 */

import fs from 'fs/promises';
import { GoogleGenerativeAI, Part } from '@google/generative-ai';

async function main() {
  /* ---------- read artefacts (keep each chunk < 8 kB) ---------- */
  const runLog  = await fs.readFile('artifacts/pw-run.json', 'utf8');
  const welcome = await fs.readFile('artifacts/snaps/01-welcome.png', { encoding: 'base64' });
  const consent = await fs.readFile('artifacts/snaps/02-consent.png', { encoding: 'base64' });

  /* ---------- Gemini client ----------------------------------- */
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY env-var is missing');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    // If you want the newer model, change to: 'gemini-2.5-flash'
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  /* ---------- craft the prompt as an array of parts ----------- */
  const promptParts: Part[] = [
    {
      text: `You are an expert UX psychologist. Based on the following run log and screenshots, return ONLY valid JSON with the specified schema.

JSON Schema:
{
  "overall_sentiment": "A score from -5 (very negative) to 5 (very positive).",
  "delight_moments":  [ { "screen": "Screen name or description", "note": "Specific delightful interaction." } ],
  "friction_points":  [ { "screen": "Screen name or description", "note": "Specific point of friction or confusion." } ],
  "copy_clarity":     "A score from 1 (very unclear) to 5 (very clear).",
  "one_sentence_summary": "A concise summary of the overall user experience."
}

---
RUN_LOG:
${runLog.slice(0, 6000)}

---
SCREENSHOT 01: Welcome Screen`,
    },
    {
      inlineData: { mimeType: 'image/png', data: welcome },
    },
    {
      text: `---
SCREENSHOT 02: Consent Screen`,
    },
    {
      inlineData: { mimeType: 'image/png', data: consent },
    },
  ];

  /* ---------- call Gemini & save report ----------------------- */
  const result = await model.generateContent(promptParts);
  const json = result.response.text();

  await fs.writeFile('artifacts/sentiment.json', JSON.stringify(JSON.parse(json), null, 2));
  console.log('✓ sentiment.json created');
}

main().catch(err => {
  console.error('Sentiment script failed:', err);
  process.exitCode = 1;
});
