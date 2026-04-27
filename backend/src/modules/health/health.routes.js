/**
 * =============================================================================
 * HEALTH ROUTES
 * =============================================================================
 * Public and internal health monitoring endpoints.
 * =============================================================================
 */

const express = require('express');
const router = express.Router();
const healthController = require('../admin/health.controller');

router.get('/', healthController.getGeneralHealth);
router.get('/redis', healthController.getRedisHealth);
router.get('/ml-service', healthController.getMLHealth);

module.exports = router;
