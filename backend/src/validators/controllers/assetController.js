const assetService = require('../services/assetService');
const logger = require('../utils/logger');

const allocateAsset = async (req, res, next) => {
    try {
        logger.info(`Initiating asset allocation controller for employee: ${req.body.employeeId}`);
        const allocationResult = await assetService.processAllocation(req.body);
        return res.status(201).json({ success: true, data: allocationResult });
    } catch (error) {
        logger.error(`Error context in Asset Controller: ${error.message}`);
        next(error); // Passes execution onward to central Error Handling Middleware
    }
};

module.exports = { allocateAsset };