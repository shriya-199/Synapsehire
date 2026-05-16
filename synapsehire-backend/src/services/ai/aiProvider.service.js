const env = require('../../config/env');
const ApiError = require('../../utils/ApiError');
const logger = require('../../utils/logger');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const withTimeout = async (promiseFactory) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.ai.timeoutMs);

  try {
    return await promiseFactory(controller.signal);
  } finally {
    clearTimeout(timeout);
  }
};

const requestWithRetry = async (fn) => {
  let lastError;

  for (let attempt = 0; attempt <= env.ai.maxRetries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === env.ai.maxRetries) break;
      await sleep(300 * 2 ** attempt);
    }
  }

  throw lastError;
};

const callOpenAI = async ({ schemaName, schema, system, user }) => {
  if (!env.ai.openai.apiKey) {
    throw new ApiError(500, 'OPENAI_API_KEY is not configured');
  }

  const response = await requestWithRetry(() =>
    withTimeout(async (signal) => {
      const apiResponse = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        signal,
        headers: {
          Authorization: `Bearer ${env.ai.openai.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: env.ai.openai.model,
          input: [
            { role: 'system', content: system },
            { role: 'user', content: user }
          ],
          text: {
            format: {
              type: 'json_schema',
              name: schemaName,
              strict: true,
              schema
            }
          }
        })
      });

      if (!apiResponse.ok) {
        const text = await apiResponse.text();
        throw new ApiError(apiResponse.status, `OpenAI request failed: ${text.slice(0, 500)}`);
      }

      return apiResponse.json();
    })
  );

  const outputText =
    response.output_text ||
    response.output?.flatMap((item) => item.content || []).find((item) => item.type === 'output_text')?.text;

  if (!outputText) {
    logger.warn('OpenAI response missing output_text', { responseId: response.id });
    throw new ApiError(502, 'OpenAI returned no structured output');
  }

  return {
    provider: 'openai',
    model: env.ai.openai.model,
    raw: response,
    text: outputText
  };
};

const callGemini = async ({ schema, system, user }) => {
  if (!env.ai.gemini.apiKey) {
    throw new ApiError(500, 'GEMINI_API_KEY is not configured');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${env.ai.gemini.model}:generateContent?key=${env.ai.gemini.apiKey}`;
  const response = await requestWithRetry(() =>
    withTimeout(async (signal) => {
      const apiResponse = await fetch(url, {
        method: 'POST',
        signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: system }]
          },
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `${user}\n\nReturn valid JSON matching this schema exactly:\n${JSON.stringify(schema)}`
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.2
          }
        })
      });

      if (!apiResponse.ok) {
        const text = await apiResponse.text();
        throw new ApiError(apiResponse.status, `Gemini request failed: ${text.slice(0, 500)}`);
      }

      return apiResponse.json();
    })
  );

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new ApiError(502, 'Gemini returned no structured output');

  return {
    provider: 'gemini',
    model: env.ai.gemini.model,
    raw: response,
    text
  };
};

const generateStructured = async (payload) => {
  if (env.ai.provider === 'gemini') return callGemini(payload);
  return callOpenAI(payload);
};

module.exports = {
  generateStructured
};
