# Life Workbench Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the phone workbench around measurable goals, editable period plans, durable daily records, evidence-based weekly reviews, and the approved Morning Mist Island visual direction.

**Architecture:** Keep static GitHub Pages and browser localStorage. Split domain calculations from state migration and UI rendering. Goals own numeric/phase progress; plans own time-period status; daily tasks own completion; daily logs own factual records.

**Tech Stack:** Vanilla ES modules, Node built-in test runner, localStorage, CSS, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-10-23-life-workbench-information-architecture.md`

## Global Constraints

- No paid service, server database, or account requirement.
- Preserve current local tasks/logs/reviews when migrating state.
- All percentages show their source unit and period.
- Mobile-first Android Chrome UI; use the approved frosted white/ice-blue/indigo design.
- Run `npm test`, `node --check`, `git diff --check`, then verify deployed files before completion.

---

### Task 1: Create measurable goal and period helpers

**Files:**
- Modify: `src/domain.js`
- Modify: `test/domain.test.mjs`

**Interfaces:**
- Produces `goalProgress(goal)`, `applyGoalValue(goal, amount)`, `periodFor(level, date)`, and `validParent(level, parent)`.

- [ ] **Step 1: Write failing tests** for a 500 yuan contribution to a 20,000 yuan goal returning 3%, valid month/quarter/week keys, and invalid plan parents.
- [ ] **Step 2: Run `npm test`** and confirm the missing exports fail.
- [ ] **Step 3: Implement the four helpers** using numeric target/current fields and fixed hierarchy rules: annual → quarter → month → week.
- [ ] **Step 4: Run `npm test`** and confirm all domain tests pass.
- [ ] **Step 5: Commit** with `feat: add measurable goal progress helpers`.

### Task 2: Migrate browser state without converting plans into goal progress

**Files:**
- Modify: `src/store.js`
- Create: `test/store.test.mjs`

**Interfaces:**
- Consumes `goalProgress` and existing state shape.
- Produces normalized `goals`, `plans`, `tasks`, `logs`, `reviews`, and `settings` fields.

- [ ] **Step 1: Write failing migration tests** covering old goals becoming zero-progress phase goals, existing logs gaining default fields, and existing tasks remaining unchanged.
- [ ] **Step 2: Run `npm test`** and confirm migration tests fail.
- [ ] **Step 3: Implement normalizers** for goals, plans, logs and settings; retain old values and never infer completion from a legacy plan checkbox.
- [ ] **Step 4: Run `npm test`** and confirm state tests pass.
- [ ] **Step 5: Commit** with `feat: migrate workbench state safely`.

### Task 3: Replace the interaction model with editable goals, plans, tasks and logs

**Files:**
- Modify: `src/app.js`
- Modify: `test/records.test.mjs`

**Interfaces:**
- Consumes normalized state plus domain helpers.
- Produces user interactions for goal values, constrained period plans, editable/deletable daily tasks, unified logs, archive, and weekly review summaries.

- [ ] **Step 1: Write failing record/task tests** for editing/deleting a task and saving meal/water/sleep/exercise fields under a date.
- [ ] **Step 2: Run `npm test`** and confirm the new tests fail.
- [ ] **Step 3: Rewrite page renderers** for Today, Plan, Record, Review and My with a small event-routing layer.
- [ ] **Step 4: Implement plan forms** with selectors for year, quarter, month and week, and only legal parent options.
- [ ] **Step 5: Implement goal forms** with target/current/unit or stage percent, and make plan completion independent of goal values.
- [ ] **Step 6: Implement unified daily logging and record archive**, including meal text instead of meal checkboxes.
- [ ] **Step 7: Run `npm test`** and confirm all interaction/domain tests pass.
- [ ] **Step 8: Commit** with `feat: rebuild personal planning and records flow`.

### Task 4: Apply the approved Morning Mist Island mobile design

**Files:**
- Modify: `styles.css`
- Modify: `index.html`
- Create: `assets/morning-mist-island-hero.png`

**Interfaces:**
- Consumes the selected visual reference and semantic class names from `src/app.js`.
- Produces responsive frosted-glass cards, date hero, legible forms, progress rings, and five-item bottom navigation.

- [ ] **Step 1: Add the selected visual asset** to `assets/` without replacing unrelated existing images.
- [ ] **Step 2: Add semantic layout classes** needed by the styles, preserving labels and keyboard-accessible controls.
- [ ] **Step 3: Rewrite CSS tokens and components** for white mist glass, ice blue/indigo actions, backdrop blur, readable contrast, and Android safe-area bottom navigation.
- [ ] **Step 4: Load the app locally** and manually check Today, Plan, Record, Review, and My at phone width.
- [ ] **Step 5: Run `npm test`, `node --check src/app.js`, and `git diff --check`**.
- [ ] **Step 6: Commit** with `feat: apply morning mist island visual system`.

### Task 5: Publish and verify phone delivery

**Files:**
- No source changes expected unless deployment verification finds a defect.

**Interfaces:**
- Consumes GitHub Pages workflow already in `.github/workflows/deploy-pages.yml`.
- Produces a live HTTPS URL with current source assets.

- [ ] **Step 1: Push `main` to `github`**.
- [ ] **Step 2: Wait for the GitHub Pages workflow** for the pushed SHA to complete successfully.
- [ ] **Step 3: Fetch the public URL** and verify new app text and generated asset both return HTTP 200.
- [ ] **Step 4: Report the URL and Android install steps**, including that data stays on this phone until exported.
