const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const env = require('./config/env');
const logger = require('./utils/logger');
const routesV1 = require('./routes/v1');
const setupSwagger = require('./docs/swagger');
const { applySecurityMiddleware } = require('./middleware/security.middleware');
const { notFound, errorHandler } = require('./middleware/error.middleware');

const app = express();

applySecurityMiddleware(app);

app.use(
  morgan(env.isProduction ? 'combined' : 'dev', {
    stream: {
      write: (message) => logger.http(message.trim())
    }
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    service: 'SynapseHire API',
    version: env.apiVersion
  });
});

setupSwagger(app);

app.use(`/api/${env.apiVersion}`, routesV1);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
