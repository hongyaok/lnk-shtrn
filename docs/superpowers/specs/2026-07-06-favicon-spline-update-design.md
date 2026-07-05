# Spec: Favicon and Landing Page Spline Update

## Goal
Update the page favicon to a dark-mode minimalist black/white theme, and replace the landing page Spline scene with the updated `landingv2.splinecode` asset.

## Design Details

### Favicon Update
* **File Path**: `public/favicon.svg`
* **Background**: Solid black (`#000000`)
* **Border**: Thin semi-transparent white border (`rgba(255, 255, 255, 0.15)`) with rounded corners (`rx="10"`)
* **Text**: Pure white (`#ffffff`) "LS" in monospace font.

### Spline Integration
* **Source**: `c:\Users\hongy\Desktop\lnk-shrtn\landingv2.splinecode`
* **Destination**: `public/spline/landingv2.splinecode`
* **Component Update**: Set `SPLINE_SCENE_URL` to `/spline/landingv2.splinecode` in `src/components/LandingPage.tsx`.

## Verification Plan
1. Check that the tab icon (favicon) renders as black with a white outline and "LS" text.
2. Verify that the landing page loads the new `landingv2.splinecode` scene correctly.
