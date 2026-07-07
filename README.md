<div align="center">

<img src="./public/favicon.svg" alt="lnk-shrtn logo" height="64" />

# lnk-shrtn

A serverless, privacy-first, database-free link shortener built with React, TypeScript, Vite, and interactive 3D Spline visuals.

[![Build & Test Status](https://img.shields.io/badge/tests-passing-brightgreen?style=flat-square&logo=vitest)](https://github.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-19.x-blue?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Deploy Status](https://img.shields.io/badge/Vercel-Deployed-black?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com)

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#how-it-works-privacy-first--serverless">How It Works</a> •
  <a href="#features">Features</a> •
  <a href="#the-encoding-protocol-v1-binary-format">Encoding Protocol</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Project Structure</a>
</p>

</div>

---

## Overview

**lnk-shrtn** is a serverless, database-free URL shortener designed to protect user privacy. By compressing destination URLs and expiration conditions directly into the browser URL's hash fragment (`#`), the application enables link shortening and redirection without storing any mapping records in a database or logs on the hosting server.

> [!IMPORTANT]
> Because the compressed payload is stored in the URL's hash fragment (`#`), it is never transmitted to the web server. All URL decompression and redirection logic occur purely client-side within the browser.

---

## How It Works (Privacy-First & Serverless)

The short link generation and redirection process functions entirely client-side:

1. **Generation:** The user enters a destination URL and chooses an optional expiration date. The application compresses this payload via a custom binary protocol and serializes it into a padding-free `base64url` string.
2. **Short Link Creation:** The serialized string is appended to the app's base URL as a hash fragment (e.g., `https://lnk-shrtn.vercel.app/#<payload>`).
3. **Redirection:** When a visitor navigates to the short link, the client-side React router retrieves the hash fragment from the window location, deserializes the payload, validates the expiry timestamp, and performs a browser-level redirection if the link is still valid.

---

## Features

- **Absolute Privacy:** Zero database storage, zero tracking cookies, and zero server logging of destination links.
- **Custom Expirations:** Supports configurable link expiration periods from 5 minutes to 1 year, as well as permanent links.
- **Super Compact Encoding:** Utilizes an optimized binary serialization format resulting in a 50–80% length reduction compared to standard JSON string compression.
- **Backward Compatible:** Seamlessly decodes legacy LZ-String based JSON shortened links.
- **Premium Aesthetic:** Minimalist dark-mode glassmorphic UI integrated with interactive, responsive 3D Spline backgrounds.
- **QR Code Generation:** Instantly creates downloadable, highly scannable QR codes for sharing.
- **Real-Time Status Indicator:** Interactive status badge showing system availability and phase.

---

## The Encoding Protocol (v1 Binary Format)

To keep payload lengths as small as possible, data is serialized into a custom binary buffer and converted to a padding-free `base64url` string.

### Binary Layout Specification

| Offset (Bytes) | Field & Description |
|---|---|
| **Byte 0** | **Flags Byte** <br> • Bit 0: `1 = HTTPS`, `0 = HTTP` <br> • Bit 1: `1 = Had "www." prefix` <br> • Bit 2: `1 = Has Expiry` (2 bytes of expiry follow) <br> • Bits 3–7: Reserved (must be `0`) |
| **Bytes 1–2** *(Optional)* | **Expiry Days** <br> Present only if bit 2 of Byte 0 is set. Represented as a `uint16` Big-Endian integer indicating days elapsed since `2024-01-01 UTC`. Max range ~179 years. |
| **Remaining Bytes** | **Destination URL Path** <br> UTF-8 encoded string containing the path of the destination URL, stripped of protocol and `www.` prefixes. |

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

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, or pnpm

### Development

Install project dependencies and launch the local Vite development server:

```bash
# Install dependencies
npm install

# Start Vite dev server
npm run dev
```

### Production Build

Build the optimized static assets for production deployment:

```bash
# Compile and build the static bundle
npm run build

# Preview the production build locally
npm run preview
```

### Running Tests

Execute the Vitest suite validating the encoding and decoding logic:

```bash
# Run unit tests
npx vitest run
```

---

## Project Structure

```
├── public/                 # Static assets
│   ├── favicon.svg         # Minimalist logo
│   └── spline/             # Interactive 3D Spline binary files (.splinecode)
├── src/
│   ├── components/         # React components
│   │   ├── LandingPage.tsx # Core input and generation dashboard
│   │   ├── RedirectPage.tsx# Decompression handler and redirection gateway
│   │   ├── ExpiredPage.tsx # Expiration alert screen
│   │   └── StatusIndicator.tsx # Global phase indicator badge
│   ├── utils/              # Utility logic
│   │   ├── urlEncoder.ts   # Core binary protocol serializer & deserializer
│   │   └── urlEncoder.test.ts # Vitest suite for URL encoding correctness
│   ├── index.css           # Styling system & dark mode design tokens
│   └── App.tsx             # Routing & layout setup
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite compiler config
```
