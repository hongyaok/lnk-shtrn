# lnk-shrtn

A serverless, privacy-first, database-free link shortener built with React, TypeScript, Vite, and interactive 3D Spline visuals.

---

## 🌟 How It Works (Privacy-First & Serverless)

Unlike traditional URL shorteners that store mappings in a database, **lnk-shrtn** compresses and encodes the destination URL and expiry timestamp directly into the URL's hash fragment (e.g., `https://lnk-shrtn.vercel.app/#<payload>`).

Since the payload lives in the hash fragment (`#`), it is **never sent to the hosting server**—all decoding and redirection occur entirely client-side in the browser. 

---

## ✨ Features

- 🔒 **Absolute Privacy:** No databases, no tracking, and no server logs of where your links point.
- ⏳ **Custom Expirations:** Support for link expiration from 5 minutes to 1 year, or permanent links.
- 🎨 **Premium Aesthetic:** Minimalist dark-mode UI overlaying interactive, responsive 3D Spline background scenes.
- ⚡ **Super Compact Encoding:** Uses a custom binary serializer yielding 50–80% shorter URLs compared to standard JSON compression.
- 🔄 **Backward Compatible:** Seamlessly decodes legacy LZ-String JSON shortened links.
- 🟢 **Testing Phase Indicator:** A global status badge placed at the bottom-left corner.
- 🐙 **GitHub Integration:** A clean link to the repository located in the bottom-right corner.

---

## 🛠️ The Encoding Protocol (v1 Binary Format)

The encoder packs payloads into a compact binary buffer serialized as a padding-free `base64url` string:

```
┌──────────────────────────────────────────────────────────┐
│ Byte 0: Flags                                            │
│   bit 0: 1 = HTTPS, 0 = HTTP                             │
│   bit 1: 1 = Had "www." prefix                           │
│   bit 2: 1 = Has expiry bytes (2 bytes follow)           │
│   bits 3–7: Reserved (must be 0)                         │
├──────────────────────────────────────────────────────────┤
│ Bytes 1–2 (Optional, if bit 2 is set):                   │
│   Expiry representation: Days since 2024-01-01 UTC       │
│   (encoded as uint16 Big-Endian, max ~179 years)         │
├──────────────────────────────────────────────────────────┤
│ Remaining Bytes:                                         │
│   Destination URL path (stripped of protocol and "www.") │
│   Encoded as UTF-8                                       │
└──────────────────────────────────────────────────────────┘
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or another package manager

### Development

Install the project dependencies and run the local development server:

```bash
# Install packages
npm install

# Start Vite dev server
npm run dev
```

### Production Build

Create a minified, production-ready static site bundle:

```bash
# Build the application
npm run build

# Preview the built site locally
npm run preview
```

---

## 📂 Project Structure

- `src/utils/urlEncoder.ts`: Core binary serialization and decompression logic.
- `src/components/LandingPage.tsx`: Main link shortener generation layout and form.
- `src/components/RedirectPage.tsx`: Intermediate page handling payload extraction and redirect delays.
- `src/components/ExpiredPage.tsx`: Standard card view loaded if the expiry window has passed.
- `public/spline/`: Storage for the `.splinecode` binary files running the 3D backgrounds.
- `public/favicon.svg`: Premium dark-mode page icon matching the minimalist layout.
