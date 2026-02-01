// services/aggregator.service.js
import { supabaseAdmin } from './supabaseClient.js';
import fetchLeetCode from './fetchers/leetcode.js';
import fetchGitHub from './fetchers/github.js';
import fetchCodeforces from './fetchers/codeforces.js';

const refreshUserStats = async (userId) => {
  try {
    // 1. Get the user's profile links from DB
    const { data: profile, error } = await supabaseAdmin
      .from('profiles') 
      .select('leetcode_username, github_username, codeforces_username')
      .eq('user_id', userId)
      .single();

    if (error || !profile) throw new Error('Profile not found');

    // 2. Fetch data from ALL platforms in parallel
    const [leetcodeData, githubData, codeforcesData] = await Promise.all([
      fetchLeetCode(profile.leetcode_username),
      fetchGitHub(profile.github_username),
      fetchCodeforces(profile.codeforces_username)
    ]);

    // 3. Prepare payload for DB
    const statsPayload = {
      user_id: userId,
      leetcode_data: leetcodeData || {},
      github_data: githubData || {},
      codeforces_data: codeforcesData || {},
      last_updated: new Date().toISOString()
    };

    // 4. Upsert into platform_stats
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