# Releasing

Current package version is `0.1.59`. Do not publish, and do not upload a plugin to the Roblox Store, until Brandon names the version and the artifact.

## Check

```
pnpm test
pnpm pack:check
pnpm plugin:fixtures
```

`pack:check` builds, packs a tarball, and compiles a consumer. It does not publish.

## Local plugin

```
pnpm plugin:install:local
```

That writes `~/Documents/Roblox/Plugins/storyblox-plugin.rbxm`. The shell loads `ServerStorage.StorybloxPlugin`.

## Not this step

- `npm publish`
- A Roblox Store upload
- A version bump

Uiblox `0.1.53` (`0519a3d`) is installed from a local tarball for the dev plugin only. That path is not committed. `node scripts/state-gallery.mjs` reads `stateMatrix` from the sibling uiblox checkout.
