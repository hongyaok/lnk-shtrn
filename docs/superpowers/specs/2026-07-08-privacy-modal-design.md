# Specification: Privacy & Data Security Info Modal

Add a privacy question-mark button to the bottom-right floating panel on the **AI Updates** and **My Links** pages. Clicking this button opens a retro-pixel themed modal explaining the client-only architecture of the app (100% local storage, zero servers, zero risk of data leakage) and providing clear instructions/actions to clear user data.

## Goal Description
Add a question-mark button next to the bottom-right action buttons on the AI and My Links pages to show a popup explaining local data storage policy and how to clear it.

## Design Details

### 1. The Floating Help Button
- **Placement**: Placed directly inside the bottom-right fixed panel, positioned to the left of the main page-switching button (the Clock icon on the AI page or the Bot icon on the My Links page).
- **Appearance**: Reuses the `.github-link` styling for a pixelated outline button, using the `HelpCircle` icon from `lucide-react`.
- **Visibility**: Only shown when the current page is `'ai'` or `'my-links'`.

### 2. The Privacy & Data Modal
- **Overlay & Backdrop**: Dark overlay with blur (`rgba(0,0,0,0.8)`, `backdropFilter: 'blur(4px)'`) and high z-index, matching `ShareModal.tsx`.
- **Card container**: Flat gray/black container (`rgba(30,30,30,0.95)`) with a white thin border, sharp square corners (`borderRadius: '0'`), pixel-themed typography, and responsive width maxing out at `440px`.
- **Content / Copy**:
  - **Header**: `Data Privacy & Security` (using `'Pixelify Sans'` font, bold).
  - **Subheading**: `100% Client-Side. No Servers. No Leaks.`
  - **Main Info**:
    - Explain that the application uses a decentralized, client-only approach. It does not run databases or server storage.
    - All shortened links and AI news cache exist solely on the user's device (`localStorage`).
    - Because no server stores this data, links and histories cannot be leaked, hacked, or intercepted.
  - **How to Clear**:
    - Users can delete link history via the **Clear History** button on the "My Links" page.
    - Or purge all app data instantly using the **Clear All Local Data** action button inside this popup.

### 3. Clear Data Interaction
- Clicking the **Clear All Local Data** button prompts a browser confirmation (`window.confirm`) to prevent accidental clicks.
- Upon confirmation:
  1. Deletes `lnk_shrtn_history` from `localStorage`.
  2. Deletes `ai_news_cache` and `ai_news_timestamp` from `localStorage`.
  3. Triggers `window.location.reload()` to refresh the active page and display empty/fresh states.

## Proposed Changes

### App.tsx
- Import `HelpCircle` from `lucide-react`.
- Import `PrivacyModal` from `./components/PrivacyModal`.
- Add `isPrivacyModalOpen` state.
- Render the Help button before the page-switching buttons.
- Render `<PrivacyModal>` at the top level.

### PrivacyModal.tsx
- Create the custom modal with the detailed copy, close handler, and clear data action.

---

## Verification Plan

### Manual Verification
1. Navigate to `/my-links` and `/ai` routes.
2. Verify the question mark button is rendered to the left of the bottom right button on both pages.
3. Verify that on the home/landing page, the question mark button is NOT rendered.
4. Click the button to open the modal.
5. Check visual alignment, pixel font rendering, responsiveness, and close button (`X` icon and "Got It" button).
6. Click "Clear All Local Data", confirm the prompt, and verify that the page reloads and the local storage values are deleted.
