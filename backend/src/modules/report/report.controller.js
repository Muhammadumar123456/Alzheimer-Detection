/**
 * =============================================================================
 * REPORT CONTROLLER
 * =============================================================================
 * Request handler for report generation endpoint.
 * Bridges API requests to the Report Service.
 * =============================================================================
 */

const reportService = require('./report.service');
const asyncHandler = require('../../utils/asyncHandler');
const { sendSuccess } = require('../../utils/responseHelper');

/**
 * Generate own aggregated report (for patients)
 * GET /api/report/my
 */
exports.getMyReport = asyncHandler(async (req, res) => {
    const report = await reportService.generateReport(req.user.id);

    sendSuccess(res, 200, 'Report generated successfully', { report });
});

/**
 * Generate report for a specific user (admin/clinician only)
 * GET /api/report/user/:userId
 */
exports.getReportByUserId = asyncHandler(async (req, res) => {
    const report = await reportService.generateReport(req.params.userId);

    sendSuccess(res, 200, 'Report generated successfully', { report });
});
