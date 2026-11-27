# Changelog

All notable changes to this project are documented in this file, newest first.

The format is loosely based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Entries are grouped by date rather than by version.

## 2026-11-27

The starter template is now **Feed View**, a Feed layout for Obsidian Bases.

### Added

-   A **Feed** layout for Bases (newspaper icon): every note the Base returns as a card in one scrolling column, with Sort and Filter from the Base toolbar
-   Card bodies edited in place with Obsidian's Live Preview editor. Edits save to the note, and outside edits merge into the card
-   A feed bar with **Live preview | Reading** and **Collapse all / Expand all**. The mode is saved with the view (`feedMode`)
-   A settings tab (_Settings → Feed View_) with a **Width** dropdown (Default, Full width or Custom width) that applies to every feed and updates open feeds straight away. Custom width shows a slider for the percentage of the view to use (25–100%, default 100%)
-   **Day headings**, **Show replies on threads**, **Reply buttons** and **Show timestamp** settings, in a **Features** section of the settings tab, with **Width** under **Styling**. Turning off Show replies on threads hides replies from the feed, and Reply with them. Turning off Reply buttons hides the Reply button and **⋯ → Reply**; existing replies still show in their threads
-   Each card shows the time its note was created (from the file's created time), with the full date on hover
-   Folding single cards ("N lines hidden"), with fold state kept per note and per view on this device
-   Replies: **Reply** immediately creates an `Untitled` note in the parent's folder with `reply: "[[Parent]]"`, scrolls to its card and focuses its Live Preview editor. Replies show as indented cards joined by a curved line, are found anywhere in the vault, and stay one level deep
-   Feeds open in tabs are rebuilt when the plugin is disabled, reloaded or re-enabled, so they never keep running old code
-   Day headings (TODAY, YESTERDAY, weekday and date), using created time or a **Date property** view option
-   The Base's visible properties on each card, with toggleable checkboxes and pills for lists and tags
-   A ⋯ menu with **Reply**, **Read aloud** (not implemented yet; shows a notice) and **Delete** (moves the note and all its replies to the trash; asks first when there are replies, otherwise only if Obsidian's "Confirm file deletion" is on)
-   Right-clicking a card title shows Obsidian's usual note menu, the same one internal links get
-   A virtualized feed (`@humanspeak/svelte-virtual-list`), so only nearby cards and editors exist and large Bases stay fast
-   Unit tests for the feed's pure logic (`bun run test`)
-   `dist/styles.css` built from `src/styles.css` and component styles
-   Tests for the reload script's worktree detection and success check
-   README section on working in a git worktree

### Changed

-   Plugin id `feed-view`, name "Feed View", author DecafDev, version 0.1.0, `minAppVersion` 1.15.1
-   License changed to MIT, © DecafDev
-   README rewritten for the plugin
-   esbuild resolves Svelte packages through the `svelte` export condition, and skips compiler warnings from `node_modules`
-   Builds in a git worktree now skip the reload, even when `OBSIDIAN_VAULT` is set. The vault links to the main checkout's `dist/`, so a reload from a worktree would have loaded the main checkout's files
-   The release workflow now uses `actions/checkout@v7`, `actions/setup-node@v7`, `oven-sh/setup-bun@v2` and `softprops/action-gh-release@v3`, installs with `--frozen-lockfile`, and fails if a release file is missing
-   The release workflow now grants itself `contents: write`, so the repository's Actions permissions no longer need changing
-   Node.js 22 or newer is now listed as required rather than recommended
-   The README symlink step now says to link the main checkout's `dist/`, never a worktree's
-   ESLint now ignores `.worktrees/`
-   The Live preview / Reading mode is now kept in the vault's local storage, per view and on this device only, instead of in the `.base` file (`feedMode` is no longer written)
-   Day headings always use the note's created time. The **Date property** view option is gone, and `dateProperty` in a `.base` file is ignored

### Fixed

-   A reload is only reported as successful when the Obsidian CLI prints `Reloaded:`. Previously any output that wasn't a known error, including none at all, counted as success
-   Reload errors written to stderr are now shown

### Removed

-   The sample plugin code (ribbon icon, status bar, sample modal, sample settings tab)

## 2026-11-22

### Changed

-   Updated dependencies: `svelte` 5.59, `obsidian` 1.14.4, `esbuild` 0.28.2, `tslib` 2.9.1, and the Svelte and ESLint tooling
-   `@codemirror/state` and `@codemirror/view` are now pinned to the versions `obsidian` 1.14.4 expects (6.7.6 and 6.43.13)

## 2026-09-06

### Added

-   Plugin reload after each successful build, through the official Obsidian CLI. Set `OBSIDIAN_VAULT` in a local `.env` (see `.env.example`) to enable it; builds carry on unchanged without it
-   `bun run reload` script for reloading the plugin without rebuilding
-   Credit to the official Obsidian sample plugin template in the README

### Changed

-   The README symlink step now recommends naming the folder under `.obsidian/plugins` after the `id` in `manifest.json`, which is what a reload targets
-   Simplified README language and reduced emoji usage

## 2025-05-09

### Added

-   Release section in the README, covering the Actions permissions needed and how to tag a version

### Fixed

-   Missing `fs` and `path` imports in `esbuild.config.mjs`

### Changed

-   README wording and spacing

## 2025-05-08

### Added

-   Initial Obsidian plugin starter template with Svelte support: esbuild config with `esbuild-svelte` and `svelte-preprocess`, `src/obsidian` and `src/svelte` source layout, and a GitHub Actions release workflow
