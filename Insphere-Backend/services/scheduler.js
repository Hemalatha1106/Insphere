import cron from 'node-cron';
import { updateAllScores } from './score.service.js';
// You might also want to import aggregatorService to refresh data periodically

const initScheduler = () => {
  // Schedule task: Run every day at midnight (00:00)
  cron.schedule('0 0 * * *', async () => {
    console.log('🔄 Running Daily Score Updates...');
    try {
      // Optional: First fetch fresh data for all users (heavy operation!)
      // await aggregatorService.refreshAllUsers(); 
      
      // Then recalculate scores based on data
      await updateAllScores();
      console.log('✅ Daily Score Update Complete');
    } catch (error) {
      console.error('❌ Scheduler Error:', error);
    }
  });
  
  console.log('🕒 Scheduler initialized: Updates run daily at midnight.');
};

export default initScheduler;