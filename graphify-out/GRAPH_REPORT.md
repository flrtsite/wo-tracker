# Graph Report - workout-tracker  (2026-09-12)

## Corpus Check
- Corpus is ~33,790 words - fits in a single context window. You may not need a graph.

## Summary
- 215 nodes · 256 edges · 23 communities (15 shown, 6 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.9)
- Token cost: 3,000 input · 200 output

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 19
- Community 20
- Community 22

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 18 edges
2. `compilerOptions` - 9 edges
3. `scripts` - 7 edges
4. `react` - 6 edges
5. `scripts` - 5 edges
6. `Button` - 5 edges
7. `generateUUID()` - 5 edges
8. `SmartCrib App Concept` - 5 edges
9. `dotenv` - 4 edges
10. `drizzle-orm` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Cloudflared Tunnel Configuration` --semantically_similar_to--> `cloudflared Service`  [INFERRED] [semantically similar]
  conversation_history.md → docker-compose.yml
- `Apple Touch Icon` --semantically_similar_to--> `app_icon.jpg`  [INFERRED] [semantically similar]
  conversation_history.md → frontend/index.html
- `Cloudflared Tunnel Configuration` --references--> `proxy Service`  [EXTRACTED]
  conversation_history.md → docker-compose.yml
- `App()` --calls--> `generateUUID()`  [EXTRACTED]
  frontend/src/App.tsx → frontend/src/lib/utils.ts
- `AdminPanel()` --calls--> `generateUUID()`  [EXTRACTED]
  frontend/src/components/AdminPanel.tsx → frontend/src/lib/utils.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Docker Compose Services** — docker_compose_db, docker_compose_backend, docker_compose_frontend, docker_compose_proxy, docker_compose_cloudflared [INFERRED 0.95]
- **Smart Home Control Screens** — design_theme3_dashboard_screen, design_theme3_thermostat_screen, design_theme3_lights_screen, design_theme3_music_screen [INFERRED 0.85]

## Communities (23 total, 6 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (27): @types/node, typescript, name, private, scripts, build, dev, lint (+19 more)

### Community 1 - "Community 1"
Cohesion: 0.13
Nodes (22): adminApp, client, db, dailyPlans, exercises, exercisesRelations, sessionGroups, sessionGroupsRelations (+14 more)

### Community 2 - "Community 2"
Cohesion: 0.17
Nodes (16): App(), Screen, AdminPanel(), ProgressChart(), Button, ButtonProps, buttonVariants, db (+8 more)

### Community 3 - "Community 3"
Cohesion: 0.10
Nodes (19): @types/node, typescript, name, scripts, build, db:generate, db:push, db:studio (+11 more)

### Community 4 - "Community 4"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleResolution (+11 more)

### Community 5 - "Community 5"
Cohesion: 0.14
Nodes (14): dependencies, class-variance-authority, clsx, dexie, dexie-react-hooks, lucide-react, @radix-ui/react-slot, react (+6 more)

### Community 6 - "Community 6"
Cohesion: 0.17
Nodes (12): devDependencies, autoprefixer, eslint, postcss, tailwindcss, @types/node, @types/react, @types/react-dom (+4 more)

### Community 7 - "Community 7"
Cohesion: 0.18
Nodes (10): compilerOptions, esModuleInterop, forceConsistentCasingInFileNames, module, moduleResolution, outDir, skipLibCheck, strict (+2 more)

### Community 8 - "Community 8"
Cohesion: 0.22
Nodes (7): ExerciseRecord, ScheduleRecord, SetRecord, TemplateExerciseRecord, TemplateRecord, WorkoutDatabase, dexie

### Community 9 - "Community 9"
Cohesion: 0.25
Nodes (8): dependencies, cors, dotenv, drizzle-orm, hono, @hono/node-server, jsonwebtoken, postgres

### Community 10 - "Community 10"
Cohesion: 0.25
Nodes (8): Cloudflared Tunnel Configuration, Neumorphism Styling, Workout Tracker Application, backend Service, cloudflared Service, db Service, frontend Service, proxy Service

### Community 11 - "Community 11"
Cohesion: 0.29
Nodes (7): devDependencies, drizzle-kit, tsx, @types/cors, @types/jsonwebtoken, @types/node, typescript

### Community 12 - "Community 12"
Cohesion: 0.29
Nodes (7): Dark Neumorphic Design Style, Dashboard Screen UI, Lights Control UI, Music Player UI, SmartCrib App Concept, Theme3 Image File, ThermoStat Control UI

### Community 13 - "Community 13"
Cohesion: 0.50
Nodes (4): Weekly Calendar Widget, Theme 2 Dashboard Design, Header Widget (Time/Date), Steps Tracking Widget

### Community 14 - "Community 14"
Cohesion: 0.50
Nodes (3): Barbell with ZIVA Plates, Gym Gear (Hoodie, Belt, Headphones, Cap), Hamster Squatting

## Knowledge Gaps
- **142 isolated node(s):** `name`, `version`, `dev`, `build`, `start` (+137 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 147 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `Community 5` to `Community 0`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Community 6` to `Community 0`?**
  _High betweenness centrality (0.039) - this node is a cross-community bridge._
- **Why does `drizzle-orm` connect `Community 1` to `Community 3`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **What connects `name`, `version`, `dev` to the rest of the system?**
  _142 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07389162561576355 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.13230769230769232 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._