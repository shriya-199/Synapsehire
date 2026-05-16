const swaggerUi = require('swagger-ui-express');
const openApiDocument = require('./openapi');

const setupSwagger = (app) => {
  app.get('/api/openapi.json', (_req, res) => {
    res.status(200).json(openApiDocument);
  });

  app.use(
    '/api/docs',
    swaggerUi.serve,
    swaggerUi.setup(openApiDocument, {
      customSiteTitle: 'SynapseHire API Docs',
      customCss: '.swagger-ui .topbar { display: none }'
    })
  );
};

module.exports = setupSwagger;
