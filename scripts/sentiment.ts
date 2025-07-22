/**
 * scripts/sentiment.ts
 * -------------------------------------------------------------
 * Reads *all* screenshots + the Playwright run-log, sends them to
 * Gemini 1.5 Flash, and stores a JSON sentiment report.
 * -------------------------------------------------------------
 */

import fs from 'fs/promises';
import path from 'path';
import { GoogleGenerativeAI, type Part } from '@google/generative-ai';

async function main() {
  /* ---------- env & client ----------------------------------- */
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY env-var is missing');

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    // If you want the newer model, change to: 'gemini-2.5-flash'
    model: 'gemini-1.5-flash',
    generationConfig: { responseMimeType: 'application/json' }
  });

  /* ---------- load artefacts --------------------------------- */
  const runLog = await fs.readFile('artifacts/pw-run.json', 'utf8');

  const snapDir = 'artifacts/snaps';
  const files = (await fs.readdir(snapDir))
    .filter(f => f.endsWith('.png'))
    .sort(); // keeps 01-welcome … 10-finish order

  if (files.length === 0) {
    throw new Error('No screenshots found in artifacts/snaps/');
  }

  /* ---------- craft prompt parts ----------------------------- */
  const promptParts: Part[] = [
    {
      text: `You are an expert UX psychologist. Based on the run log and ALL screenshots below,
return ONLY valid JSON with this schema:

{
  "overall_sentiment": -5 to 5,
  "delight_moments":  [ { "screen": string, "note": string } ],
  "friction_points":  [ { "screen": string, "note": string } ],
  "copy_clarity":      1 to 5,
  "one_sentence_summary": string
}

RUN_LOG (truncated to first 6 kB):
${runLog.slice(0, 6000)}

--- BEGIN SCREENSHOTS ---`
    }
  ];

  for (const file of files) {
    const slug = path.parse(file).name; // e.g., '03-product-select'
    const data = await fs.readFile(path.join(snapDir, file), { encoding: 'base64' });

    promptParts.push(
      { text: `SCREENSHOT ${slug}` },
      { inlineData: { mimeType: 'image/png', data } }
    );
  }

  /* ---------- call Gemini & save report ---------------------- */
  const res = await model.generateContent(promptParts);
  const json = res.response.text(); // JSON because responseMimeType = application/json

  await fs.writeFile('artifacts/sentiment.json', JSON.stringify(JSON.parse(json), null, 2));
  console.log('✓ artifacts/sentiment.json created');
}

main().catch(err => {
  console.error('Sentiment script failed:', err);
  process.exitCode = 1;
});
