// services/fetchers/github.js
import { fetchData } from '../../utils/apiHelper.js';

// Helper to extract username from URL or return as-is
const extractUsername = (input) => {
  if (!input) return null;
  // If it's a URL, extract the username
  const urlMatch = input.match(/github\.com\/([^\/\?]+)/);
  if (urlMatch) return urlMatch[1];
  // Otherwise return as-is (assume it's already a username)
  return input;
};

const fetchGitHub = async (usernameOrUrl) => {
  const username = extractUsername(usernameOrUrl);
  if (!username) return null;

  try {
    const url = `https://api.github.com/users/${username}`;
    const data = await fetchData(url);

    if (!data || data.message === 'Not Found') return null;

    return {
      username: data.login,
      name: data.name,
      avatar: data.avatar_url,
      publicRepos: data.public_repos,
      followers: data.followers,
      following: data.following,
      bio: data.bio,
      url: data.html_url
    };
  } catch (error) {
    console.error('GitHub fetch error:', error.message);
    return null;
  }
};

export default fetchGitHub;
