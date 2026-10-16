# Agent Instructions — Tutoring Hours Signage

> **Canonical instructions for every AI tool in this repo** (Copilot, Codex, Claude Code, etc.). Edit this file only — `CLAUDE.md` imports it and `.github/copilot-instructions.md` points here.

<!-- BEGIN SHARED — synced from the parent workspace AGENTS.md (https://github.com/ssaunders9/workspace).
     Edit the workspace copy first, then paste the same block into every nested repo's AGENTS.md. -->

## Workspace Conventions (shared)

This repo is part of a larger faculty workspace for teaching, department service, and research at WSU's Voiland School of Chemical Engineering and Bioengineering (VSCEB). The parent workspace repo is at `https://github.com/ssaunders9/workspace`.

### Naming (strictly enforced)

- **Underscores only, never spaces**: `CHE_441/`, `retention_analysis.py`, `syllabus_2026.pdf`
- **Meta/non-primary folders prefixed with `_`**: `_Archive/`, `_Drafts/`, `_Scripts/`
- **Content folders unprefixed**: `Syllabus/`, `Assets/`, `Canvas_Pages/`
- **Course codes**: space in code (`CHE 101`), underscore in folder name (`CHE_441/`)

### Response Style

**When asked what to work on, or when a session involves a multi-step task, always respond with a numbered list.** Each item should be one actionable thing. Do not combine multiple changes into one list item. The list is the working agenda — the user picks items from it to execute one at a time.

### Patterns

- **Backups are component-local with timestamped names** — never overwrite an existing backup.
- **`_Archive/` and `_Drafts/` are not authoritative** — always edit the non-prefixed sibling.
- **Before editing, inspect the nearby README, local scripts, and canonical source file** so changes match local conventions.
- **Do not consolidate duplicated images, reorganize archives, or clean generated files** unless explicitly asked.
- **Check before re-running a long or resource-heavy script** — confirm it isn't already running, rather than launching another one reflexively.
- **This is a separate git repo** — commit and push from this directory, not from the parent workspace.

<!-- END SHARED -->

## Project: Tutoring Hours Signage

Lightweight, internally hosted webpage shown in a half-screen region of an Xibo digital signage display. Static HTML/CSS/JS — no build step, no framework, no external services.

**Remote**: `https://github.com/ssaunders9/signage`

## Source Files

| File | Purpose |
|---|---|
| `index.html` | Page structure |
| `styles.css` | Layout and styling — high contrast, large type, sized for a half-screen region |
| `app.js` | Loads the CSV, renders the rolling six-hour window, highlights tutoring happening now |
| `data/tutoring_hours.csv` | **The schedule** — the only file staff edit |

## Schedule Data (`data/tutoring_hours.csv`)

Columns: `Day` (weekday name), `Start`/`End` (e.g. `10:00 AM`), `Courses` (semicolon-separated course codes, 3–10 per row), `Active` (`Yes`/`No`). Keep this format stable — non-technical staff edit it directly, so don't add required columns or change value formats without updating `README.md`.

## Running Locally

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

Must be served over HTTP — `fetch()` of the CSV fails from `file://`.

## Editing Guidelines

- **Legibility at a distance is the priority** — keep high contrast and large type; test at the actual player resolution in a 16:9 preview.
- **Keep the automatic refresh** (CSV reload every 5 minutes, clock every 30 seconds) so schedule changes appear without restarting the Xibo layout.
- **No testing controls in production** — they were deliberately disabled; don't re-enable them in committed code.
- See `README.md` for Xibo setup.
