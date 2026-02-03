// services/aggregator.service.js
import { supabaseAdmin } from './supabaseClient.js';
import fetchLeetCode from './fetchers/leetcode.js';
import fetchGitHub from './fetchers/github.js';
import fetchCodeforces from './fetchers/codeforces.js';
import fetchGFG from './fetchers/gfg.js'; 
import { calculateInsphereScore as calculateInsphereScore } from './score.service.js'; // Ensure this matches your score file export

const refreshUserStats = async (userId) => {
  try {
    // 1. Get the user's profile links from DB
    // FIXED: Added geeksforgeeks_username to the select string
    const { data: profile, error } = await supabaseAdmin
      .from('profiles') 
      .select('leetcode_username, github_username, codeforces_username, geeksforgeeks_username')
      .eq('user_id', userId)
      .single();

    if (error || !profile) throw new Error('Profile not found');

    // 2. Fetch data from ALL platforms in parallel
    // FIXED: Changed 'gfgsData' to 'gfgData' to stay consistent
    const [leetcodeData, githubData, codeforcesData, gfgData] = await Promise.all([
      fetchLeetCode(profile.leetcode_username),
      fetchGitHub(profile.github_username),
      fetchCodeforces(profile.codeforces_username),
      fetchGFG(profile.geeksforgeeks_username)
    ]);

    // 3. Prepare the object for the scoring function
    // Ensure the keys here match what your calculateScore function expects
    const allStats = {
      leetcode_data: leetcodeData,
      github_data: githubData,
      codeforces_data: codeforcesData,
      gfg_data: gfgData
    };

    // 4. Calculate the total score
    const totalScore = calculateInsphereScore(allStats);

    // 5. Prepare payload for DB
    const statsPayload = {
      user_id: userId,
      leetcode_data: leetcodeData || {},
      github_data: githubData || {},
      codeforces_data: codeforcesData || {},
      gfg_data: gfgData || {},
      insphere_score: totalScore, 
      last_updated: new Date().toISOString()
    };

    // 6. Upsert into platform_stats
    const { error: upsertError } = await supabaseAdmin
      .from('platform_stats')
      .upsert(statsPayload, { onConflict: 'user_id' });

    if (upsertError) throw upsertError;

    return { success: true, data: statsPayload };

  } catch (err) {
    console.error('Aggregator Service Error:', err.message);
    return { success: false, error: err.message };
  }
};

export default refreshUserStats;