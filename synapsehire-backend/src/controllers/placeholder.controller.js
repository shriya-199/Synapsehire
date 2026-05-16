const { sendSuccess } = require('./base.controller');

const notImplemented = (moduleName) => (_req, res) => {
  sendSuccess(
    res,
    {
      module: moduleName,
      status: 'planned'
    },
    `${moduleName} module route is registered`
  );
};

module.exports = {
  notImplemented
};
