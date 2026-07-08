import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { articlesBatch, isLoadMore, existingTitles, fetchCount } = req.body;

  if (!articlesBatch || !Array.isArray(articlesBatch)) {
    return res.status(400).json({ error: 'Invalid articles data provided.' });
  }

  const apiKey = process.env.OPENROUTER_API;
  if (!apiKey) {
    return res.status(500).json({ error: 'OpenRouter API Key not configured on the server.' });
  }

  // 1. Prepare payload for OpenRouter
  let systemPrompt = `You are an expert AI news curator. You will receive a JSON list of recent AI articles. 
Your task is to select the TOP ${fetchCount} most groundbreaking and important articles. Exclude any articles that are behind paywalls.`;

  if (isLoadMore && Array.isArray(existingTitles) && existingTitles.length > 0) {
    const formattedTitles = existingTitles.map((t: string) => t.replace(/"/g, '\\"')).join('", "');
    systemPrompt += `\nCRITICAL: You MUST NOT include any of these articles you have already selected: ["${formattedTitles}"]. Choose entirely DIFFERENT articles from the provided list.`;
  }

  systemPrompt += `\nReturn ONLY a raw JSON array (without markdown wrappers like \`\`\`json) of exactly ${fetchCount} objects. 
Each object must have these exactly named keys:
- "title": The original article title.
- "summary": A concise, engaging 2-liner summary of the article.
- "tags": An array of 1 to 3 relevant string tags (e.g., ["LLM", "OpenAI"], ["Computer Vision"]).
- "url": The exact link provided in the original article.`;

  const userPrompt = `Here are the articles: \n${JSON.stringify(articlesBatch)}`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "HTTP-Referer": req.headers.referer || "https://lnk-shtrn.vercel.app",
        "X-Title": "lnk-shtrn AI Updates",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: errorData.error?.message || 'Failed to communicate with OpenRouter API'
      });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error: any) {
    console.error(error);
    return res.status(500).json({ error: error.message || 'An error occurred during API request.' });
  }
}
