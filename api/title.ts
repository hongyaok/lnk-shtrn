import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { url } = req.body;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid url parameter' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      signal: AbortSignal.timeout(3500) // 3.5 seconds timeout
    });

    if (!response.ok) {
      return res.status(200).json({ title: null });
    }

    const html = await response.text();
    const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    let title = match ? match[1].trim() : null;

    if (title) {
      // Clean up common HTML entities
      title = title
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&#039;/g, "'")
        .replace(/&ldquo;/g, '“')
        .replace(/&rdquo;/g, '”')
        .replace(/&lsquo;/g, '‘')
        .replace(/&rsquo;/g, '’')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' '); // collapse extra spaces
    }

    return res.status(200).json({ title });
  } catch (err) {
    console.error(`Error fetching title for ${url}:`, err);
    return res.status(200).json({ title: null });
  }
}
