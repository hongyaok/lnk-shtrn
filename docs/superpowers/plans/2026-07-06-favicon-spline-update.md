# Favicon and Landing Page Spline Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the favicon to Option A (black and white theme) and set the landing page Spline scene to landingv2.splinecode.

**Architecture:** Update favicon SVG inline and copy the new Spline file into the public asset folder, pointing the LandingPage component to the new scene URL.

**Tech Stack:** React, Vite, TSX, SVG, Spline 3D

---

### Task 1: Update Favicon Asset

**Files:**
- Modify: `public/favicon.svg`

- [ ] **Step 1: Replace SVG content**
  Update `public/favicon.svg` to use a solid black background, white text "LS", and a semi-transparent white border.
  ```xml
  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
    <rect width="48" height="48" rx="10" fill="#000000" stroke="rgba(255, 255, 255, 0.15)" stroke-width="2"/>
    <text x="24" y="31" font-family="'Roboto Mono', monospace, sans-serif" font-size="20" font-weight="700" fill="#ffffff" text-anchor="middle" dominant-baseline="middle" letter-spacing="1">LS</text>
  </svg>
  ```

- [ ] **Step 2: Commit Favicon Change**
  Run:
  ```bash
  git add public/favicon.svg
  git commit -m "style: update favicon to dark mode black/white theme"
  ```

---

### Task 2: Update Spline Asset and LandingPage component

**Files:**
- Create: `public/spline/landingv2.splinecode`
- Modify: `src/components/LandingPage.tsx:10`

- [ ] **Step 1: Copy spline file**
  Copy `landingv2.splinecode` from workspace root to `public/spline/landingv2.splinecode`.
  Run command:
  ```powershell
  Copy-Item -Path "landingv2.splinecode" -Destination "public/spline/landingv2.splinecode"
  ```

- [ ] **Step 2: Update SPLINE_SCENE_URL in LandingPage.tsx**
  Update line 10 to point to `/spline/landingv2.splinecode`:
  ```typescript
  const SPLINE_SCENE_URL = '/spline/landingv2.splinecode';
  ```

- [ ] **Step 3: Run Build**
  Verify the changes don't cause build issues.
  Run command:
  ```powershell
  npm run build
  ```
  Expected: Successful compilation.

- [ ] **Step 4: Commit Spline Changes**
  Run:
  ```bash
  git add public/spline/landingv2.splinecode src/components/LandingPage.tsx
  git commit -m "feat: replace landing page spline with landingv2"
  ```
