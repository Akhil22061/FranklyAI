import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

/* ---------- read artefacts (keep under ~8 kB each) ---------------- */
const runLog  = fs.readFileSync('artifacts/pw-run.json', 'utf8');
const welcome = fs.readFileSync('artifacts/snaps/01-welcome.png', 'base64');
const consent = fs.readFileSync('artifacts/snaps/02-consent.png', 'base64');

/* ---------- Gemini client ---------------------------------------- */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

/* ---------- craft the prompt ------------------------------------- */
const prompt = `
You are an expert UX psychologist. Using the run log and screenshots,
return ONLY valid JSON:

{
  "overall_sentiment": -5…5,
  "delight_moments": [ { "screen": "02-consent", "note": string } ],
  "friction_points": [ { "screen": "04-debt", "note": string } ],
  "copy_clarity": 1…5,
  "one_sentence_summary": string
}

RUN_LOG:
${runLog.slice(0, 6000)}

SCREENSHOT_01_WELCOME_BASE64:
${welcome}

SCREENSHOT_02_CONSENT_BASE64:
${consent}
`;

const result = await model.generateContent(prompt);
const json = result.response.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';

fs.writeFileSync('artifacts/sentiment.json', json);
console.log('sentiment.json created');