// services/fetchers/leetcode.js
import axios from 'axios';

const fetchLeetCode = async (input) => {
  if (!input) return null;

  // 1. Clean the input: Extract username from URL if necessary
  // This handles: "https://leetcode.com/u/user/", "leetcode.com/user", or just "user"
  let username = input.trim();
  // Replace the cleaning section in services/fetchers/leetcode.js
  if (username.includes('leetcode.com')) {
      // Remove trailing slash first to avoid empty segments
      const cleanUrl = username.replace(/\/$/, ""); 
      const parts = cleanUrl.split('/');
      
      // The username is always the last segment in leetcode.com/u/username 
      // or leetcode.com/username
      username = parts.pop(); 
  }
  username = username.replace(/\/$/, ""); // Remove trailing slash

  console.log(`LeetCode: Cleaned username for query: ${username}`);

  const graphqlUrl = 'https://leetcode.com/graphql/';
  
  // The exact query LeetCode expects
  const query = {
    query: `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          profile {
            ranking
            realName
            aboutMe
          }
          submitStats: submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
      }
    `,
    variables: { username }
  };

  try {
    const response = await axios.post(graphqlUrl, query, {
      headers: {
        'Content-Type': 'application/json',
        'Referer': 'https://leetcode.com', // CRITICAL: LeetCode checks this
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (response.data.errors) {
      console.error('LeetCode GraphQL Errors:', response.data.errors);
      return null;
    }

    const user = response.data.data.matchedUser;
    if (!user) return null;

    return {
      username: user.username,
      ranking: user.profile.ranking,
      aboutMe: user.profile.aboutMe,
      // Summing up solved count from the stats array
      solved: user.submitStats.acSubmissionNum.find(s => s.difficulty === 'All')?.count || 0
    };

  } catch (error) {
    console.error('LeetCode fetch error:', error.response?.data || error.message);
    return null;
  }
};

export default fetchLeetCode;