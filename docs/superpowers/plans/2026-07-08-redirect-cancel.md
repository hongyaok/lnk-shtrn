# Redirect Destination Display and Cancel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement destination URL display (before the first path slash) and a "Cancel Redirect" button that redirects the user back to the home page (landing view).

**Architecture:** Use a string parsing helper to extract the protocol and domain. Update the `RedirectPage` component to keep track of a `cancelled` state, which clears the redirect timeout when true, and use SPA-style navigation to update the page to the landing route (`/`) without page refresh.

**Tech Stack:** React, TypeScript, TSX, HTML5 History API, CSS

---

### Task 1: Add getDisplayLink Helper and Render Destination URL

**Files:**
- Modify: `src/components/RedirectPage.tsx`

- [ ] **Step 1: Add getDisplayLink helper function**
  Add the following helper function at the top level of `src/components/RedirectPage.tsx`, right above the `RedirectPage` component definition:
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

- [ ] **Step 2: Update JSX to render the destination URL**
  Modify the middle JSX container in `src/components/RedirectPage.tsx` (around lines 132-142) to render the destination URL styled with high contrast/readability.
  Replace:
  ```tsx
        <h2 className="redirect-text">Redirecting...</h2>
  ```
  with:
  ```tsx
        <h2 className="redirect-text">Redirecting...</h2>
        {payload && (
          <div style={{
            fontSize: '1rem',
            color: '#a5b4fc',
            wordBreak: 'break-all',
            fontFamily: 'monospace',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            padding: '0.75rem 1rem',
            borderRadius: '4px',
            marginTop: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem'
          }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Destination
            </span>
            <span style={{ fontWeight: 600 }}>
              {getDisplayLink(payload.url)}
            </span>
          </div>
        )}
  ```

- [ ] **Step 3: Run TypeScript compiler and check for errors**
  Run command:
  ```powershell
  npm run build
  ```
  Expected: Successful compilation without errors.

- [ ] **Step 4: Commit Display changes**
  Run:
  ```bash
  git add src/components/RedirectPage.tsx
  git commit -m "feat: show destination URL on redirection page"
  ```

---

### Task 2: Implement Cancel Redirection Behavior and UI Button

**Files:**
- Modify: `src/components/RedirectPage.tsx`

- [ ] **Step 1: Add cancelled state and handleCancel function**
  Add a `cancelled` state inside the `RedirectPage` component and a cancel handler.
  Insert at the beginning of `RedirectPage()` (around lines 10-12):
  ```typescript
    const [cancelled, setCancelled] = useState(false);

    const handleCancel = () => {
      setCancelled(true);
      window.history.pushState({}, '', '/');
      window.dispatchEvent(new PopStateEvent('popstate'));
    };
  ```

- [ ] **Step 2: Update redirect timer useEffect**
  Update the redirect timer hook (around lines 62-71) to depend on `cancelled` and prevent setting the timeout if `cancelled` is true.
  Replace:
  ```typescript
    useEffect(() => {
      // Only start the redirect timer once the Spline scene has loaded
      if (splineLoaded && payload && !error) {
        const timer = setTimeout(() => {
          window.location.href = payload.url;
        }, 3500); // Redirect after 2 seconds (animation speed is doubled)

        return () => clearTimeout(timer);
      }
    }, [splineLoaded, payload, error]);
  ```
  with:
  ```typescript
    useEffect(() => {
      if (cancelled) return;

      // Only start the redirect timer once the Spline scene has loaded
      if (splineLoaded && payload && !error) {
        const timer = setTimeout(() => {
          window.location.href = payload.url;
        }, 3500); // Redirect after 2 seconds (animation speed is doubled)

        return () => clearTimeout(timer);
      }
    }, [splineLoaded, payload, error, cancelled]);
  ```

- [ ] **Step 3: Enable pointer events on the middle overlay container**
  Currently, the middle container has `pointerEvents: 'none'`. We need the container to allow pointer events for children, or apply `pointerEvents: 'auto'` to the interactive components.
  Change the style of the middle container in the JSX:
  Replace:
  ```tsx
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          pointerEvents: 'none'
        }}>
  ```
  with:
  ```tsx
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          width: '90%',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
  ```
  This container does not set `pointerEvents: 'none'` by default, but we will make sure the elements inside are interactive.
  Wait, let's verify if parent `pointerEvents` inherits. Yes. If we don't set it to `'none'` on the container, pointer events will be enabled by default. Since it overlays the Spline scene, we can set `pointerEvents: 'none'` on the container and `pointerEvents: 'auto'` on the child elements that need interaction (like the display box and the button), which prevents blocking Spline drags outside the buttons. Let's do that!
  ```tsx
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          pointerEvents: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          width: '90%',
          maxWidth: '400px',
          textAlign: 'center'
        }}>
  ```
  And then on the button and destination div, we specify `pointerEvents: 'auto'`.

- [ ] **Step 4: Add the Cancel Redirect button to the UI**
  Add the button element right after the destination URL layout block in the JSX:
  ```tsx
        <button
          onClick={handleCancel}
          className="btn-secondary"
          style={{
            pointerEvents: 'auto',
            padding: '0.625rem 1.25rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            border: '2px solid rgba(255, 255, 255, 0.2)',
            borderRadius: 0,
            cursor: 'pointer',
            marginTop: '0.5rem'
          }}
        >
          Cancel Redirect
        </button>
  ```

- [ ] **Step 5: Run TypeScript compilation**
  Run:
  ```powershell
  npm run build
  ```
  Expected: Successful compilation without errors.

- [ ] **Step 6: Commit all cancel redirection changes**
  Run:
  ```bash
  git add src/components/RedirectPage.tsx
  git commit -m "feat: add cancel redirect functionality and cancel button"
  ```
