import { supabase } from './supabaseClient.js';

const calculateScore = (stats) => {
  let score = 0;

  // --- LeetCode Logic ---
  if (stats.leetcode_data && stats.leetcode_data.submitStats) {
    const ac = stats.leetcode_data.submitStats.acSubmissionNum;
    // Usually: [ { difficulty: 'All' }, { difficulty: 'Easy' }, ... ]
    const easy = ac.find(x => x.difficulty === 'Easy')?.count || 0;
    const medium = ac.find(x => x.difficulty === 'Medium')?.count || 0;
    const hard = ac.find(x => x.difficulty === 'Hard')?.count || 0;

    score += (easy * 10) + (medium * 20) + (hard * 50);
  }

  // --- Codeforces Logic ---
  if (stats.codeforces_data) {
    const rating = stats.codeforces_data.rating || 0;
    const solved = stats.codeforces_data.solved || 0;
    
    score += (rating * 2); // Rating weight
    score += (solved * 10); // 10 pts per CF problem
  }

  // --- GitHub Logic ---
  if (stats.github_data) {
    const publicRepos = stats.github_data.public_repos || 0;
    const followers = stats.github_data.followers || 0;
    
    score += (publicRepos * 5); 
    score += (followers * 2);
  }

  return Math.round(score);
};

const updateAllScores = async () => {
  // 1. Fetch all raw stats
  const { data: allStats, error } = await supabase
    .from('platform_stats')
    .select('*');

  if (error) throw error;

  // 2. Calculate scores for everyone
  const updates = allStats.map((stat) => {
    const newScore = calculateScore(stat);
    return {
      user_id: stat.user_id,
      insphere_score: newScore, // You need to add this column to DB
    };
  });

  // 3. Bulk update (requires a table 'leaderboard' or updating 'platform_stats')
  // Let's assume we store the score directly in 'platform_stats' or a 'profiles' table.
  // Ideally, create a 'leaderboard' table.
  
  const { error: updateError } = await supabase
    .from('platform_stats') // Or 'profiles' if you added the column there
    .upsert(updates, { onConflict: 'user_id' });

  if (updateError) console.error('Score update failed:', updateError);
  else console.log(`Updated scores for ${updates.length} users.`);
};

export { updateAllScores };