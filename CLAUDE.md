# Feed View

## Where data is stored

**Never write to a `.base` file.** Don't call `this.config.set(...)`, and don't add
options to the Bases view registration (`options` in `registerBasesView`), because Bases
saves those options into the `.base` file. Reading Bases' own config (sort, property order,
display names, view name) is fine.

Put each new piece of state in one of these places:

| State | Where | Code |
| --- | --- | --- |
| Per Base or per view (fold state, Live preview / Reading mode) | the vault's local storage, via `app.loadLocalStorage` / `app.saveLocalStorage`, keyed by Base and view name | `src/obsidian/settingsStore.ts`, `src/obsidian/foldStore.ts` |
| Plugin-wide (width, day headings, show replies, reply buttons, show timestamp) | the plugin's `data.json`, shown in the settings tab | `src/settings.ts` |
| Reply links | the reply note's frontmatter (`reply`) | `src/obsidian/replies.ts` |

When adding a per-view setting, add it to `ViewSettings` in `src/model/viewSettings.ts`.
When adding a plugin-wide setting, add it to `FeedViewSettings` and the tab in
`src/settings.ts`. Either way, update "How your data is stored" in the README.
