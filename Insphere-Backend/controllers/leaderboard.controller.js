const supabase = require('../services/supabaseClient');

exports.getGlobalLeaderboard = async (req, res) => {
  try {
    // Join platform_stats with profiles to get Names/Avatars
    const { data, error } = await supabase
      .from('platform_stats')
      .select(`
        insphere_score,
        leetcode_data,
        codeforces_data,
        github_data,
        profiles (
          full_name,
          avatar_url,
          college_name
        )
      `)
      .order('insphere_score', { ascending: false }) // Highest score first
      .limit(50); // Top 50

    if (error) throw error;

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};