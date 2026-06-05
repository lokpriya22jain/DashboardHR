// Import the database connection pool from your config folder
const pool = require('../config/db');

async function approveLeaveWorkflow(leaveId, approvedById, role, action, remarks) {
    // Get a dedicated worker client from the connection pool
    const client = await pool.connect();
    try {
        // Start your safe SQL Transaction block
        await client.query('BEGIN');

        // 1. Fetch details of the leave request
        const leaveQuery = await client.query(
            'SELECT employee_id, leave_type_id, total_days, status FROM leave_applications WHERE id = $1',
            [leaveId]
        );
        const leave = leaveQuery.rows[0];

        if (!leave) {
            throw new Error("Leave request record not found.");
        }

        let nextStatus = 'Pending';
        
        // Handle Multilevel business logic rules from your guidelines
        if (role === 'manager' && action === 'Approve') {
            nextStatus = 'Manager Approved';
        } else if (role === 'hr' && action === 'Approve') {
            nextStatus = 'Approved';
        } else if (action === 'Reject') {
            nextStatus = 'Rejected';
        }

        // 2. Update status of the leave application
        await client.query(
            'UPDATE leave_applications SET status = $1 WHERE id = $2',
            [nextStatus, leaveId]
        );

        // 3. Record history details inside the audit trail table
        await client.query(
            'INSERT INTO approval_history (leave_id, approved_by, action, remarks) VALUES ($1, $2, $3, $4)',
            [leaveId, approvedById, nextStatus, remarks]
        );

        // 4. If HR completely approves, deduct the available balance automatically
        if (nextStatus === 'Approved') {
            await client.query(
                `UPDATE leave_balance 
                 SET available_days = available_days - $1 
                 WHERE employee_id = $2 AND leave_type_id = $3`,
                [leave.total_days, leave.employee_id, leave.leave_type_id]
            );
        }

        // Complete the operation successfully and save changes
        await client.query('COMMIT');
        return { success: true, status: nextStatus };
    } catch (error) {
        // Safe rollback: wipes out partial changes if any command fails midway
        await client.query('ROLLBACK');
        throw error;
    } finally {
        // Always release the client back to the connection pool
        client.release();
    }
}

module.exports = { approveLeaveWorkflow };