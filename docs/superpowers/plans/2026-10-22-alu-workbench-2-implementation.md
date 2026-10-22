# 阿卢工作台 2.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the unused six-department dashboard with a mobile-first personal planning PWA that tracks goals, weekly actions, lightweight health logs, and weekly reviews.

**Architecture:** A fresh modular browser application uses pure ES-module domain functions for dates, progress, and validation; an in-browser local repository persists immediately and a CloudBase repository can be configured later for authenticated sync. The UI is a five-tab responsive shell with a light blue island design and an unobtrusive Stitch accent.

**Tech Stack:** HTML, CSS, browser ES modules, Node built-in test runner, Service Worker, CloudBase JS SDK adapter (configuration-gated).

**Spec:** `docs/superpowers/specs/2026-10-22-alu-workbench-2-design.md`

## Global Constraints

- Keep the product personal-only; do not include work tasks, detailed accounting, content scraping, AI calls, or old department navigation.
- Default daily task: morning study only; cap active daily tasks at three.
- Week is Monday through Sunday; weekly exercise target is three sessions of at least 20 minutes.
- Water cup is 250ml and default daily target is 1750ml.
- No paid service, custom domain, automatic overage, or ChatGPT identity dependency.
- Preserve the existing untracked files and do not delete them.

---

### Task 1: Testable domain model

**Files:**
- Create: `src/domain.js`
- Create: `test/domain.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces `mondayOf(date)`, `progressForGoal(goal, goals, tasks)`, `canAddDailyTask(tasks, date)`, `waterMl(cups, cupMl)`, and `exerciseCount(logs, weekStart)`.

- [ ] Write failing Node tests for Monday calculation, three-task cap, water conversion, qualifying exercise count, and parent progress.
- [ ] Run `node --test test/domain.test.mjs` and verify failure because `src/domain.js` is absent.
- [ ] Implement only the exported domain helpers required by those tests.
- [ ] Run `node --test test/domain.test.mjs` and verify all tests pass.

### Task 2: Local-first data repository and seed plan

**Files:**
- Create: `src/store.js`
- Create: `test/store.test.mjs`
- Modify: `src/domain.js`

**Interfaces:**
- Consumes domain helpers from Task 1.
- Produces `createInitialState()`, `normalizeState(value)`, `createRepository(storage)`, and initial four annual goals.

- [ ] Write failing tests showing the seed state contains the four agreed annual goals and repository save/load round-trips state.
- [ ] Run `node --test test/store.test.mjs` and verify failure because `src/store.js` is absent.
- [ ] Implement seed state, schema normalization, and the injected-storage repository.
- [ ] Run `node --test test/domain.test.mjs test/store.test.mjs` and verify all tests pass.

### Task 3: New mobile-first application shell

**Files:**
- Replace: `index.html`
- Create: `src/app.js`
- Create: `styles.css`
- Modify: `manifest.webmanifest`

**Interfaces:**
- Consumes store functions and domain helpers.
- Produces five navigation views: overview, plan, records, review, profile.

- [ ] Add a failing DOM-free render-state test for the overview derived data.
- [ ] Implement the semantic HTML shell and an app controller that renders overview data from state.
- [ ] Add plan, records, review, and profile view routing with no legacy department UI.
- [ ] Verify `npm test` and serve the page locally to confirm module loading returns HTTP 200.

### Task 4: Planning, recording, and review interactions

**Files:**
- Modify: `src/app.js`
- Modify: `src/store.js`
- Modify: `test/store.test.mjs`

**Interfaces:**
- Produces task creation/completion, water cup updates, sleep/meals/exercise logs, weekly review save, and recursive goal progress updates.

- [ ] Write failing tests for completing a task, one qualifying Keep session, and saving a weekly review.
- [ ] Implement minimal immutable state operations and call repository save after every user action.
- [ ] Wire interactions to accessible buttons and short forms.
- [ ] Run all Node tests and manually check the four accepted dashboard flows from the spec.

### Task 5: PWA, export/import, and CloudBase-ready sync boundary

**Files:**
- Modify: `sw.js`
- Modify: `src/app.js`
- Create: `src/cloud-sync.js`
- Modify: `app-config.js`
- Modify: `README.md`

**Interfaces:**
- Produces `exportState`, `importState`, `createCloudSync(config)`, and a disabled-by-default configuration shape.

- [ ] Write failing tests for rejecting malformed imports and accepting a normalized exported state.
- [ ] Implement JSON export/import and a CloudBase adapter that remains disabled until the user supplies a CloudBase environment configuration.
- [ ] Update service-worker cache version and manifest branding; ensure no old-character assets are referenced.
- [ ] Run all tests, inspect generated JSON import/export locally, and verify offline shell files are cached.

### Task 6: Visual QA and documentation

**Files:**
- Modify: `README.md`
- Modify: `docs/superpowers/specs/2026-10-22-alu-workbench-2-design.md`

- [ ] Run `npm test` and `npm start`.
- [ ] Check desktop and narrow mobile layouts, keyboard navigation, tab routing, and the dashboard’s task cap.
- [ ] Document local use, PWA installation, data backup, and the user-owned CloudBase activation step.
- [ ] Commit only files created or changed for 2.0, leaving unrelated untracked files untouched.
