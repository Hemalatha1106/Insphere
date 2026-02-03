import { fetchData } from '../../utils/apiHelper.js';

// --- HELPERS ---

const extractGFGUsername = (input) => {
    if (!input) return null;
    const match = input.match(/(?:geeksforgeeks\.org\/(?:profile|user)\/)([^\/\?\#]+)/i);
    return match ? match[1] : input.trim();
};

// Moving this OUTSIDE so it's always defined
const extractObject = (unescapedData, key) => {
    const searchPattern = `"${key}":`;
    const startIdx = unescapedData.indexOf(searchPattern);
    if (startIdx === -1) return null;

    let openBraceIdx = unescapedData.indexOf('{', startIdx);
    if (openBraceIdx === -1) return null;

    let braceCount = 0;
    let endIdx = -1;

    for (let i = openBraceIdx; i < unescapedData.length; i++) {
        if (unescapedData[i] === '{') braceCount++;
        else if (unescapedData[i] === '}') braceCount--;

        if (braceCount === 0) {
            endIdx = i + 1;
            break;
        }
    }

    if (endIdx === -1) return null;
    try {
        return JSON.parse(unescapedData.substring(openBraceIdx, endIdx));
    } catch (e) {
        return null;
    }
};

// --- MAIN SCRAPER ---

export const fetchGeeksforGeeks = async (usernameOrUrl) => {
    try {
        const username = extractGFGUsername(usernameOrUrl);
        const url = `https://www.geeksforgeeks.org/user/${username}/`;

        console.log(`[GFG Scraper] Fetching: ${url}`);

        const html = await fetchData(url, {
            method: 'GET',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        if (!html) throw new Error("Received empty HTML");

        const pushChunks = html.match(/self\.__next_f\.push\(\[1,"(.*?)"\]\)/g) || [];
        let unescapedData = pushChunks
            .map(chunk => {
                const contentMatch = chunk.match(/push\(\[1,"(.*)"\]\)/);
                return contentMatch ? contentMatch[1]
                    .replace(/\\"/g, '"')
                    .replace(/\\\\/g, '\\')
                    .replace(/\\u003c/g, '<')
                    .replace(/\\u003e/g, '>') : "";
            })
            .join('');

        // Now we pass unescapedData into the helper
        const userData = extractObject(unescapedData, "userData");
        let stats = userData?.data || {};

        // Final Fallback if the object is broken
        if (!stats.score || !stats.total_problems_solved) {
            const scoreMatch = unescapedData.match(/"score":(\d+)/);
            const solvedMatch = unescapedData.match(/"total_problems_solved":(\d+)/);
            if (scoreMatch) stats.score = parseInt(scoreMatch[1]);
            if (solvedMatch) stats.total_problems_solved = parseInt(solvedMatch[1]);
        }

        return {
            profile_details: {
                username: username,
                statistics: {
                    overall_score: stats.score || 0,
                    total_problems_solved: stats.total_problems_solved || 0
                }
            }
        };

    } catch (error) {
        console.error(`[GFG ERROR]: ${error.message}`);
        return { error: `Scraper Failed: ${error.message}` };
    }
};

export default fetchGeeksforGeeks;