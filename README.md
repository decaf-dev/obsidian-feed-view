# Feed View

A **Feed** layout for [Obsidian Bases](https://help.obsidian.md/bases). Every note a Base returns appears as a card in one scrolling column. You can read and edit each card in place, cards are grouped by day, and you can reply to a note to start a thread.

Bases already has Table, Cards, List and Map layouts. They show note names and properties; to read or write a note's body you have to open it. Feed is for Bases you use as a stream: journals, daily logs, quick thoughts, meeting notes. You scroll through them like a timeline, add a thought in reply to an earlier one, and edit without leaving the view.

Everything stays in plain Markdown and frontmatter. Uninstall the plugin and your notes still read the same way.

---

## Features

-   **A Feed layout in Bases.** Pick **Feed** (newspaper icon) under _Configure view → Layout_. It works in any Base without setup. The Base toolbar is unchanged, and its Sort and Filter apply to the feed.
-   **One card per note.** Each card has a fold chevron, a title link (click to open the note; ⌘/Ctrl-click opens a new tab; hover shows Page preview), the note's properties, and its body.
-   **Edit in place.** In **Live preview** mode each card body is Obsidian's own Markdown editor. Edits save to the note. Edits made elsewhere (another pane, sync) show up in the card, and are merged with anything you're typing.
-   **Reading mode.** One switch above the first card shows every card read-only, as in Obsidian's Reading view. Feeds open in Live preview, or in Reading mode if you pick that as the **Default mode** in the settings.
-   **Fold notes.** Fold a single card (it then shows "N lines hidden"), or use **Collapse all / Expand all**. Folding a note also hides its replies.
-   **Default, full or custom width.** Default follows Obsidian's readable line length. Full width spans the view with 24px margins. Custom width uses a percentage of the view that you pick with a slider. Choose it once, for every feed, in the plugin's settings.
-   **Replies and threads.** Hover a card and click **Reply**, or use the ⋯ menu. A new reply note is created right away, shown indented under the original with a curved line, and focused so you can start typing in Live Preview. Threads are one level deep: replying to a reply adds to the same thread. In the settings, turn **Reply buttons** off to hide Reply everywhere, or **Show replies on threads** off to hide replies from the feed.
-   **Day headings.** Cards are grouped under TODAY, YESTERDAY, then the weekday and date (WEDNESDAY, NOVEMBER 25), with the year added for other years. A heading appears only where the day changes. They can be turned off in the settings.
-   **A timestamp on each card.** The time the note was created (3:42 PM) shows at the right of the title; hover it for the full date. It can be turned off in the settings.
-   **Properties on the card.** The properties enabled in the Base's **Properties** menu appear between the title and the body, styled like Obsidian's. Checkboxes can be toggled from the card. Lists and tags show as pills. They can be turned off with **Show frontmatter** in the settings.
-   **Fast with large Bases.** The feed is virtualized: only the cards near the screen exist, so a Base with thousands of notes opens and scrolls quickly.
-   **Follows your theme**, including dark mode.

---

## Requirements

-   Obsidian **1.15.1** or newer
-   The **Bases** core plugin turned on (_Settings → Core plugins → Bases_)

The plugin is marked as working on mobile, but this first version is designed for desktop.

---

## Installation

Feed View isn't in the community plugin directory yet. To install it by hand:

1. Download `main.js`, `manifest.json` and `styles.css` from the latest [release](https://github.com/decaf-dev/obsidian-feed-view/releases).
2. Put them in `<your vault>/.obsidian/plugins/feed-view/`.
3. Reload Obsidian, then turn on **Feed View** under _Settings → Community plugins_.

You can also install it with [BRAT](https://github.com/TfTHacker/obsidian42-brat) using the repository `decaf-dev/obsidian-feed-view`.

---

## Using the feed

### Switch a Base to the feed

Open a Base, click the layout name in the Base toolbar (for example **Table**), and choose **Feed**. Each view of a Base keeps its own layout, so you can keep a Table view and add a Feed view alongside it.

### The feed bar

The bar above the first card holds the feed's own controls:

| Control | What it does |
| --- | --- |
| **Live preview \| Reading** | Edit every card in place, or show every card read-only. A feed opens in the **Default mode** from the settings, and your choice lasts until you close it. |
| **Collapse all / Expand all** | Fold or unfold every card, replies included. Reads **Expand all** once every card is folded. |

### Cards

-   **Chevron** (left of the title): fold or unfold the card. A folded card shows only its title row and "N lines hidden" (non-blank lines of the body).
-   **Title**: opens the note. ⌘/Ctrl-click or middle-click opens it in a new tab. Right-click shows Obsidian's usual note menu (Open in new tab, Duplicate, Move file to…, Rename…, Delete and so on).
-   **Timestamp** (right of the title): when the note was created, from the file's created time. Hover it for the full date. Hidden when **Show timestamp** is off.
-   **⋯** (right of the title, on hover): **Reply**, **Read aloud**, **Delete** (moves the note and all its replies to the trash; asks first when there are replies, otherwise only if "Confirm file deletion" is on).
-   **Reply** (bottom-left, on hover): creates a reply and puts your cursor in it.

When **Reply buttons** or **Show replies on threads** is off, neither the Reply button nor **⋯ → Reply** is shown.

Your fold state is remembered for each note, separately in each view, on this device.

### Replies

Click **Reply** (or **⋯ → Reply**) and a new note is created straight away:

-   in the same folder as the original note,
-   named like Obsidian's new notes (`Untitled`, `Untitled 1`, …),
-   with one property, `reply`, linking to the original note, and an empty body.

The feed scrolls to the new reply's card at the end of the thread and focuses its editor with the cursor in the body, so you can start typing at once. It's a normal Live Preview editor and saves as you type. In Reading mode, the new reply still opens in an editor so you can write it.

Replies appear as indented cards under the original note, oldest first. A reply is never shown again as a separate top-level card. If the original note is folded, replying unfolds it.

Like any new note in Obsidian, a reply you don't type anything into stays as an empty note. Delete it as you would any other note.

### Day headings and order

Cards are filed under the day of the note's **created time**, as Obsidian reports it for the file.

If the Base has a sort, the feed uses it, and a heading appears wherever the day changes. If it has no sort, the newest notes come first. Replies always sit with the note they reply to, not under their own date. The Base's **Group by** setting has no effect on the feed; it always groups by day.

With **Day headings** off, the feed keeps the same order but shows no headings.

### Properties

Only the properties turned on in the Base's **Properties** menu are shown, in the Base's order, and only while **Show frontmatter** is on in the settings. A new Feed view starts with none turned on, so its cards show no properties until you pick some there. Frontmatter is never shown in the card body, so a property that isn't turned on doesn't appear anywhere on the card. The note name isn't repeated, because it's the card title, and empty properties are left out. Checkbox properties can be toggled from the card; other properties are read-only for now.

### Settings

Open _Settings → Feed View_ (under _Community plugins_). The settings are in two sections.

**Features**

| Setting | What it does |
| --- | --- |
| **Default mode** | **Live preview** (default) or **Reading**: the mode every feed opens in. Switching modes in a feed lasts until you close it, then the next feed you open starts in this mode again. Changing it doesn't switch feeds that are already open. |
| **Day headings** | On (default): cards are grouped under a heading for each day. Off: no headings, same order. |
| **Show replies on threads** | On (default): replies show indented under the note they reply to. Off: replies are hidden, and only the original notes are shown. Reply notes never appear as top-level cards either way. |
| **Reply buttons** | On (default): **Reply** shows on cards and in the ⋯ menu. Off: both are hidden. Existing replies still show in their threads. Only shown while **Show replies on threads** is on. |
| **Show timestamp** | On (default): each card shows the time its note was created, from the file's created time. |
| **Show frontmatter** | On (default): each card shows the note's properties between the title and the body. Only the properties turned on in the Base's **Properties** menu are shown, so you still need to turn them on there. Off: no properties on any card. |

**Styling**

| Setting | What it does |
| --- | --- |
| **Width** | **Default**: cards sit in a centred column at Obsidian's readable line length. **Full width**: cards span the full width of the view. **Custom width**: cards use a percentage of the view's width, set with the slider below. |
| **Custom width** | Only shown when Width is **Custom width**. A slider from 25% to 100% of the view, in steps of 5%. Default 100%, the same as full width. |

Settings apply to every feed, and open feeds update straight away (except **Default mode**, which applies the next time a feed opens).

---

## How your data is stored

Feed View never writes to your `.base` files. Each kind of data has one place:

| What | Where |
| --- | --- |
| Reply links | the reply note's frontmatter |
| Anything per Base or per view (fold state) | the vault's local storage, on this device |
| Plugin-wide settings | the plugin's `data.json` |
| Filters, sort, visible properties | the `.base` file, saved by Bases itself |

**In notes:** a reply note has one extra frontmatter property:

```yaml
---
reply: "[[Original note]]"
---
```

`reply` always points at the thread's top note. Replies are found anywhere in the vault, so a reply still shows under its note even if the Base's filters would exclude the reply itself.

**In the `.base` file:** nothing from Feed View. The feed reads the Base's sort, visible properties and view name, but never adds its own keys.

**On this device only:** fold state (which notes are folded; none by default) is kept in the vault's local storage, keyed by the Base and view name. Folding never changes a file and isn't synced.

**Not stored:** switching between Live preview and Reading in a feed. It lasts until the feed is closed.

**In the plugin's `data.json`:** plugin-wide settings: `defaultMode` (`live` or `reading`; default `live`), `width` (`default`, `full` or `custom`; default `default`), `customWidth` (percent, 25–100, default `100`), `dayHeadings`, `showReplies`, `replyButtons`, `showTimestamp` and `showFrontmatter` (each default `true`). Like other plugin settings, it syncs if you sync your plugin folder.

---

## Known limitations

-   **The editor relies on Obsidian internals.** Obsidian has no public API for putting an editable Live Preview editor inside a custom view. Feed View uses the same internal note-embed editor that Canvas cards and `![[note]]` embeds use. All of that code is in one file (`src/obsidian/internal/embeddedEditor.ts`), every internal it touches is checked first, and if any is missing the feed falls back to read-only cards and says so. A future Obsidian update could still change this. **We should look into better solutions**, for example a public editor API if Obsidian adds one, or a lighter editor bound to a file. Checked against Obsidian 1.15.1.
-   **Turning the plugin off or reloading it also relies on internals.** Bases keeps a layout's view running even after the plugin that made it is turned off. To stop old feeds running, Feed View rebuilds the tabs that show a feed when it unloads, and rebuilds them again when it loads, using `WorkspaceLeaf.rebuildView()` (`src/obsidian/internal/workspace.ts`). While the plugin is off, those tabs show Bases' "Unknown view type: feed-view".
-   **Read aloud isn't implemented yet.** The menu item only shows "This feature isn't implemented yet".
-   **Group by is ignored.** The feed always groups by day.
-   **Day headings use the file's created time.** Anything that recreates the file, such as cloning the vault with git or copying it to another machine, can reset it, and those notes then show under the day they arrived.
-   **Replies the Base doesn't return** show their note properties from frontmatter, but not formula properties.
-   **Replies whose link doesn't resolve are hidden.** This happens if the original note is deleted, or renamed while _Automatically update internal links_ is off. The replies themselves are untouched and reappear when the link works again.
-   **New reply notes are always named `Untitled…`**, in English.
-   **Updates wait while you type.** While a card's editor has focus, changes from the Base (a new sort order, new notes) are held back and applied when you leave the editor. This stops the card you're typing in from moving.
-   **Undo history** survives a card scrolling away and back only for the most recently edited notes (Obsidian keeps undo history for about 20 files).
-   **Fast scrolling can log** `ResizeObserver loop completed with undelivered notifications` in the developer console. It comes from the virtual list's row measuring and is harmless.
-   **A feed embedded in a note** (`![[My base.base]]`) gets a fixed height (70% of the window) and scrolls inside it.

---

## How it works

| Part | Where | What it does |
| --- | --- | --- |
| Plugin | `src/main.ts` | Registers the `feed-view` Bases view, the reply index and the settings tab. |
| Settings | `src/settings.ts` | The plugin-wide settings and their tab, using Obsidian's declarative settings API. |
| Bases view | `src/obsidian/FeedBasesView.ts` | Turns Base results into threads and rows on every data update, and handles actions (fold, reply, menu). |
| Reply index | `src/obsidian/ReplyIndex.ts` | A vault-wide map of `reply` links, kept up to date from the metadata cache. |
| Card bodies | `src/obsidian/bodies/` | Mounts an editor or a Reading view render into each visible card, one per frame. |
| Internals | `src/obsidian/internal/` | The only files that use undocumented Obsidian APIs: the embedded editor and tab rebuilding (see above). |
| UI | `src/svelte/` | Svelte 5 components: feed bar, cards, properties. |
| Pure logic | `src/model/` | Day labels, threading, ordering, rows, folds, `Untitled` naming. No Obsidian imports, unit-tested. |
| Styles | `src/styles.css` | All styles, using Obsidian's CSS variables. |

The feed is a keyed virtual list ([`@humanspeak/svelte-virtual-list`](https://github.com/humanspeak/svelte-virtual-list)). Each day heading, card and reply is one row. Only the rows near the viewport are in the DOM, with a small buffer. A card's editor is created when its row scrolls into view and saved and destroyed when it scrolls away. The list measures each row and keeps the visible content in place when something above it changes height (folding, editing, a new reply). In testing with 1,000 notes, the feed opened in about 130 ms, kept about 10 rows and at most 9 editors alive, and scrolled at 60 fps.

---

## Development

Built with [Svelte 5](https://svelte.dev), bundled by [esbuild](https://esbuild.github.io/), and managed with [Bun](https://bun.sh/).

### Requirements

-   [Bun](https://bun.sh/): installs dependencies and runs the build scripts
-   Node.js 22 or newer: runs the build and reload scripts

### Getting started

1. Install dependencies:

    ```bash
    bun install
    ```

2. Start a watch build. It compiles into `dist/` (`main.js`, `manifest.json`, `styles.css`) and rebuilds whenever you save:

    ```bash
    bun run dev
    ```

3. Link `dist/` into a development vault, using the plugin id `feed-view` as the folder name:

    ```bash
    ln -s /path/to/obsidian-feed-view/dist /path/to/your/vault/.obsidian/plugins/feed-view
    ```

    Always link the **main checkout's** `dist/`, never a git worktree's. A worktree's `dist/` is deleted along with the worktree, which leaves the link dangling.

4. In Obsidian, turn on the **Bases** core plugin and the **Feed View** community plugin.

### Scripts

| Command | What it does |
| --- | --- |
| `bun run dev` | Watch build into `dist/`, reloading the plugin after each build |
| `bun run build` | Type-check, then a production build |
| `bun run test` | Unit tests for `src/model/` and the reload script (Bun's built-in test runner) |
| `bun run check` | `svelte-check` type checking for Svelte and TypeScript |
| `bun run lint` | ESLint, including Obsidian's plugin rules |
| `bun run reload` | Reload the plugin in Obsidian without rebuilding |

Before committing, run `bun run test`, `bun run check`, `bun run lint` and `bun run build`.

### Reloading after each build

Obsidian doesn't pick up new plugin files on its own. If the official [Obsidian CLI](https://obsidian.md/help/cli) is enabled, the build reloads the plugin for you.

1. Turn the CLI on in Obsidian under **Settings → General → Command line interface** (needs the 1.12.7 installer or newer), then follow the prompt to add it to your PATH. Check it with:

    ```bash
    obsidian version
    ```

2. Copy the example env file and set the vault you develop against:

    ```bash
    cp .env.example .env
    ```

    ```bash
    OBSIDIAN_VAULT=obsidian-development
    ```

    Run `obsidian vaults` to list the vault names Obsidian knows about.

Every successful build now reloads the plugin in that vault. If the folder you linked into `.obsidian/plugins` isn't named `feed-view`, set `OBSIDIAN_PLUGIN_ID` in `.env` to match. Without a `.env` or the CLI, the build prints a short note once and carries on. The CLI starts Obsidian if it isn't already running.

#### Working in a git worktree

Your vault links to the main checkout's `dist/`, so a reload from a worktree would load the main checkout's files, not the worktree's. Builds in a worktree therefore skip the reload. To try a worktree build in Obsidian:

1. Stop any `bun run dev` watch running in the main checkout, or its next rebuild will overwrite the files you copy in.
2. Copy `dist/main.js`, `dist/manifest.json` and `dist/styles.css` from the worktree into the main checkout's `dist/`.
3. Run `bun run reload` from the main checkout.

When you're done, rebuild in the main checkout to switch back.

### Testing in Obsidian

Useful things to try in a development vault:

-   A Base with a few notes, some with checkbox and tag properties, switched to **Feed**.
-   Replies: click **Reply** (also while typing in another card) and check that the new card is scrolled to and focused. Also try a reply whose `reply` points at another reply, and a reply stored outside the Base's folder filter.
-   Reload or disable the plugin with a feed open: the feed should be rebuilt with the new code, or replaced by "Unknown view type" when disabled, and come back when re-enabled.
-   A large Base (about 1,000 notes) to check that scrolling stays smooth and that DevTools shows only a handful of `.cm-editor` elements.
-   Typing in a card while the same note is open in another tab.
-   Switching layout, closing the tab, or disabling the plugin right after typing. The text should still be saved.

### Releases

The included workflow builds the plugin and attaches `main.js`, `manifest.json` and `styles.css` to a GitHub release whenever you push a tag. It requests the `contents: write` permission itself, so you don't need to change the repository's Actions settings.

Tag a version that matches `manifest.json` and push it:

```bash
git tag 0.1.0
git push origin 0.1.0
```

---

## Credits

-   Interaction patterns (hover actions, threaded replies, day headings) adapted from the Ripple plugin, to fit Bases and ordinary Markdown notes.
-   Virtual scrolling by [`@humanspeak/svelte-virtual-list`](https://github.com/humanspeak/svelte-virtual-list) (MIT).
-   Built on the [obsidian-svelte-plugin-starter](https://github.com/decaf-dev/obsidian-svelte-plugin-starter) template, an extension of the official [Obsidian sample plugin](https://github.com/obsidianmd/obsidian-sample-plugin).

## License

[MIT](LICENSE) © DecafDev
