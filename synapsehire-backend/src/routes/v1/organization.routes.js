const express = require('express');
const organizationController = require('../../controllers/organization.controller');
const { authenticate } = require('../../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);
router.get('/', organizationController.listOrganizations);

module.exports = router;
