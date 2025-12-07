const db = require("../db");

/**
 * Logs an action to the audit_logs table.
 * @param {Object} params
 * @param {string} params.userId - The ID of the user performing the action (optional).
 * @param {string} params.action - The action performed (e.g., 'LOGIN', 'CREATE_BOOKING').
 * @param {string} params.entityType - The type of entity affected (e.g., 'USER', 'BOOKING').
 * @param {string} params.entityId - The ID of the entity affected (optional).
 * @param {Object} params.details - Additional details about the action (optional).
 * @param {string} params.ipAddress - The IP address of the user (optional).
 */
const logAction = async ({
  userId,
  action,
  entityType,
  entityId,
  details,
  ipAddress,
}) => {
  try {
    const query = `
      INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    const values = [
      userId || null,
      action,
      entityType,
      entityId || null,
      details ? JSON.stringify(details) : null,
      ipAddress || null,
    ];
    await db.query(query, values);
  } catch (err) {
    console.error("Failed to write audit log:", err);
    // We don't throw here to prevent failing the main request just because logging failed
  }
};

module.exports = { logAction };
