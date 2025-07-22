/**
 * scripts/persona-feedback.js
 * -------------------------------------------------------------
 * Reads a demo transcript, iterates through predefined personas,
 * asks Gemini for a UX critique from each persona's perspective,
 * and writes the feedback to JSON files.
 * -------------------------------------------------------------
 */

import fs from 'fs/promises';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SentimentAnalyzer, PorterStemmer } from 'sentiment';

async function main() {
  /* ---------- Gemini client setup ----------------------------- */
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('The GEMINI_API_KEY environment variable is not set!');
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  // Configure the model to use Gemini 1.5 Flash and to expect a JSON response
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });

  /* ---------- Load personas and transcript -------------------- */
  const personasFile = await fs.readFile('scripts/personas/persons.json', 'utf8');
  const { persons: personas } = JSON.parse(personasFile);

  // Stash whatever telemetry or page text your E2E script produced
  const demoTranscript = await fs.readFile('artifacts/demo-notes.txt', 'utf8');

  // Process each persona
  for (const p of personas) {
    console.log(`Processing persona: ${p.name}...`);

    // 1️⃣ Classic sentiment analysis (quick numeric check)
    const sa = new SentimentAnalyzer('English', PorterStemmer, 'afinn');
    const classicSentiment = sa.getSentiment(demoTranscript.split(/\s+/));

    // 2️⃣ LLM-flavored persona critique using Gemini
    const prompt = `
      You are to adopt the following persona: ${p.persona_prompt}.

      After reviewing the following onboarding flow transcript, you will provide feedback structured as a JSON object. Do not include any text outside of the JSON object.

      TRANSCRIPT:
      ---
      ${demoTranscript}
      ---

      Based on the transcript and your persona, provide the following:
      1. A one-sentence emotional summary.
      2. Scores from 1 to 5 for "Clarity", "Trust", "Speed", and "Friction".
      3. Two actionable suggestions for improvement.

      Return ONLY a valid JSON object with the following schema:
      {
        "emotional_summary": string,
        "scores": {
          "clarity": number,
          "trust": number,
          "speed": number,
          "friction": number
        },
        "suggestions": [string, string]
      }
    `;

    try {
      const result = await model.generateContent(prompt);
      const llmResponseText = result.response.text();
      const llmJson = JSON.parse(llmResponseText);

      // 3️⃣ Persist the combined results
      const outPath = `artifacts/feedback-${p.name.replace(/\s+/g, '_')}.json`;
      const outputData = {
        persona: p.name,
        classicSentiment: classicSentiment, // usually −5 … +5
        llm: llmJson,
      };

      await fs.writeFile(outPath, JSON.stringify(outputData, null, 2));
      console.log(`✓ Wrote ${outPath}`);

    } catch (error) {
      console.error(`Failed to get feedback for persona: ${p.name}`, error);
    }
  }
}

main().catch(err => {
  console.error('Script failed:', err);
  process.exitCode = 1;
});
