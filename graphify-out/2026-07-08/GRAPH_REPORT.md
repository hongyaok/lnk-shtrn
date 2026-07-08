# Graph Report - .  (2026-07-08)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 151 nodes · 141 edges · 24 communities (12 shown, 12 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `92440a23`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_App.tsx|App.tsx]]
- [[_COMMUNITY_compilerOptions|compilerOptions]]
- [[_COMMUNITY_dependencies|dependencies]]
- [[_COMMUNITY_compilerOptions|compilerOptions]]
- [[_COMMUNITY_urlEncoder.ts|urlEncoder.ts]]
- [[_COMMUNITY_devDependencies|devDependencies]]
- [[_COMMUNITY_.oxlintrc.json|.oxlintrc.json]]
- [[_COMMUNITY_scrape-ai-news.js|scrape-ai-news.js]]
- [[_COMMUNITY_input-group.tsx|input-group.tsx]]
- [[_COMMUNITY_StatusIndicator.tsx|StatusIndicator.tsx]]
- [[_COMMUNITY_button.tsx|button.tsx]]
- [[_COMMUNITY_input.tsx|input.tsx]]
- [[_COMMUNITY_PixelSpinner.tsx|PixelSpinner.tsx]]
- [[_COMMUNITY_tsconfig.json|tsconfig.json]]
- [[_COMMUNITY_vercel.json|vercel.json]]
- [[_COMMUNITY_Favicon SVG Icon|Favicon SVG Icon]]
- [[_COMMUNITY_Icons SVG Asset|Icons SVG Asset]]
- [[_COMMUNITY_Hero PNG Graphic|Hero PNG Graphic]]
- [[_COMMUNITY_React Logo SVG|React Logo SVG]]
- [[_COMMUNITY_Vite Logo SVG|Vite Logo SVG]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 18 edges
2. `compilerOptions` - 15 edges
3. `decodeLinkPayload()` - 5 edges
4. `encodeLinkPayload()` - 4 edges
5. `decodeV3BinaryPayload()` - 4 edges
6. `scripts` - 4 edges
7. `rules` - 3 edges
8. `decodeBinaryPayload()` - 3 edges
9. `LinkPayload` - 2 edges
10. `toBase79()` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (24 total, 12 thin omitted)

### Community 0 - "App.tsx"
Cohesion: 0.09
Nodes (11): Page, Article, RankedArticle, Spline, Spline, SavedLink, Spline, getDisplayLink() (+3 more)

### Community 1 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 2 - "dependencies"
Cohesion: 0.12
Nodes (16): dependencies, fflate, lucide-react, lz-string, qrcode.react, react, react-dom, @splinetool/react-spline (+8 more)

### Community 3 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 4 - "urlEncoder.ts"
Cohesion: 0.22
Nodes (14): BASE_79, decodeBinaryPayload(), decodeLegacyPayload(), decodeLinkPayload(), decodeV3BinaryPayload(), decodeV3String(), DICTIONARY, encodeLinkPayload() (+6 more)

### Community 5 - "devDependencies"
Cohesion: 0.20
Nodes (10): devDependencies, rss-parser, @types/lz-string, @types/node, @types/react, @types/react-dom, typescript, @vercel/node (+2 more)

### Community 6 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 7 - "scrape-ai-news.js"
Cohesion: 0.33
Nodes (4): __dirname, FEEDS, __filename, parser

## Knowledge Gaps
- **92 isolated node(s):** `$schema`, `plugins`, `react/rules-of-hooks`, `react/only-export-components`, `StatusState` (+87 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `devDependencies` to `dependencies`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `$schema`, `plugins`, `react/rules-of-hooks` to the rest of the system?**
  _92 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.09486166007905138 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.1 - nodes in this community are weakly interconnected._
- **Should `dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._