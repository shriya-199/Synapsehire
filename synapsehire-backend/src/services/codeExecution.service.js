const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const CodeRun = require('../models/CodeRun');
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
  await getInterviewById(user, payload.interviewId);

  const codeRun = await CodeRun.create({
    interviewId: payload.interviewId,
    userId: user._id,
    language: payload.language,
    code: payload.code,
    stdin: payload.stdin,
    status: env.codeRunner.url ? 'RUNNING' : 'REJECTED'
  });

  if (!env.codeRunner.url) {
    codeRun.error = 'Code execution requires an isolated CODE_RUNNER_URL service. The API server does not execute untrusted code.';
    await codeRun.save();
    return codeRun;
  }

  try {
    const startedAt = Date.now();
    const result = await runWithExternalRunner(payload);
    codeRun.status = 'COMPLETED';
    codeRun.stdout = result.stdout || '';
    codeRun.stderr = result.stderr || '';
    codeRun.runtimeMs = result.runtimeMs || Date.now() - startedAt;
    codeRun.memoryMb = result.memoryMb;
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
