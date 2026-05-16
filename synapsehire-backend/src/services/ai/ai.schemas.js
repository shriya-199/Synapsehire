const scoreProperties = {
  technicalCorrectness: { type: 'number', minimum: 0, maximum: 100 },
  problemSolving: { type: 'number', minimum: 0, maximum: 100 },
  codeQuality: { type: 'number', minimum: 0, maximum: 100 },
  communication: { type: 'number', minimum: 0, maximum: 100 },
  debugging: { type: 'number', minimum: 0, maximum: 100 },
  efficiency: { type: 'number', minimum: 0, maximum: 100 },
  confidence: { type: 'number', minimum: 0, maximum: 100 },
  keywordCoverage: { type: 'number', minimum: 0, maximum: 100 },
  hiringProbability: { type: 'number', minimum: 0, maximum: 100 }
};

const interviewAnalysisSchema = {
  type: 'object',
  additionalProperties: false,
  required: [
    'scores',
    'technicalKeywords',
    'strengths',
    'weaknesses',
    'risks',
    'evidence',
    'summary',
    'feedback',
    'recommendation'
  ],
  properties: {
    scores: {
      type: 'object',
      additionalProperties: false,
      required: Object.keys(scoreProperties),
      properties: scoreProperties
    },
    technicalKeywords: {
      type: 'object',
      additionalProperties: false,
      required: ['expected', 'matched', 'missing'],
      properties: {
        expected: { type: 'array', items: { type: 'string' } },
        matched: { type: 'array', items: { type: 'string' } },
        missing: { type: 'array', items: { type: 'string' } }
      }
    },
    strengths: { type: 'array', items: { type: 'string' } },
    weaknesses: { type: 'array', items: { type: 'string' } },
    risks: { type: 'array', items: { type: 'string' } },
    evidence: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['category', 'signal', 'weight'],
        properties: {
          category: { type: 'string' },
          signal: { type: 'string' },
          weight: { type: 'number', minimum: 0, maximum: 1 }
        }
      }
    },
    summary: { type: 'string' },
    feedback: { type: 'string' },
    recommendation: {
      type: 'string',
      enum: ['STRONG_HIRE', 'HIRE', 'LEAN_HIRE', 'LEAN_NO_HIRE', 'NO_HIRE']
    }
  }
};

const resumeMatchSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['score', 'matchedSkills', 'missingSkills', 'seniorityFit', 'domainFit', 'summary', 'risks'],
  properties: {
    score: { type: 'number', minimum: 0, maximum: 100 },
    matchedSkills: { type: 'array', items: { type: 'string' } },
    missingSkills: { type: 'array', items: { type: 'string' } },
    seniorityFit: { type: 'number', minimum: 0, maximum: 100 },
    domainFit: { type: 'number', minimum: 0, maximum: 100 },
    summary: { type: 'string' },
    risks: { type: 'array', items: { type: 'string' } }
  }
};

const githubEvaluationSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['score', 'signals', 'languages', 'notableRepositories', 'strengths', 'weaknesses', 'summary'],
  properties: {
    score: { type: 'number', minimum: 0, maximum: 100 },
    signals: {
      type: 'object',
      additionalProperties: false,
      required: ['consistency', 'projectComplexity', 'codeQuality', 'documentation', 'testing', 'collaboration'],
      properties: {
        consistency: { type: 'number', minimum: 0, maximum: 100 },
        projectComplexity: { type: 'number', minimum: 0, maximum: 100 },
        codeQuality: { type: 'number', minimum: 0, maximum: 100 },
        documentation: { type: 'number', minimum: 0, maximum: 100 },
        testing: { type: 'number', minimum: 0, maximum: 100 },
        collaboration: { type: 'number', minimum: 0, maximum: 100 }
      }
    },
    languages: { type: 'array', items: { type: 'string' } },
    notableRepositories: { type: 'array', items: { type: 'string' } },
    strengths: { type: 'array', items: { type: 'string' } },
    weaknesses: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' }
  }
};

module.exports = {
  interviewAnalysisSchema,
  resumeMatchSchema,
  githubEvaluationSchema
};
