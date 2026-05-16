const bearerAuth = {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT'
};

const successEnvelope = (schemaRef) => ({
  type: 'object',
  properties: {
    success: { type: 'boolean', example: true },
    message: { type: 'string' },
    data: schemaRef
  }
});

const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'SynapseHire API',
    version: '1.0.0',
    description:
      'Production API for SynapseHire: authentication, interviews, collaborative coding, AI evaluation, monitoring, analytics, and reporting.'
  },
  servers: [
    {
      url: `/api/${process.env.API_VERSION || 'v1'}`,
      description: 'Current API version'
    }
  ],
  tags: [
    { name: 'Health' },
    { name: 'Auth' },
    { name: 'Interviews' },
    { name: 'Code Execution' },
    { name: 'AI' },
    { name: 'Monitoring' },
    { name: 'Analytics' }
  ],
  components: {
    securitySchemes: {
      bearerAuth
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          role: { type: 'string', enum: ['ADMIN', 'RECRUITER', 'CANDIDATE', 'INTERVIEWER'] },
          status: { type: 'string' }
        }
      },
      LoginRequest: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', format: 'password' }
        }
      },
      SignupRequest: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
          organizationName: { type: 'string' }
        }
      },
      Interview: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          assessmentId: { type: 'string' },
          candidateId: { type: 'string' },
          status: { type: 'string' },
          scheduledAt: { type: 'string', format: 'date-time' },
          finalScore: { type: 'number' }
        }
      },
      AIAnalyzeInterviewRequest: {
        type: 'object',
        required: ['interviewId', 'transcript'],
        properties: {
          interviewId: { type: 'string' },
          transcript: { type: 'string' },
          code: { type: 'string' },
          question: { type: 'string' },
          expectedKeywords: { type: 'array', items: { type: 'string' } },
          rubric: { type: 'object' }
        }
      },
      MonitoringAlert: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          interviewId: { type: 'string' },
          type: { type: 'string' },
          severity: { type: 'string' },
          score: { type: 'number' },
          message: { type: 'string' }
        }
      },
      AnalyticsOverview: {
        type: 'object',
        properties: {
          cards: { type: 'object' },
          byStatus: { type: 'object' },
          recommendationCounts: { type: 'object' }
        }
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          requestId: { type: 'string' }
        }
      }
    },
    responses: {
      Unauthorized: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      },
      Forbidden: {
        description: 'Access denied',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/Error' }
          }
        }
      }
    }
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          200: { description: 'Service health' }
        }
      }
    },
    '/auth/signup/candidate': {
      post: {
        tags: ['Auth'],
        summary: 'Candidate signup',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/SignupRequest' } }
          }
        },
        responses: {
          201: {
            description: 'Candidate created',
            content: {
              'application/json': { schema: successEnvelope({ type: 'object' }) }
            }
          }
        }
      }
    },
    '/auth/signup/recruiter': {
      post: {
        tags: ['Auth'],
        summary: 'Recruiter signup',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/SignupRequest' } }
          }
        },
        responses: {
          201: { description: 'Recruiter created' }
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/LoginRequest' } }
          }
        },
        responses: {
          200: { description: 'Login successful' },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Current user',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Current user' },
          401: { $ref: '#/components/responses/Unauthorized' }
        }
      }
    },
    '/interviews': {
      get: {
        tags: ['Interviews'],
        summary: 'List interviews',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Interview list' } }
      },
      post: {
        tags: ['Interviews'],
        summary: 'Schedule interview',
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: 'Interview scheduled' } }
      }
    },
    '/code/run': {
      post: {
        tags: ['Code Execution'],
        summary: 'Run code through isolated runner',
        security: [{ bearerAuth: [] }],
        responses: { 201: { description: 'Code run created' } }
      }
    },
    '/ai/interviews/analyze': {
      post: {
        tags: ['AI'],
        summary: 'Analyze a full interview',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': { schema: { $ref: '#/components/schemas/AIAnalyzeInterviewRequest' } }
          }
        },
        responses: {
          201: { description: 'AI evaluation completed' },
          403: { $ref: '#/components/responses/Forbidden' }
        }
      }
    },
    '/monitoring/interviews/{interviewId}/dashboard': {
      get: {
        tags: ['Monitoring'],
        summary: 'Recruiter monitoring dashboard',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'interviewId', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Monitoring dashboard' } }
      }
    },
    '/analytics/overview': {
      get: {
        tags: ['Analytics'],
        summary: 'Recruiter analytics overview',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'from', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'to', in: 'query', schema: { type: 'string', format: 'date' } },
          { name: 'status', in: 'query', schema: { type: 'string' } }
        ],
        responses: {
          200: {
            description: 'Analytics overview',
            content: {
              'application/json': {
                schema: successEnvelope({ $ref: '#/components/schemas/AnalyticsOverview' })
              }
            }
          }
        }
      }
    },
    '/analytics/export/reports.csv': {
      get: {
        tags: ['Analytics'],
        summary: 'Export interview reports as CSV',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'CSV export',
            content: {
              'text/csv': {
                schema: { type: 'string' }
              }
            }
          }
        }
      }
    }
  }
};

module.exports = openApiDocument;
