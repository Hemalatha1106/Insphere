import { supabase } from '../services/supabaseClient.js';

export const getGlobalLeaderboard = async (req, res) => {
  try {
    // Join platform_stats with profiles to get Names/Avatars
    const { data, error } = await supabase
      .from('platform_stats')
      .select(`
        insphere_score,
        leetcode_data,
        codeforces_data,
        github_data,
        gfg_data,
        profiles (
          full_name,
          college_name
        )
      `)
      .order('insphere_score', { ascending: false }) // Highest score first
      .limit(50); // Top 50

    if (error) throw error;

    // Optional: Clean the data before sending to frontend
    const formattedData = data.map((item, index) => ({
      rank: index + 1,
      name: item.profiles?.full_name || 'Anonymous',
      college: item.profiles?.college_name || 'N/A',
      score: item.insphere_score,
      stats: {
        leetcode: item.leetcode_data?.solved || 0,
        github: item.github_data?.publicRepos || 0,
        codeforces: item.codeforces_data?.solved || 0,
        gfg: item.gfg_data?.solved || 0
      }
    }));

    res.status(200).json(formattedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};