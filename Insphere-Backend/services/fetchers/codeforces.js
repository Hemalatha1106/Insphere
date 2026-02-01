// services/fetchers/codeforces.js
import { fetchData } from '../../utils/apiHelper.js';

// Helper to extract username from URL or return as-is
const extractUsername = (input) => {
  if (!input) return null;
  // If it's a URL, extract the username
  const urlMatch = input.match(/codeforces\.com\/profile\/([^\/\?]+)/);
  if (urlMatch) return urlMatch[1];
  // Otherwise return as-is (assume it's already a username)
  return input;
};

const fetchCodeforces = async (usernameOrUrl) => {
  const username = extractUsername(usernameOrUrl);
  if (!username) return null;

  try {
    // 1. Get Basic Profile Info
    const userInfoUrl = `https://codeforces.com/api/user.info?handles=${username}`;
    const infoData = await fetchData(userInfoUrl);

    if (!infoData || infoData.status !== 'OK') return null;
    const user = infoData.result[0];

    // 2. Get Submissions (to count solved problems)
    const statusUrl = `https://codeforces.com/api/user.status?handle=${username}&from=1&count=5000`;
    const statusData = await fetchData(statusUrl);

    let solvedCount = 0;
    if (statusData && statusData.status === 'OK') {
      const uniqueProblems = new Set();
      statusData.result.forEach((sub) => {
        if (sub.verdict === 'OK') {
          uniqueProblems.add(`${sub.problem.contestId}-${sub.problem.index}`);
        }
      });
      solvedCount = uniqueProblems.size;
    }

    return {
      username: user.handle,
      rating: user.rating || 0,
      maxRating: user.maxRating || 0,
      rank: user.rank || 'unrated',
      solved: solvedCount,
      lastOnline: user.lastOnlineTimeSeconds
    };

  } catch (error) {
    console.error('Codeforces fetch error:', error.message);
    return null;
  }
};

export default fetchCodeforces;
