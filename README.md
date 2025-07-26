# Hackday_AI_Tester

FrankieFest 2025 project. An AI “user” that runs through onboarding or application flows and critiques them like a real customer. It outputs plain‑English feedback with emotional tone, structured UX scores, and evidence so product and design can iterate fast.

## Why this exists
Traditional QA proves the path works. It often misses confusion, trust gaps, and fragile error handling. This tool gives early signal on the human experience before real users ever touch the flow.

## What it does
- Persona‑driven journeys through sign‑up and similar flows
- Feedback in natural language with sentiment and concrete examples
- Scores for usability, learnability, efficiency, accessibility, trust, and error handling
- Evidence via traces or recordings and side‑by‑side URL comparisons

## How it works
- Browser automation drives the flow and captures context
- An LLM interprets the experience and produces feedback and scores
- Reports compile into a single, shareable package for CI or design review

## Quick start
```bash
# Node 20 recommended
npm ci
npx playwright install
# run a sample persona against a target URL
npm run start -- --url=https://example.com/signup --persona=happy_jane
# or run the test suite
npx playwright test
