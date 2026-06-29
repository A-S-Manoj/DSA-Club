const feedbackPrompt = ({ problem, transcript }) => `
You are a senior engineer writing a post-interview assessment.

PROBLEM:
Title: ${problem.title}
Difficulty: ${problem.difficulty}
Description: ${problem.description}

FULL INTERVIEW TRANSCRIPT:
${transcript}

SCORING CRITERIA:

CLARITY (out of 10)
10    Exceptionally clear, logical flow, correct terminology throughout
7-9   Clear with minor gaps
4-6   Understandable but disorganised or imprecise
1-3   Difficult to follow, significant terminology errors

TECHNICAL ACCURACY (out of 10)
10    Correct solution, correct complexity, all edge cases, strong follow-ups
7-9   Correct solution, minor gaps in edge cases or complexity
4-6   Partially correct, missed important cases
1-3   Fundamental errors in solution or understanding

Respond with this exact JSON and nothing else.
No markdown. No code blocks. No explanation outside the JSON.

{
  "clarityScore": <number 1-10>,
  "technicalScore": <number 1-10>,
  "strengths": [
    "<specific observation from transcript>",
    "<specific observation from transcript>"
  ],
  "improvements": [
    "<specific actionable suggestion>",
    "<specific actionable suggestion>"
  ],
  "summary": "<2-3 sentence overall assessment>"
}

Strengths and improvements must reference specific things
the candidate said — not generic statements.
`;

export default feedbackPrompt;