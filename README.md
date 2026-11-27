# Feed View

A **Feed** layout for [Obsidian Bases](https://help.obsidian.md/bases). Every note a Base returns appears as a card in one scrolling column. You can read and edit each card in place, cards are grouped by day, and you can reply to a note to start a thread.

Bases already has Table, Cards, List and Map layouts. They show note names and properties; to read or write a note's body you have to open it. Feed is for Bases you use as a stream: journals, daily logs, quick thoughts, meeting notes. You scroll through them like a timeline, add a thought in reply to an earlier one, and edit without leaving the view.

Everything stays in plain Markdown and frontmatter. Uninstall the plugin and your notes still read the same way.

---

## Features

-   **A Feed layout in Bases.** Pick **Feed** (newspaper icon) under _Configure view → Layout_. It works in any Base without setup. The Base toolbar is unchanged, and its Sort and Filter apply to the feed.
-   **One card per note.** Each card has a fold chevron, a title link (click to open the note; ⌘/Ctrl-click opens a new tab; hover shows Page preview), the note's properties, and its body.
-   **Edit in place.** In **Live preview** mode each card body is Obsidian's own Markdown editor. Edits save to the note. Edits made elsewhere (another pane, sync) show up in the card, and are merged with anything you're typing.
-   **Reading mode.** One switch above the first card shows every card read-only, as in Obsidian's Reading view.
-   **Fold notes.** Fold a single card (it then shows "N lines hidden"), or use **Collapse all / Expand all**. Folding a note also hides its replies.
-   **Fixed or full width.** Fixed width follows Obsidian's readable line length. Full width spans the view with 24px margins.
-   **Replies and threads.** Hover a card and click **Reply**, or use the ⋯ menu. A new reply note is created right away, shown indented under the original with a curved line, and focused so you can start typing in Live Preview. Threads are one level deep: replying to a reply adds to the same thread.
-   **Day headings.** Cards are grouped under TODAY, YESTERDAY, then the weekday and date (WEDNESDAY, NOVEMBER 25), with the year added for other years. A heading appears only where the day changes.
-   **Properties on the card.** The properties enabled in the Base's **Properties** menu appear between the title and the body, styled like Obsidian's. Checkboxes can be toggled from the card. Lists and tags show as pills.
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
| **Live preview \| Reading** | Edit every card in place, or show every card read-only. Saved with the view. |
| **Full width / Fixed width** | Switch between a centred column (readable line length) and the full width of the view. Saved with the view. |
| **Collapse all / Expand all** | Fold or unfold every card, replies included. Reads **Expand all** once every card is folded. |

### Cards

-   **Chevron** (left of the title): fold or unfold the card. A folded card shows only its title row and "N lines hidden" (non-blank lines of the body).
-   **Title**: opens the note. ⌘/Ctrl-click or middle-click opens it in a new tab.
-   **⋯** (right of the title, on hover): **Read aloud**, **Reply**, **Open as note** (opens it in a new tab).
-   **Reply** (bottom-left, on hover): creates a reply and puts your cursor in it.

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

Cards are filed under the day of the note's **created time**. To use a date property instead, open the view's options (_Configure view_) and set **Date property**.

If the Base has a sort, the feed uses it, and a heading appears wherever the day changes. If it has no sort, the newest notes come first. Replies always sit with the note they reply to, not under their own date. The Base's **Group by** setting has no effect on the feed; it always groups by day.

### Properties

Only the properties turned on in the Base's **Properties** menu are shown, in the Base's order. The note name isn't repeated, because it's the card title, and empty properties are left out. Checkbox properties can be toggled from the card; other properties are read-only for now.

---

## How your data is stored

Everything stays in ordinary notes and in the `.base` file.

**In notes:** a reply note has one extra frontmatter property:

```yaml
---
reply: "[[Original note]]"
---
```

`reply` always points at the thread's top note. Replies are found anywhere in the vault, so a reply still shows under its note even if the Base's filters would exclude the reply itself.

**In the `.base` file:** each Feed view stores its settings next to the view's other settings:

| Key | Values | Default |
| --- | --- | --- |
| `feedMode` | `live`, `reading` | `live` |
| `feedWidth` | `fixed`, `full` | `fixed` |
| `dateProperty` | any date property, e.g. `note.date` | created time |

**On this device only:** fold state is kept in the vault's local storage, keyed by the Base and view name. Folding never changes a file and isn't synced.

---

## Known limitations

-   **The editor relies on Obsidian internals.** Obsidian has no public API for putting an editable Live Preview editor inside a custom view. Feed View uses the same internal note-embed editor that Canvas cards and `![[note]]` embeds use. All of that code is in one file (`src/obsidian/internal/embeddedEditor.ts`), every internal it touches is checked first, and if any is missing the feed falls back to read-only cards and says so. A future Obsidian update could still change this. **We should look into better solutions**, for example a public editor API if Obsidian adds one, or a lighter editor bound to a file. Checked against Obsidian 1.15.1.
-   **Turning the plugin off or reloading it also relies on internals.** Bases keeps a layout's view running even after the plugin that made it is turned off. To stop old feeds running, Feed View rebuilds the tabs that show a feed when it unloads, and rebuilds them again when it loads, using `WorkspaceLeaf.rebuildView()` (`src/obsidian/internal/workspace.ts`). While the plugin is off, those tabs show Bases' "Unknown view type: feed-view".
-   **Read aloud isn't implemented yet.** The menu item only shows "This feature isn't implemented yet".
-   **Group by is ignored.** The feed always groups by day.
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
| Plugin | `src/main.ts` | Registers the `feed-view` Bases view and the reply index. |
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

-   [Bun](https://bun.sh/)
-   Node.js v22 (recommended)

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

4. In Obsidian, turn on the **Bases** core plugin and the **Feed View** community plugin.

### Scripts

| Command | What it does |
| --- | --- |
| `bun run dev` | Watch build into `dist/`, reloading the plugin after each build |
| `bun run build` | Type-check, then a production build |
| `bun run test` | Unit tests for `src/model/` (Bun's built-in test runner) |
| `bun run check` | `svelte-check` type checking for Svelte and TypeScript |
| `bun run lint` | ESLint, including Obsidian's plugin rules |
| `bun run reload` | Reload the plugin in Obsidian without rebuilding |

Before committing, run `bun run test`, `bun run check`, `bun run lint` and `bun run build`.

### Reloading after each build

Obsidian doesn't pick up new plugin files on its own. If the official [Obsidian CLI](https://obsidian.md/help/cli) is enabled, the build reloads the plugin for you.

1. Turn the CLI on in Obsidian under **Settings → General → Command line interface**, then follow the prompt to add it to your PATH. Check it with:

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

Every successful build now reloads the plugin in that vault. If the folder you linked into `.obsidian/plugins` isn't named `feed-view`, set `OBSIDIAN_PLUGIN_ID` in `.env` to match. Without a `.env` or the CLI, the build prints a short note once and carries on.

### Testing in Obsidian

Useful things to try in a development vault:

-   A Base with a few notes, some with checkbox and tag properties, switched to **Feed**.
-   Replies: click **Reply** (also while typing in another card) and check that the new card is scrolled to and focused. Also try a reply whose `reply` points at another reply, and a reply stored outside the Base's folder filter.
-   Reload or disable the plugin with a feed open: the feed should be rebuilt with the new code, or replaced by "Unknown view type" when disabled, and come back when re-enabled.
-   A large Base (about 1,000 notes) to check that scrolling stays smooth and that DevTools shows only a handful of `.cm-editor` elements.
-   Typing in a card while the same note is open in another tab.
-   Switching layout, closing the tab, or disabling the plugin right after typing. The text should still be saved.

### Releases

The included workflow builds the plugin and attaches `main.js`, `manifest.json` and `styles.css` to a GitHub release whenever you push a tag.

First, give the workflow permission to create releases:

1. Open the repository on GitHub
2. Go to **Settings → Actions → General**
3. Under **Workflow permissions**, select **Read and write permissions**
4. Click **Save**

Then tag a version that matches `manifest.json` and push it:

```bash
git tag 1.0.0
git push origin 1.0.0
```

---

## Credits

-   Interaction patterns (hover actions, threaded replies, day headings) adapted from the Ripple plugin, to fit Bases and ordinary Markdown notes.
-   Virtual scrolling by [`@humanspeak/svelte-virtual-list`](https://github.com/humanspeak/svelte-virtual-list) (MIT).
-   Built on the [obsidian-svelte-plugin-starter](https://github.com/decaf-dev/obsidian-svelte-plugin-starter) template, an extension of the official [Obsidian sample plugin](https://github.com/obsidianmd/obsidian-sample-plugin).

## License

[MIT](LICENSE) © DecafDev
