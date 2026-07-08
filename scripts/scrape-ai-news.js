import Parser from 'rss-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const parser = new Parser();

const FEEDS = [
  'https://techcrunch.com/category/artificial-intelligence/feed/',
  'https://hnrss.org/newest?q=AI+OR+LLM+OR+OpenAI+OR+Anthropic+OR+ChatGPT',
  'https://cointelegraph.com/rss/tag/ai'
];

async function scrapeNews() {
  console.log('Starting AI news scrape...');
  const allArticles = [];

  for (const feedUrl of FEEDS) {
    try {
      console.log(`Fetching ${feedUrl}...`);
      const feed = await parser.parseURL(feedUrl);
      feed.items.forEach(item => {
        allArticles.push({
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          contentSnippet: item.contentSnippet || item.content || ''
        });
      });
    } catch (error) {
      console.error(`Error fetching ${feedUrl}:`, error.message);
    }
  }

  // Sort by date descending (newest first)
  allArticles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  // Keep top 50 recent to send to OpenRouter
  const topArticles = allArticles.slice(0, 50);

  const outputPath = path.join(__dirname, '..', 'public', 'ai-news.json');
  fs.writeFileSync(outputPath, JSON.stringify(topArticles, null, 2));

  console.log(`Successfully saved ${topArticles.length} articles to public/ai-news.json`);
}

scrapeNews();
