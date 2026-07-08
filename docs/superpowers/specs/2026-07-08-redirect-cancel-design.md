# Spec: Redirect Destination Display and Cancel Functionality

## Goal
Enhance the redirection experience for shortened links:
1. Show the user the destination domain (everything before the first path slash `/` after the protocol) while the redirect countdown is active.
2. Provide a "Cancel Redirect" button to allow users to abort the redirect and return safely to the landing page.

## Proposed Approaches

### Approach 1: Origin/Protocol Display with SPA Navigation (Recommended)
* **Redirection Display**: Parse the full URL and show the protocol and host (e.g., `https://github.com` for `https://github.com/facebook/react`). This is safe, displays the protocol so the user knows if it's secure (HTTPS), and trims the path.
* **Cancel Behavior**: Clear the active timeout and update the application history state to `/` using HTML5 history pushState, dispatching a `popstate` event. This avoids a page reload and returns to the home page smoothly.

### Approach 2: Hostname Display with Page Reload
* **Redirection Display**: Show only the hostname (e.g., `github.com`), stripping `https://` or `http://`.
* **Cancel Behavior**: Clear the timeout and set `window.location.href = '/'`. This causes a full page refresh, reloading all scripts and the Spline background scene.

### Recommended Choice
**Approach 1** is recommended because:
* Showing the protocol (e.g., `https://`) gives users reassurance of the link's security.
* SPA navigation (`pushState`) is significantly faster and doesn't trigger a hard reload of the heavy Spline background scene.

---

## Design Details

### 1. Extracting display URL
A helper function `getDisplayLink` will parse the URL.
```typescript
const getDisplayLink = (url: string): string => {
  const protocolIndex = url.indexOf('://');
  if (protocolIndex !== -1) {
    const firstSlashIndex = url.indexOf('/', protocolIndex + 3);
    if (firstSlashIndex !== -1) {
      return url.substring(0, firstSlashIndex);
    }
  } else {
    const firstSlashIndex = url.indexOf('/');
    if (firstSlashIndex !== -1) {
      return url.substring(0, firstSlashIndex);
    }
  }
  return url;
};
```

### 2. Cancel and Timeout Safety
A state variable `cancelled` will track whether the user aborted:
* If `cancelled` is true, the `useEffect` timeout is skipped/cleared.
* The cancel button calls:
  ```typescript
  const handleCancel = () => {
    setCancelled(true);
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };
  ```

### 3. UI Styling
* Display a clean, styled destination box below the "Redirecting..." text.
* Add a "Cancel Redirect" button using the existing `.btn-secondary` class with direct pointer events active (`pointerEvents: 'auto'`).
* Ensure all elements inside the center overlay have pointer-events set to auto where interaction is needed.

---

## Verification Plan

### Manual Verification
1. Open a short link (e.g., `/#v3_payload`).
2. Verify that "Redirecting..." is displayed along with the correct host (e.g., `https://github.com`).
3. Click "Cancel Redirect".
4. Verify that redirection is aborted, the browser address bar changes to `/`, and the landing page is shown without a full reload.
