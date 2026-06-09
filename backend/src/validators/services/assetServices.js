const assetRepository = require('../repositories/assetRepository');
const notificationService = require('./notificationService');
const auditRepository = require('../repositories/auditRepository');

const processAllocation = async (allocationData) => {
    // 1. Business Logic Check: Verify asset availability status
    const asset = await assetRepository.findAssetById(allocationData.assetId);
    if (!asset || asset.status !== 'Available') {
        throw new Error('Asset item is currently un-deployable or already allocated.');
    }

    // 2. Commit operations via Repository Layer
    const newAllocation = await assetRepository.createAllocation(allocationData);
    await assetRepository.updateAssetStatus(allocationData.assetId, 'Allocated');
    
    // 3. System Auditing Pipeline
    await auditRepository.logAction({
        tableName: 'asset_allocations',
        actionType: 'INSERT',
        recordId: newAllocation.id,
        newData: JSON.stringify(newAllocation)
    });

    // 4. Trigger Event Notifications
    await notificationService.createEventNotification({
        userId: allocationData.allocatedBy,
        title: 'Asset Assigned Successfully',
        message: `Asset unit ${asset.asset_code} (${asset.asset_name}) has been dispatched to Employee ${allocationData.employeeId}.`
    });

    return newAllocation;
};

module.exports = { processAllocation };