# Graph Report - c:/Users/hongy/Desktop/lnk-shrtn  (2026-07-07)

## Corpus Check
- 7 files · ~427,258 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 128 nodes · 128 edges · 20 communities (10 shown, 10 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_App Views & Payload Processing|App Views & Payload Processing]]
- [[_COMMUNITY_App TypeScript Configuration|App TypeScript Configuration]]
- [[_COMMUNITY_NodeVite TS Configuration|Node/Vite TS Configuration]]
- [[_COMMUNITY_Package Dependencies & Scripts|Package Dependencies & Scripts]]
- [[_COMMUNITY_Package Dev Dependencies|Package Dev Dependencies]]
- [[_COMMUNITY_Oxlint Linting Settings|Oxlint Linting Settings]]
- [[_COMMUNITY_Asset & Plan Spec Documentation|Asset & Plan Spec Documentation]]
- [[_COMMUNITY_UI Input Group Component|UI Input Group Component]]
- [[_COMMUNITY_UI Status Indicator Component|UI Status Indicator Component]]
- [[_COMMUNITY_UI Button Component|UI Button Component]]
- [[_COMMUNITY_Project Overview & Specs|Project Overview & Specs]]
- [[_COMMUNITY_UI Input Base Component|UI Input Base Component]]
- [[_COMMUNITY_Root TypeScript References|Root TypeScript References]]
- [[_COMMUNITY_Vercel Routing Config|Vercel Routing Config]]
- [[_COMMUNITY_SVG Icon Assets|SVG Icon Assets]]
- [[_COMMUNITY_Hero PNG Graphic|Hero PNG Graphic]]
- [[_COMMUNITY_React Logo SVG|React Logo SVG]]
- [[_COMMUNITY_Vite Logo SVG|Vite Logo SVG]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 18 edges
2. `compilerOptions` - 15 edges
3. `decodeLinkPayload()` - 7 edges
4. `encodeLinkPayload()` - 5 edges
5. `scripts` - 4 edges
6. `decodeV3BinaryPayload()` - 4 edges
7. `rules` - 3 edges
8. `Favicon SVG Icon` - 3 edges
9. `LinkPayload` - 3 edges
10. `decodeBinaryPayload()` - 3 edges

## Surprising Connections (you probably didn't know these)
- `Favicon and Spline Update Plan` --references--> `Favicon SVG Icon`  [EXTRACTED]
  docs/superpowers/plans/2026-07-06-favicon-spline-update.md → public/favicon.svg
- `Favicon and Spline Update Spec` --references--> `Favicon SVG Icon`  [EXTRACTED]
  docs/superpowers/specs/2026-07-06-favicon-spline-update-design.md → public/favicon.svg
- `Main HTML Entry Point` --references--> `Favicon SVG Icon`  [EXTRACTED]
  index.html → public/favicon.svg
- `Favicon and Spline Update Plan` --conceptually_related_to--> `Favicon and Spline Update Spec`  [INFERRED]
  docs/superpowers/plans/2026-07-06-favicon-spline-update.md → docs/superpowers/specs/2026-07-06-favicon-spline-update-design.md

## Import Cycles
- None detected.

## Communities (20 total, 10 thin omitted)

### Community 0 - "App Views & Payload Processing"
Cohesion: 0.14
Nodes (17): Page, Spline, Spline, BASE_79, decodeBinaryPayload(), decodeLegacyPayload(), decodeLinkPayload(), decodeV3BinaryPayload() (+9 more)

### Community 1 - "App TypeScript Configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 2 - "Node/Vite TS Configuration"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 3 - "Package Dependencies & Scripts"
Cohesion: 0.12
Nodes (15): dependencies, lucide-react, lz-string, qrcode.react, react, react-dom, @splinetool/react-spline, name (+7 more)

### Community 4 - "Package Dev Dependencies"
Cohesion: 0.25
Nodes (8): devDependencies, @types/lz-string, @types/node, @types/react, @types/react-dom, typescript, vite, @vitejs/plugin-react

### Community 5 - "Oxlint Linting Settings"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 6 - "Asset & Plan Spec Documentation"
Cohesion: 0.50
Nodes (4): Favicon and Spline Update Plan, Favicon and Spline Update Spec, Main HTML Entry Point, Favicon SVG Icon

### Community 10 - "Project Overview & Specs"
Cohesion: 0.67
Nodes (3): Binary Encoding Protocol v1, lnk-shrtn Project Overview, Serverless URL Shortener Architecture

## Knowledge Gaps
- **79 isolated node(s):** `$schema`, `plugins`, `react/rules-of-hooks`, `react/only-export-components`, `StatusState` (+74 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Package Dev Dependencies` to `Package Dependencies & Scripts`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `$schema`, `plugins`, `react/rules-of-hooks` to the rest of the system?**
  _79 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Views & Payload Processing` be split into smaller, more focused modules?**
  _Cohesion score 0.13666666666666666 - nodes in this community are weakly interconnected._
- **Should `App TypeScript Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Node/Vite TS Configuration` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `Package Dependencies & Scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.125 - nodes in this community are weakly interconnected._