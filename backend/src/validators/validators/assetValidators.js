const Joi = require('joi');

const validateAssetAllocation = (req, res, next) => {
    const schema = Joi.object({
        assetId: Joi.number().integer().required(),
        employeeId: Joi.string().min(3).max(50).required(),
        allocatedBy: Joi.number().integer().optional(),
        allocatedDate: Joi.date().iso().required()
    });

    const { error } = schema.validate(req.body);
    if (error) {
        return res.status(400).json({ status: 'Validation Error', message: error.details[0].message });
    }
    next();
};

module.exports = { validateAssetAllocation };