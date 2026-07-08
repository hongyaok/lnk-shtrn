import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const acceptHeader = req.headers.accept || '';
  if (acceptHeader.includes('application/json')) {
    return res.status(200).json({ 
      success: true, 
      message: 'LocalStorage cannot be directly cleared from the server via JSON. Please visit this endpoint in a browser to clear local storage cache.' 
    });
  }

  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Clear Local Data</title>
      <style>
        body {
          background-color: #0a0a0a;
          color: #f8fafc;
          font-family: 'Pixelify Sans', system-ui, -apple-system, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
        }
        .card {
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          padding: 2.5rem;
          text-align: center;
          max-width: 420px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
        }
        h1 {
          color: #a5b4fc;
          margin-top: 0;
          font-size: 2rem;
          letter-spacing: 0.1rem;
        }
        p {
          color: #94a3b8;
          margin: 1rem 0 2rem 0;
          font-size: 0.95rem;
          line-height: 1.5;
        }
        button {
          background: #ffffff;
          color: #0a0a0a;
          border: 2px solid rgba(255, 255, 255, 0.2);
          padding: 0.75rem 1.5rem;
          font-family: inherit;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        button:hover {
          transform: translateY(-2px);
          box-shadow: 4px 4px 0px rgba(255, 255, 255, 0.2);
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>Local Data Cleared</h1>
        <p>Your local link history and AI cache have been successfully cleared.</p>
        <button onclick="window.location.href='/'">Go to Homepage</button>
      </div>
      <script>
        try {
          localStorage.removeItem('lnk_shrtn_history');
          localStorage.removeItem('ai_news_cache');
          localStorage.removeItem('ai_news_timestamp');
          console.log('All local data cleared successfully.');
        } catch (e) {
          console.error('Failed to clear localStorage:', e);
        }
      </script>
    </body>
    </html>
  `);
}
