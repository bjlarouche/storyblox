# Releasing

Don't publish to npm or upload a plugin to the Roblox Store until a version is named on purpose.

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

That builds an rbxm into your Roblox Plugins folder (`$HOME/Documents/Roblox/Plugins` on macOS). The shell loads `ServerStorage.StorybloxPlugin` with fixtures.

## Store rbxm

```
pnpm plugin:release
```

Writes `dist/storyblox.rbxm` (no fixtures). Does not publish.
