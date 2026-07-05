# Graph Report - .  (2026-07-06)

## Corpus Check
- Corpus is ~12,355 words - fits in a single context window. You may not need a graph.

## Summary
- 127 nodes · 135 edges · 17 communities (11 shown, 6 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.95)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_App TypeScript Compilation Config|App TypeScript Compilation Config]]
- [[_COMMUNITY_Payload Decoding & Redirect System|Payload Decoding & Redirect System]]
- [[_COMMUNITY_NodeVite TS Compilation Config|Node/Vite TS Compilation Config]]
- [[_COMMUNITY_Package Dependencies & Scripts|Package Dependencies & Scripts]]
- [[_COMMUNITY_Landing Page & UI Controls|Landing Page & UI Controls]]
- [[_COMMUNITY_App Root & Status System|App Root & Status System]]
- [[_COMMUNITY_Development Tooling & Dependencies|Development Tooling & Dependencies]]
- [[_COMMUNITY_Oxlint Linter Configuration|Oxlint Linter Configuration]]
- [[_COMMUNITY_Asset & Plan Spec Documentation|Asset & Plan Spec Documentation]]
- [[_COMMUNITY_Project Overview & Protocol|Project Overview & Protocol]]
- [[_COMMUNITY_Root TypeScript References|Root TypeScript References]]
- [[_COMMUNITY_Vercel Routing Configurations|Vercel Routing Configurations]]
- [[_COMMUNITY_Icon Assets (SVG)|Icon Assets (SVG)]]
- [[_COMMUNITY_Hero Visual Graphics|Hero Visual Graphics]]
- [[_COMMUNITY_React Brand Logo|React Brand Logo]]
- [[_COMMUNITY_Vite Brand Logo|Vite Brand Logo]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 18 edges
2. `compilerOptions` - 15 edges
3. `decodeLinkPayload()` - 7 edges
4. `encodeLinkPayload()` - 5 edges
5. `scripts` - 4 edges
6. `testRoundtrip()` - 4 edges
7. `rules` - 3 edges
8. `LinkPayload` - 3 edges
9. `decodeBinaryPayload()` - 3 edges
10. `Favicon SVG Icon` - 3 edges

## Surprising Connections (you probably didn't know these)
- `Favicon and Spline Update Plan` --references--> `Favicon SVG Icon`  [EXTRACTED]
  docs/superpowers/plans/2026-07-06-favicon-spline-update.md → public/favicon.svg
- `Favicon and Spline Update Spec` --references--> `Favicon SVG Icon`  [EXTRACTED]
  docs/superpowers/specs/2026-07-06-favicon-spline-update-design.md → public/favicon.svg
- `Main HTML Entry Point` --references--> `Favicon SVG Icon`  [EXTRACTED]
  index.html → public/favicon.svg
- `Favicon and Spline Update Plan` --conceptually_related_to--> `Favicon and Spline Update Spec`  [INFERRED]
  docs/superpowers/plans/2026-07-06-favicon-spline-update.md → docs/superpowers/specs/2026-07-06-favicon-spline-update-design.md
- `testRoundtrip()` --calls--> `decodeLinkPayload()`  [EXTRACTED]
  src/utils/urlEncoder.test.ts → src/utils/urlEncoder.ts

## Import Cycles
- None detected.

## Communities (17 total, 6 thin omitted)

### Community 0 - "App TypeScript Compilation Config"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 1 - "Payload Decoding & Redirect System"
Cohesion: 0.18
Nodes (15): Spline, decodeBinaryPayload(), decodeLegacyPayload(), decodeLinkPayload(), encodeLinkPayload(), EPOCH_MS, fromBase64Url(), LinkPayload (+7 more)

### Community 2 - "Node/Vite TS Compilation Config"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 3 - "Package Dependencies & Scripts"
Cohesion: 0.13
Nodes (14): dependencies, lucide-react, lz-string, react, react-dom, @splinetool/react-spline, name, private (+6 more)

### Community 4 - "Landing Page & UI Controls"
Cohesion: 0.16
Nodes (7): InputGroup(), InputGroupProps, InputBase, InputBaseProps, Spline, Button, ButtonProps

### Community 5 - "App Root & Status System"
Cohesion: 0.24
Nodes (5): Page, ExpiredPage(), StatusIndicator(), StatusIndicatorProps, StatusState

### Community 6 - "Development Tooling & Dependencies"
Cohesion: 0.25
Nodes (8): devDependencies, @types/lz-string, @types/node, @types/react, @types/react-dom, typescript, vite, @vitejs/plugin-react

### Community 7 - "Oxlint Linter Configuration"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 8 - "Asset & Plan Spec Documentation"
Cohesion: 0.67
Nodes (4): Favicon and Spline Update Plan, Favicon and Spline Update Spec, Main HTML Entry Point, Favicon SVG Icon

### Community 9 - "Project Overview & Protocol"
Cohesion: 0.67
Nodes (3): Binary Encoding Protocol v1, lnk-shrtn Project Overview, Serverless URL Shortener Architecture

## Knowledge Gaps
- **79 isolated node(s):** `$schema`, `plugins`, `react/rules-of-hooks`, `react/only-export-components`, `name` (+74 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Development Tooling & Dependencies` to `Package Dependencies & Scripts`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **What connects `$schema`, `plugins`, `react/rules-of-hooks` to the rest of the system?**
  _79 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App TypeScript Compilation Config` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `Node/Vite TS Compilation Config` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `Package Dependencies & Scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._