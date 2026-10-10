# storyblox

UI component explorer for roblox-ts. Package `@rbxts/storyblox`.

## Layout

- `src` is the library: packages, interfaces, constants, and fixtures.
- `plugin/shell` is the dev plugin. `plugin/shell-release` is the store plugin. `plugin/host` is the module the shell requires.
- `plugin/plugin.project.json` syncs the dev place: `ServerStorage.StorybloxPlugin` plus fixtures.
- `plugin/release.project.json` is the store build. No fixtures.
- `scripts` holds the checks and the release build.

## Dev loop

`storyblox-plugin.rbxm` lives in your local Studio plugins folder. `pnpm plugin:install:local` writes it.

The dev plugin loads `ServerStorage.StorybloxPlugin` and clones it to `StorybloxPlugin_loaded`. Require stories from that clone only. Two copies of React show up as a nil dispatcher or an invalid hook call.

Reload remounts stories. The toolbar button does not. Restart Studio to see a new toolbar icon.

Sync a changed module together with everything it imports, in one batch. A half-synced module crashes the Template.

## Release copy

`pnpm plugin:release` writes `dist/storyblox.rbxm` and `dist/StorybloxRelease.rbxm`. Same store build, no fixtures.

`StorybloxRelease` is one instance: that name, attribute `Version` from package.json, RunContext Plugin so it does not run in the place. Insert `dist/StorybloxRelease.rbxm` under `ReplicatedStorage` and replace the old one. Right-click it and use Publish as Plugin. The dev plugin never loads it. The shell only clones `ServerStorage.StorybloxPlugin`.

Store icon: `rbxassetid://100703482666040`. Listing assets live in gitignored `dist/release/listing/`.

## Verifying UI

Only `StarterGui.StorybloxViewport` plus a Studio screen capture counts. Dock widgets can't be captured.

Chrome stories: `Chrome/Sidebar`, `Chrome/Toolbar`, `Chrome/Inspector`, `Chrome/Controls`. Settings: `Shell/Settings`.

Hover and press can't be triggered in Edit mode.

## Studio

One person owns Studio at a time. If your agent has Studio automation tools, check Studio state before and after each small batch, and stop on the first timeout.

Never mass-require all stories in one script. It hung Studio.

No multi-MB scripts, no clear loops, no leftover loader plugins.

Free port 8765 when done.

Never touch `RojoManagedPlugin.rbxm` in the local plugins folder.

## Commands

- `pnpm test` runs the checks, including error containment, no internal refs, control types, method calls, and dock info
- `pnpm build`
- `pnpm pack:check`
- `pnpm plugin:release`
- `pnpm plugin:fixtures`

## React

Bundled React is 17.2.1. No transition API.

Bare `.map()` arrays next to siblings must be Fragment-wrapped.

Use colon calls on Roblox APIs (`GetService`, `FindFirstChild`, `IsA`, `GetEnumItems`).

`DockWidgetPluginGuiInfo` fields are constructor-only.

Never `wait()` inside a React effect. Use a cancellable task.

## uiblox

The plugin bundles published `@rbxts/uiblox`. Library changes show up here only after a publish and a dependency bump.

## Ship

Small PRs to the default branch. Merge only on green CI.

Subject-only commits. No trailers.

No username in branch names.

Publish to npm only under the `next` tag, with an npm token in your environment. Never print tokens or API keys.

Never mention other UI products or company libraries in tracked files.
