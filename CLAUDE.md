# Cardtable

Browser-based virtual card table for playing LCGs and other card games solo or
with friends. Deployed to https://card-table.app from `main` via GitHub Pages
(`.github/workflows/gh-pages.yml`). No backend in this repo — multiplayer talks
to an external websocket server or peer-to-peer over WebRTC.

## Commands

```bash
yarn                 # install; also runs scripts/postinstall.sh (see Gotchas)
yarn start           # dev server on 0.0.0.0:3000
yarn build           # `tsc && vite build` — tsconfig sets noEmit, so this is the typecheck gate
yarn test --run      # vitest, single pass (bare `yarn test` watches)
yarn serve           # preview a built bundle
yarn setup-images    # unpack local card images from .imagepacks/
```

Quality gate before committing: `yarn build` then `yarn test --run`. There is no
`lint` script — `eslintConfig: react-app` in package.json is consumed by the
editor plugin only, so lint problems will not surface in CI.

## Stack

React 19 · TypeScript 5.9 (`strict: true`) · Konva + react-konva for the canvas ·
Redux Toolkit · Vite 7 · Vitest · Yarn v1 · PWA via vite-plugin-pwa.

Two MUI generations coexist: `@material-ui/*` v4 and `@mui/material` v7. Match
whichever the file you are editing already uses; don't mix them in one component.
`react-app-rewired` is a leftover CRA dependency and is not wired to anything.

## Architecture

**Redux is the source of truth; the Konva canvas is a projection of it.** Nearly
every user gesture dispatches an action rather than mutating canvas nodes.

### Store shape (`src/store/rootReducer.ts`)

```
game            # UI + session state, not undoable
cardsData       # loaded card metadata, not undoable
notifications   # not undoable
liveState       # redux-undo wrapper, limit 40
  present
    arrows counters cards notes playmats tokenBags
```

Anything under `liveState` is reached as `state.liveState.present.*` — see
`src/features/cards/cards.selectors.ts` for the idiom. The `filter` and `groupBy`
config on the `undoable()` call controls which actions create undo entries;
high-frequency drag actions are excluded there.

### Feature slices (`src/features/<name>/`)

Every feature has `initialState.ts`, `<name>.slice.ts`, and `<name>.selectors.ts`.
Add `<name>.actions.ts` and `<name>.thunks.ts` when the feature needs them —
`notes` and `notifications` have neither. Follow this layout for new features.

### Multiplayer (`src/store/`)

Sync works by **broadcasting Redux actions to peers**. Two interchangeable
middlewares: `websocket-server-multiplayer-middleware.ts` (default) and
`peer-js-redux-middleware.ts` (WebRTC, enabled by the `__webrtc_mp__` localStorage
key). `configureStore.ts` picks one at startup.

> **Biggest gotcha in the codebase:** actions are broadcast *by default*. A new
> action that should stay local — zoom, pan, hover, preview, any per-player UI
> state — must be added to `blacklistRemoteActions` in
> `src/store/middleware-utilities.ts`. Forgetting this makes one player's local
> UI changes leak onto every other player's screen.

### Game modules (`src/game-modules/`)

Each supported game is a `GameModule` subclass. `GameModule.ts` splits its
surface deliberately: `abstract` members every game must implement (card data
loading, decklist parsing, encounter sets) versus optional `method?()` hooks a
game can opt into (`shouldRotateCard?`, `getTokensForEncounterSet?`, …). Prefer an
optional hook over threading a flag through shared code.

Adding a game means all of:
1. a `GameType` enum entry in `game-modules/GameType.ts`
2. a `<Name>GameModule.ts` subclass plus its `properties.ts`
3. registration in the `games` array in `game-modules/GameModuleManager.ts`
4. optionally `scripts/postinstall.sh` to fetch that game's card data

### Component convention

Presentational/container split throughout `src/`: `Foo.tsx` holds the rendering,
`FooContainer.tsx` is a thin `connect(mapStateToProps)` wrapper. New connected
components should follow this rather than using hooks-based `useSelector`.

## Gotchas

- **`yarn` does real network work.** `scripts/postinstall.sh` walks every game
  module and runs its `scripts/postinstall.sh`, which git-clones or pulls that
  game's external card-data repo into `src/game-modules/<game>/external/` and
  generates files from it. Those directories are gitignored and absent on a fresh
  clone. Expect a slow first install.
- **Card images are not in the repo.** `public/images/cards` is gitignored;
  `yarn setup-images` unpacks the Marvel Champions packs from `.imagepacks/`.
- **A few very large files.** `Game.tsx` (~74k), `features/cards/cards.slice.ts`
  (~69k), `GameContextMenu.tsx` (~30k), `ContextualOptionsMenu.tsx` (~25k),
  `features/cards/cards.thunks.ts` (~24k). Read the region you need rather than
  the whole file.
- **Test coverage is thin** — `App.test.ts` and `utilities/card-utils.test.ts` are
  the only test files. There is no existing suite to lean on for regressions.
- `loglevel` (`import log from "loglevel"`) is used in the store and middleware;
  plain `console.log` is common elsewhere.
- Runtime feature flags are localStorage keys defined in
  `src/constants/app-constants.ts` (`__dev_ws__`, `__webrtc_mp__`,
  `__show_hidden_games__`).
- `patches/` is applied by patch-package on install; edit the patch, not
  `node_modules`.

## Issue tracking

<!-- BEGIN BEADS INTEGRATION v:1 profile:minimal hash:6cd5cc61 -->
## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Use `bd` for ALL task tracking — do NOT use TodoWrite, TaskCreate, or markdown TODO lists
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files

**Architecture in one line:** issues live in a local Dolt DB; sync uses `refs/dolt/data` on your git remote; `.beads/issues.jsonl` is a passive export. See https://github.com/gastownhall/beads/blob/main/docs/SYNC_CONCEPTS.md for details and anti-patterns.

## Agent Context Profiles

The managed Beads block is task-tracking guidance, not permission to override repository, user, or orchestrator instructions.

- **Conservative (default)**: Use `bd` for task tracking. Do not run git commits, git pushes, or Dolt remote sync unless explicitly asked. At handoff, report changed files, validation, and suggested next commands.
- **Minimal**: Keep tool instruction files as pointers to `bd prime`; use the same conservative git policy unless active instructions say otherwise.
- **Team-maintainer**: Only when the repository explicitly opts in, agents may close beads, run quality gates, commit, and push as part of session close. A current "do not commit" or "do not push" instruction still wins.

## Session Completion

This protocol applies when ending a Beads implementation workflow. It is subordinate to explicit user, repository, and orchestrator instructions.

1. **File issues for remaining work** - Create beads for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **Handle git/sync by active profile**:
   ```bash
   # Conservative/minimal/default: report status and proposed commands; wait for approval.
   git status

   # Team-maintainer opt-in only, unless current instructions forbid it:
   git pull --rebase
   git push
   git status
   ```
5. **Hand off** - Summarize changes, validation, issue status, and any blocked sync/commit/push step

**Critical rules:**
- Explicit user or orchestrator instructions override this Beads block.
- Do not commit or push without clear authority from the active profile or the current user request.
- If a required sync or push is blocked, stop and report the exact command and error.
<!-- END BEADS INTEGRATION -->
