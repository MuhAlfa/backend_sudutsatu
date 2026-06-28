// migrations/update_schema.js
const db = require('../config/db');

const runMigration = async () => {
    console.log('Running database migration...');
    try {
        // The ALTER TABLE query, corrected to avoid syntax errors.
        const alterQuery = "ALTER TABLE bookings " +
            "ADD COLUMN IF NOT EXISTS `venue_name` VARCHAR(255) AFTER `user_id`, " +
            "ADD COLUMN IF NOT EXISTS `team_name` VARCHAR(255) AFTER `venue_name`, " +
            "ADD COLUMN IF NOT EXISTS `payment_method` VARCHAR(50) AFTER `total_price`, " +
            "ADD COLUMN IF NOT EXISTS `payment_proof` VARCHAR(255) AFTER `payment_method`, " +
            "ADD COLUMN IF NOT EXISTS `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER `created_at`, " +
            "MODIFY COLUMN `status` ENUM('pending_payment', 'pending_verification', 'confirmed', 'cancelled', 'completed', 'failed') DEFAULT 'pending_verification'";

        await db.query(alterQuery);
        console.log('✅ Table "bookings" has been updated successfully.');

    } catch (error) {
        // Check for "Duplicate column name" error
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.warn('⚠️  Migration script has likely been run before. Columns already exist.');
        } else {
            console.error('❌ Error updating the database schema:', error);
            process.exit(1); // Exit with error
        }
    } finally {
        // End the database connection pool
        if (db && db.end) {
            db.end();
            console.log('Database connection closed.');
        }
    }
};

runMigration();
