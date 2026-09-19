# Expense Tracker

A desktop expense tracker for Windows with a glass-and-aurora UI, animated charts, CSV export and undo.

## Tech stack

| Area      | Choice                                                      |
| --------- | ----------------------------------------------------------- |
| Shell     | Electron (sandboxed renderer, context isolation, typed IPC) |
| Build     | electron-vite (Vite)                                        |
| UI        | React 19 + TypeScript                                       |
| Charts    | Recharts                                                    |
| Animation | Motion                                                      |
| Data      | JSON file in `%APPDATA%\expense-tracker`, validated by Zod  |
| Packaging | electron-builder (NSIS installer)                           |
| Tests     | Vitest (unit), Playwright (end-to-end against Electron)     |
| Quality   | ESLint, Prettier, GitHub Actions CI                         |

## Getting started

Requires Node.js 22+.

```bash
npm install
npm run dev
```

## Scripts

| Command             | What it does                                         |
| ------------------- | ---------------------------------------------------- |
| `npm run dev`       | Run the app with hot reload                          |
| `npm run build`     | Type-check and build to `out/`                       |
| `npm run dist`      | Build the Windows installer into `release/<version>` |
| `npm test`          | Unit tests                                           |
| `npm run test:e2e`  | Build, then drive the real app with Playwright       |
| `npm run lint`      | ESLint                                               |
| `npm run typecheck` | TypeScript for main/preload and renderer             |
| `npm run format`    | Prettier                                             |
| `npm run icon`      | Regenerate the app icon                              |

## Project layout

```
src/
  main/       Electron main process: window, IPC handlers, storage, validation
  preload/    Exposes the typed `window.api` bridge
  shared/     Types and constants used by both sides
  renderer/   React app (components, hooks, pure logic in lib/)
tests/
  unit/       Vitest tests for lib/ and schema
  e2e/        Playwright tests that launch the built app
```

## Data

Expenses are saved to `%APPDATA%\expense-tracker\expenses.json`. Writes are atomic (temp file + rename),
every load and save is validated, and an unreadable file is kept as `expenses.corrupt-<time>.json`
instead of being overwritten.
