const PROMPT_VERSION = 'ai-eval-2026-05-15';
const RUBRIC_VERSION = 'synapsehire-rubric-v1';

const systemPrompt = `
You are SynapseHire's interview evaluation engine. Evaluate candidates using evidence from the supplied transcript, code, resume, job description, and GitHub data.

Rules:
- Return only schema-compliant JSON.
- Do not infer protected-class attributes.
- Score only job-relevant competencies.
- Penalize vague answers, missing tradeoffs, and unsupported claims.
- Reward clear reasoning, correctness, edge-case awareness, debugging strategy, and communication clarity.
- Treat hiringProbability as decision support, not a final hiring decision.
`;

const buildInterviewPrompt = ({ transcript, code, question, rubric, expectedKeywords }) => `
Evaluate this coding interview.

Question:
${question || 'No question provided'}

Expected technical keywords:
${(expectedKeywords || []).join(', ') || 'Not provided'}

Rubric:
${JSON.stringify(rubric || {}, null, 2)}

Candidate code:
\`\`\`
${code || ''}
\`\`\`

Transcript / candidate answers:
${transcript || ''}
`;

const buildResumeMatchPrompt = ({ resumeText, jobDescription, requiredSkills }) => `
Evaluate how well this resume matches the job.

Required skills:
${(requiredSkills || []).join(', ') || 'Not provided'}

Job description:
${jobDescription || ''}

Resume:
${resumeText || ''}
`;

const buildGithubPrompt = ({ username, repositories, profileSummary }) => `
Evaluate this GitHub profile for developer hiring signal.

Username: ${username}

Profile summary:
${profileSummary || ''}

Repositories:
${JSON.stringify(repositories || [], null, 2)}
`;

module.exports = {
  PROMPT_VERSION,
  RUBRIC_VERSION,
  systemPrompt,
  buildInterviewPrompt,
  buildResumeMatchPrompt,
  buildGithubPrompt
};
