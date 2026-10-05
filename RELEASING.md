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

Dev plugin uses published `@rbxts/uiblox@0.2.0-alpha.3` (`next`). `latest` stays `0.1.53`. `node scripts/state-gallery.mjs` can still read `stateMatrix` from a sibling uiblox checkout.
