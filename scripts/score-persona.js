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
// Corrected import for the 'sentiment' CommonJS module
import Sentiment from 'sentiment';

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
    // The Sentiment constructor is imported as the default. PorterStemmer is a property on it.
    const sentimentAnalyzer = new Sentiment();
    const classicSentiment = sentimentAnalyzer.analyze(demoTranscript, { extras: {}, language: 'en' }).score;


    // 2️⃣ LLM-flavored persona critique using Gemini
    const prompt = `
      You are to adopt the following persona: ${p.persona_prompt}.

      You are testing a credit card application. As you review the following transcript of the user flow, be honest and provide feedback on how the application process makes you feel (happy, frustrated, angry, etc.).

      TRANSCRIPT OF YOUR EXPERIENCE:
      ---
      ${demoTranscript}
      ---

      Based on the transcript and your persona, provide detailed feedback. Return ONLY a valid JSON object with the following schema.

      JSON SCHEMA:
      {
        "emotional_summary": "A one-sentence summary of your emotional state (e.g., happy, frustrated, confused).",
        "overall_experience_feedback": "A paragraph describing your overall experience.",
        "scores": {
          "usability": "Rate 1-10",
          "learnability": "Rate 1-10",
          "efficiency": "Rate 1-10",
          "accessibility": "Rate 1-10",
          "trust": "Rate 1-10",
          "error_handling": "Rate 1-10. If no errors occurred, rate highly."
        },
        "completion_details": {
          "was_completed": "boolean, did you finish the application?",
          "stuck_point": "string, if you did not complete, where did you get stuck? Null if completed.",
          "questions_for_support": "Array of strings. If you got stuck, what questions would you ask a support operator for help?"
        },
        "performance_metrics": {
          "estimated_total_clicks": "number, estimate the total clicks to complete the flow.",
          "estimated_time_per_page": "Array of objects, e.g., [{ 'page': 'Welcome Screen', 'time_seconds': 15 }]. Estimate time spent on each step.",
          "retries": "number, how many times did you have to retry an action?"
        },
        "suggestions": "Array of two actionable suggestions for improvement."
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
