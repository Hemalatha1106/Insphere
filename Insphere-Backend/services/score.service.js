import { supabase } from './supabaseClient.js';

/**
 * Calculates a unified score based on data from multiple platforms.
 * Weights can be adjusted based on project requirements.
 */
const calculateInsphereScore = (stats) => {
  let score = 0;

  // --- LeetCode Logic ---
  // Using the structure returned by your latest fetcher: { solved, easy, medium, hard }
  if (stats.leetcode_data) {
    const easy = stats.leetcode_data.easy || 0;
    const medium = stats.leetcode_data.medium || 0;
    const hard = stats.leetcode_data.hard || 0;
    // If specific difficulties aren't available, fallback to total solved * 10
    const solved = stats.leetcode_data.solved || 0;

    if (easy || medium || hard) {
      score += (easy * 10) + (medium * 20) + (hard * 50);
    } else {
      score += (solved * 10);
    }
  }

  // --- Codeforces Logic ---
  if (stats.codeforces_data) {
    const rating = stats.codeforces_data.rating || 0;
    const solved = stats.codeforces_data.solved || 0;
    
    score += (rating * 2);   // High weight for competitive rating
    score += (solved * 15);  // CF problems are generally harder than average
  }

  // --- GitHub Logic ---
  if (stats.github_data) {
    const publicRepos = stats.github_data.publicRepos || 0;
    const followers = stats.github_data.followers || 0;
    
    score += (publicRepos * 20); // Encourage building projects
    score += (followers * 5);
  }

  // --- GeeksforGeeks Logic (NEW) ---
  if (stats.gfg_data) {
    const solved = stats.gfg_data.solved || 0;
    const codingScore = stats.gfg_data.codingScore || 0;

    score += (solved * 5);      // GFG problems
    score += (codingScore * 1); // Direct GFG score contribution
  }

  return Math.round(score);
};

/**
 * Fetches all user stats and updates the insphere_score in bulk.
 * Used by the scheduler (Cron job).
 */
const updateAllScores = async () => {
  try {
    // 1. Fetch all raw stats
    const { data: allStats, error } = await supabase
      .from('platform_stats')
      .select('*');

    if (error) throw error;
    if (!allStats || allStats.length === 0) return;

    // 2. Calculate scores for everyone
    const updates = allStats.map((stat) => {
      const newScore = calculateScore(stat);
      return {
        user_id: stat.user_id,
        leetcode_data: stat.leetcode_data, // Keep existing data
        github_data: stat.github_data,
        codeforces_data: stat.codeforces_data,
        gfg_data: stat.gfg_data,
        insphere_score: newScore,
        last_updated: new Date().toISOString()
      };
    });

    // 3. Bulk update using upsert
    const { error: updateError } = await supabase
      .from('platform_stats')
      .upsert(updates, { onConflict: 'user_id' });

    if (updateError) {
      console.error('Score update failed:', updateError.message);
    } else {
      console.log(`✅ Success: Updated scores for ${updates.length} users.`);
    }
  } catch (err) {
    console.error('Critical error in updateAllScores:', err.message);
  }
};

export { calculateInsphereScore, updateAllScores };