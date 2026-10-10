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

That builds an rbxm into your local Studio plugins folder. The shell loads `ServerStorage.StorybloxPlugin` with fixtures.

## Store rbxm

```
pnpm plugin:release
```

Writes `dist/storyblox.rbxm` (no fixtures) and `dist/StorybloxRelease.rbxm`.

`StorybloxRelease` is the copy to publish. Root name `StorybloxRelease`, attribute `Version` from package.json, RunContext Plugin so it does not run in the place. Insert that model under `ReplicatedStorage` and replace the old one. Right-click it and use Publish as Plugin. The dev plugin does not load it.

Does not publish.
