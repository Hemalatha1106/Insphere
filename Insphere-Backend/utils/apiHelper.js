// utils/apiHelper.js
import axios from 'axios';

const fetchData = async (url, options = {}) => {
  try {
    const response = await axios(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ...options.headers
      },
      ...options
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error.message);
    return null;
  }
};

export { fetchData };
