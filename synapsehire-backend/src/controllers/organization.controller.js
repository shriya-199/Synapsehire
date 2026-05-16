const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('./base.controller');
const Organization = require('../models/Organization');

const listOrganizations = asyncHandler(async (_req, res) => {
  const organizations = await Organization.find({})
    .select('_id name domain plan')
    .sort({ name: 1 })
    .limit(200);

  sendSuccess(res, organizations, 'Companies retrieved');
});

module.exports = {
  listOrganizations
};
