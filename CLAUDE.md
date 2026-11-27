# Feed View

## Where data is stored

**Never write to a `.base` file.** Don't call `this.config.set(...)`, and don't add
options to the Bases view registration (`options` in `registerBasesView`), because Bases
saves those options into the `.base` file. Reading Bases' own config (sort, property order,
display names, view name) is fine.

Put each new piece of state in one of these places:

| State | Where | Code |
| --- | --- | --- |
| Per Base or per view (fold state) | the vault's local storage, via `app.loadLocalStorage` / `app.saveLocalStorage`, keyed by Base and view name | `src/obsidian/foldStore.ts` |
| Plugin-wide (default mode, width, day headings, show replies, reply buttons, show timestamp) | the plugin's `data.json`, shown in the settings tab | `src/settings.ts` |
| Reply links | the reply note's frontmatter (`reply`) | `src/obsidian/replies.ts` |

When adding a per-view setting, store it the way `src/obsidian/foldStore.ts` does, with the
parsing in `src/model/` so it can be unit tested.
When adding a plugin-wide setting, add it to `FeedViewSettings` and the tab in
`src/settings.ts`. Either way, update "How your data is stored" in the README.
