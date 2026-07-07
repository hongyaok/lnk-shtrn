# Spec: My Links Page and Routing

## Goal
Implement a "/my-links" page that lists all shortened links created by the current device. The page displays the link details (destination, shortened URL, creation time, duration, and status) and allows showing the QR code/sharing popup if the link is still active.

## Design Details

### 1. Storage Mechanism (Device History)
To respect the decentralized, serverless, and privacy-first nature of the app (which runs without a backend database), link creation history will be persisted locally in the browser's `localStorage` under the key `lnk_shrtn_history`.
* **Data Schema**:
  ```typescript
  interface SavedLink {
    id: string; // The base79 encoded hash
    url: string; // Original destination URL
    shortLink: string; // Shortened URL
    createdAt: number; // Creation timestamp (ms)
    durationLabel: string; // e.g., "1 Hour", "Forever", "Custom (30 minutes)"
    expiry: number; // Expiry timestamp (ms), 0 = forever
  }
  ```
* When a link is generated in `LandingPage.tsx`, it will append a new `SavedLink` object to `localStorage`.

### 2. Routing Setup
* Path-based routing will be checked in `src/App.tsx`.
* If `window.location.pathname === '/my-links'`, the app will render the new `<MyLinksPage />` view.
* Navigation without full page refresh will be supported using `window.history.pushState` and listening to `popstate` events.

### 3. "My Links" Button Beside GitHub Link
* A new floating button will be positioned at the bottom right next to the GitHub button.
* **Styling**: Same size (36x36px), border, and glassmorphism styling as the GitHub button.
* **Icon**: Lucide `History` icon.
* **Layout**:
  * GitHub link: `right: 1.25rem`
  * My Links button: `right: 4.25rem` (separated by a clean gap)
* **Action**: Clicking it redirects the SPA route to `/my-links`.

### 4. "My Links" Page Layout (`/my-links`)
* **URL**: `/my-links`
* **Layout**:
  * Centered card using the existing glassmorphism/terminal aesthetics.
  * Monospaced typography with a clean header: `My Links`.
  * Scrollable list of past links created on the device.
* **Each item displays**:
  * Original URL (truncated with ellipsis if too long).
  * Creation date and time (e.g., `YYYY-MM-DD HH:mm`).
  * Duration/expiry info (e.g., `1 Hour`, `Forever`).
  * Status indicator: Uses the app's existing `.status-indicator` element:
    * If `expiry === 0` or `expiry > Date.now()`: State `active` (Green pulsing dot) with label `ACTIVE`.
    * If expired: State `down` (Red pulsing dot) with label `EXPIRED`.
  * **Share/Popup Trigger Button**:
    * Visible only if the status is active (still available).
    * Uses a Lucide `QrCode` or `Share2` icon.
    * When clicked, displays the shortened URL modal (reusing the same modal format).
* **Page Utilities**:
  * **Go to Home Button**: Navigates back to the landing page (`/`).
  * **Clear History Button**: Allows purging the list.

### 5. Shared Modal Component (`ShareModal.tsx`)
* Refactor the QR/Share modal from `LandingPage.tsx` into a reusable `<ShareModal />` component in `src/components/ShareModal.tsx`.
* This enables both `LandingPage.tsx` and `MyLinksPage.tsx` to display the identical popup.

## Verification Plan

### Automated Verification
* Run unit tests to verify no compilation errors.
* Build the production app successfully using `npm run build`.

### Manual Verification
1. Create several links with different durations (e.g., 10 minutes, 1 hour, custom seconds).
2. Click the floating "My Links" button on the bottom right.
3. Verify that the browser updates its pathname to `/my-links` and displays the "My Links" view.
4. Verify the list displays correct datetime, duration, and status dot (green for active, red for expired).
5. For active links, click the share button and verify the QR code and copy buttons modal displays.
6. Verify clicking "Go to Home" correctly returns to the shortening page.
7. Verify refreshing `/my-links` directly loads the My Links page.
