const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const CodeRun = require('../models/CodeRun');
const Assessment = require('../models/Assessment');
const { getInterviewById } = require('./interview.service');

const runWithExternalRunner = async ({ language, code, stdin }) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.codeRunner.timeoutMs);

  try {
    const response = await fetch(`${env.codeRunner.url.replace(/\/$/, '')}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ language, code, stdin }),
      signal: controller.signal
    });

    if (!response.ok) {
      throw new ApiError(502, 'Code runner failed');
    }

    return response.json();
  } finally {
    clearTimeout(timeout);
  }
};

const runCode = async (user, payload) => {
  const interview = await getInterviewById(user, payload.interviewId);
  const assessment = await Assessment.findById(interview.assessmentId);
  const selectedQuestion = payload.questionId
    ? assessment?.questions?.find((question) => String(question._id) === String(payload.questionId))
    : null;
  const testCases = selectedQuestion?.testCases?.length
    ? selectedQuestion.testCases
    : [{ input: payload.stdin || '', expectedOutput: payload.expectedOutput || '', hidden: false }];

  const codeRun = await CodeRun.create({
    interviewId: payload.interviewId,
    userId: user._id,
    questionId: payload.questionId,
    language: payload.language,
    code: payload.code,
    stdin: payload.stdin,
    expectedOutput: payload.expectedOutput,
    status: env.codeRunner.url ? 'RUNNING' : 'REJECTED'
  });

  if (!env.codeRunner.url) {
    codeRun.error = 'Code execution requires an isolated CODE_RUNNER_URL service. The API server does not execute untrusted code.';
    await codeRun.save();
    return codeRun;
  }

  try {
    const startedAt = Date.now();
    const results = [];
    for (const testCase of testCases) {
      const result = await runWithExternalRunner({ ...payload, stdin: testCase.input || '' });
      const actual = String(result.stdout || '').trim();
      const expected = String(testCase.expectedOutput || '').trim();
      results.push({
        input: testCase.input || '',
        expectedOutput: testCase.expectedOutput || '',
        actualOutput: result.stdout || '',
        passed: actual === expected,
        hidden: Boolean(testCase.hidden),
        error: result.stderr || result.error || ''
      });
    }
    const firstResult = results[0] || {};
    codeRun.status = 'COMPLETED';
    codeRun.stdout = firstResult.actualOutput || '';
    codeRun.stderr = firstResult.error || '';
    codeRun.runtimeMs = Date.now() - startedAt;
    codeRun.passed = results.length ? results.every((item) => item.passed) : undefined;
    codeRun.testCaseResults = results;
  } catch (error) {
    codeRun.status = 'FAILED';
    codeRun.error = error.message;
  }

  await codeRun.save();
  return codeRun;
};

const listRuns = async (user, interviewId) => {
  await getInterviewById(user, interviewId);
  return CodeRun.find({ interviewId }).sort({ createdAt: -1 }).limit(25);
};

module.exports = {
  runCode,
  listRuns
};
