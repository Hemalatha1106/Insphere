import { fetchGeeksforGeeks } from './gfgScraper.js';

const fetchGFG = async (input) => {
  if (!input) return null;

  // 1. CLEAN THE USERNAME
  // This removes the URL parts if the user provided a full link
  let cleanUsername = input.trim();
  if (cleanUsername.includes('geeksforgeeks.org')) {
    cleanUsername = cleanUsername.replace(/\/$/, "").split('/').pop();
  }

  try {
    // 2. PASS THE CLEAN NAME TO THE SCRAPER
    const data = await fetchGeeksforGeeks(cleanUsername);
    
    if (data.error || !data.profile_details) {
      console.error("GFG Scraper Error:", data?.error || "No profile details found");
      return { username: cleanUsername, codingScore: 0, solved: 0 };
    }

    const stats = data.profile_details.statistics;

    // 3. RETURN CLEAN DATA
    return {
      username: cleanUsername,
      codingScore: stats.overall_score || 0,
      solved: stats.total_problems_solved || 0,
      // Use the clean name to build a proper URL
      profileUrl: `https://www.geeksforgeeks.org/user/${cleanUsername}/`
    };
  } catch (err) {
    console.error("GFG Fetcher Error:", err.message);
    return { username: cleanUsername, codingScore: 0, solved: 0 };
  }
};

export default fetchGFG;