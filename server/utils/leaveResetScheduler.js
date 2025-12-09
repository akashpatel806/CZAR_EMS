const Employee = require('../model/employeeModel');

/**
 * Reset all employees' leave balance to 20 at the start of each year
 * Called on server startup and scheduled to run at midnight on Jan 1st
 */

// Store the last reset date in memory
let lastResetDate = null;

// Function to perform the actual reset
const performLeaveReset = async () => {
  try {
    const result = await Employee.updateMany(
      {},
      { availableLeaves: 20 },
      { multi: true }
    );

    const timestamp = new Date().toISOString();
    console.log(`✅ [${timestamp}] Annual leave reset completed`);
    console.log(`   Updated ${result.modifiedCount} employees`);
    
    lastResetDate = new Date();
    return result;
  } catch (error) {
    console.error('❌ Error during annual leave reset:', error);
    throw error;
  }
};

// Check if reset is needed (on server startup)
const checkAndResetLeaves = async () => {
  try {
    const now = new Date();
    const currentYear = now.getFullYear();
    const janFirst = new Date(currentYear, 0, 1); // January 1st of current year

    // If we haven't reset yet this year, do it now
    if (!lastResetDate || lastResetDate.getFullYear() < currentYear) {
      console.log('🔄 Checking if annual leave reset is needed...');
      
      // Check if any employee was updated after Jan 1st of current year
      const recentlyUpdated = await Employee.findOne({
        updatedAt: { $gte: janFirst }
      }).sort({ updatedAt: -1 });

      if (!recentlyUpdated || recentlyUpdated.availableLeaves !== 20) {
        console.log('🔄 Performing annual leave reset...');
        await performLeaveReset();
      } else {
        console.log('✅ Leave balance already reset for this year');
        lastResetDate = new Date();
      }
    }
  } catch (error) {
    console.error('Error checking leave reset status:', error);
  }
};

// Schedule the reset to run daily at midnight to catch Jan 1st
const scheduleLeaveReset = () => {
  // Calculate time until next midnight
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const timeUntilMidnight = tomorrow - now;

  // Run the check at midnight every day
  const scheduleNextCheck = () => {
    // This will run at the next midnight
    const delay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    setTimeout(async () => {
      const now = new Date();
      console.log(`⏰ [${now.toISOString()}] Running daily leave reset check...`);
      
      // Check if it's January 1st
      if (now.getMonth() === 0 && now.getDate() === 1) {
        // It's January 1st - perform reset
        await performLeaveReset();
      }

      // Schedule the next check
      scheduleNextCheck();
    }, delay);
  };

  console.log(`📅 Leave reset scheduler initialized`);
  console.log(`   Next check scheduled for midnight (UTC)`);
  
  // Initial schedule
  scheduleNextCheck();
};

module.exports = {
  checkAndResetLeaves,
  scheduleLeaveReset,
  performLeaveReset
};
