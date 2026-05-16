const keywordGroups = {
  frontend: ['react', 'redux', 'typescript', 'javascript', 'tailwind', 'html', 'css', 'next.js', 'vite'],
  backend: ['node', 'express', 'mongodb', 'redis', 'jwt', 'api', 'docker', 'microservices'],
  devops: ['aws', 'docker', 'kubernetes', 'nginx', 'ci/cd', 'github actions', 'linux'],
  data: ['python', 'sql', 'pandas', 'spark', 'etl', 'machine learning', 'tensorflow']
};

const roleKeywords = {
  'frontend developer': keywordGroups.frontend,
  'react developer': keywordGroups.frontend,
  'backend developer': keywordGroups.backend,
  'node.js developer': keywordGroups.backend,
  'full stack developer': [...keywordGroups.frontend, ...keywordGroups.backend],
  'mern stack developer': ['react', 'node', 'express', 'mongodb', 'javascript', 'redux'],
  'devops engineer': keywordGroups.devops,
  'data engineer': keywordGroups.data,
  'machine learning engineer': ['python', 'machine learning', 'tensorflow', 'pandas', 'sql'],
  'qa automation engineer': ['testing', 'selenium', 'cypress', 'jest', 'automation', 'api']
};

const unique = (items) => [...new Set(items.filter(Boolean))];

const extractText = (file) => {
  const raw = file?.buffer?.toString('utf8') || '';
  return `${file?.originalname || ''} ${raw}`.toLowerCase();
};

const parseResume = ({ file, appliedRole, organizationId }) => {
  const text = extractText(file);
  const allKeywords = unique(Object.values(keywordGroups).flat());
  const techStack = allKeywords.filter((keyword) => text.includes(keyword.toLowerCase()));
  const expected = roleKeywords[String(appliedRole || '').toLowerCase()] || allKeywords.slice(0, 10);
  const matchedKeywords = expected.filter((keyword) => text.includes(keyword.toLowerCase()));
  const missingKeywords = expected.filter((keyword) => !matchedKeywords.includes(keyword));

  const roleScore = expected.length ? Math.round((matchedKeywords.length / expected.length) * 45) : 0;
  const breadthScore = Math.min(25, techStack.length * 4);
  const resumeScore = file?.size ? 15 : 0;
  const companyScore = organizationId ? 10 : 0;
  const structureScore = text.includes('experience') || text.includes('project') ? 5 : 0;
  const atsScore = Math.min(100, roleScore + breadthScore + resumeScore + companyScore + structureScore);

  return {
    atsScore,
    techStack,
    resumeParsedAt: new Date(),
    resumeSignals: {
      matchedKeywords,
      missingKeywords,
      summary: matchedKeywords.length
        ? `Matched ${matchedKeywords.length} role keywords for ${appliedRole || 'selected role'}.`
        : 'Resume uploaded. Add more role-specific technologies to improve ATS score.'
    }
  };
};

module.exports = {
  parseResume
};
