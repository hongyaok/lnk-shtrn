# Pixelated Spinners and Clear Cache Endpoint Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the rotation animation on the "find more" loading spinner, convert both refreshing and load-more spinners to have a pixelated retro aesthetic, and implement a test-only backend/frontend endpoint to clear the client-side AI updates cache.

**Architecture:** 
1. Create a `PixelSpinner` SVG component that models a pixel-art style trailing spinner ring.
2. Add a CSS keyframe animation with `steps(8)` to rotate the pixel spinner in discrete 8-bit increments.
3. Replace the `Loader2` components in `src/components/AIPage.tsx` with `PixelSpinner`.
4. Create a serverless API endpoint `api/clear-cache.ts` that outputs an HTML template containing a client-side localStorage deletion script. Update `vercel.json` to expose `/clear-cache` directly.

**Tech Stack:** React, TypeScript, TSX, Tailwind-free Vanilla CSS, Vercel Serverless Functions

---

### Task 1: Add PixelSpinner Component

**Files:**
- Create: `src/components/PixelSpinner.tsx`

- [ ] **Step 1: Create PixelSpinner component file**
  Create `src/components/PixelSpinner.tsx` with a low-resolution pixel art SVG ring (size 16x16 viewbox, 2x2 px blocks) with trailing opacities:
  ```tsx
  interface PixelSpinnerProps {
    size?: number;
    color?: string;
    style?: React.CSSProperties;
    className?: string;
  }

  export function PixelSpinner({ size = 24, color = 'currentColor', style, className = '' }: PixelSpinnerProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill={color}
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'inline-block', ...style }}
        className={`pixel-spinner ${className}`}
      >
        {/* Symmetric 8-dot pixelated ring */}
        <rect x="7" y="1" width="2" height="2" opacity="1.00" />
        <rect x="11" y="3" width="2" height="2" opacity="0.85" />
        <rect x="13" y="7" width="2" height="2" opacity="0.70" />
        <rect x="11" y="11" width="2" height="2" opacity="0.55" />
        <rect x="7" y="13" width="2" height="2" opacity="0.40" />
        <rect x="3" y="11" width="2" height="2" opacity="0.25" />
        <rect x="1" y="7" width="2" height="2" opacity="0.15" />
        <rect x="3" y="3" width="2" height="2" opacity="0.05" />
      </svg>
    );
  }
  ```

---

### Task 2: Implement Pixelated Rotation Style in index.css

**Files:**
- Modify: `src/index.css`

- [ ] **Step 1: Add pixel-spinner CSS classes**
  Append the following styles to the end of `src/index.css` to enable 8-step rotation of the pixelated spinner:
  ```css
  /* Pixelated Loader Animation */
  @keyframes spin-pixel {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  .pixel-spinner {
    animation: spin-pixel 0.8s steps(8) infinite;
    transform-origin: center;
  }
  ```

---

### Task 3: Update AIPage to use PixelSpinner

**Files:**
- Modify: `src/components/AIPage.tsx`

- [ ] **Step 1: Import PixelSpinner and remove Loader2**
  Replace `Loader2` import with `PixelSpinner` in `src/components/AIPage.tsx`.
  At line 2:
  ```diff
  -import { ArrowLeft, ExternalLink, Loader2, Search } from 'lucide-react';
  +import { ArrowLeft, ExternalLink, Search } from 'lucide-react';
  +import { PixelSpinner } from './PixelSpinner';
  ```

- [ ] **Step 2: Replace main refreshing news spinner**
  At line 273, replace:
  ```diff
  -                <Loader2 size={48} className="animate-spin" style={{ marginBottom: '1rem', color: '#a5b4fc', animation: 'spin 2s linear infinite' }} />
  -                <style>{`
  -                  @keyframes spin { 100% { transform: rotate(360deg); } }
  -                `}</style>
  +                <PixelSpinner size={48} color="#a5b4fc" style={{ marginBottom: '1rem' }} />
  ```

- [ ] **Step 3: Replace find more loading spinner**
  At line 407, replace the non-spinning `Loader2` with `PixelSpinner`:
  ```diff
  -                    {isLoadingMore && <Loader2 size={16} className="animate-spin" />}
  +                    {isLoadingMore && <PixelSpinner size={16} color="currentColor" />}
  ```

---

### Task 4: Create Clear Cache API Endpoint

**Files:**
- Create: `api/clear-cache.ts`
- Modify: `vercel.json`

- [ ] **Step 1: Create api/clear-cache.ts serverless function**
  Create the file `api/clear-cache.ts` with the following implementation:
  ```typescript
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
        <title>Clear AI Cache</title>
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
          <h1>Cache Cleared</h1>
          <p>Your local AI updates cache (scraped articles and cache timestamps) has been successfully cleared.</p>
          <button onclick="window.location.href='/ai'">Back to AI Updates</button>
        </div>
        <script>
          try {
            localStorage.removeItem('ai_news_cache');
            localStorage.removeItem('ai_news_timestamp');
            console.log('AI Cache cleared successfully.');
          } catch (e) {
            console.error('Failed to clear localStorage:', e);
          }
        </script>
      </body>
      </html>
    `);
  }
  ```

- [ ] **Step 2: Add route rewrite in vercel.json**
  Update `vercel.json` to map `/clear-cache` to `/api/clear-cache`:
  ```json
  {
    "rewrites": [
      {
        "source": "/my-links",
        "destination": "/index.html"
      },
      {
        "source": "/ai",
        "destination": "/index.html"
      },
      {
        "source": "/clear-cache",
        "destination": "/api/clear-cache"
      }
    ]
  }
  ```

---

### Task 5: Compilation and Verification

- [ ] **Step 1: Run build checking for compiler or linter errors**
  Run:
  ```powershell
  npm run build
  ```
  Expected: Successful production build without compilation errors.
