<img src=docs/logo.png width=60%>

# storyblox

UI component explorer for roblox-ts developers

<img src=docs/darktheme.png width=60%>
<img src=docs/lighttheme.png width=60%>

## Overview

Storyblox is a [Storybook](https://storybook.js.org)-like plugin that developers
can use to preview their UI. It works similaer to
[hoarcekat](https://github.com/Kampfkarren/hoarcekat) by Kampfkarren.

Release checks and the stop before npm or the Roblox Store are in `RELEASING.md`.

# How to use

### Installation

```
npm install @rbxts/storyblox
```

## Quickstart

1. Mount `<Storyblox />` in a Studio plugin or place UI.
2. Add `*.stories` modules under `ReplicatedStorage` (or pass `root` / `extension`).
3. Export `defineStory({ title, args, argTypes, render })` or a compatible story table.
4. Use the Controls pane to edit args; Favorites and inspector are in the shell chrome.

```tsx
import React from "@rbxts/react";
import { Storyblox } from "@rbxts/storyblox";

export function Plugin() {
	return <Storyblox />;
}
```

## Parity checklist

Storyblox is the catalog/test surface for Uiblox capability parity:

- [ ] Story title path unique; args + argTypes stay editable
- [ ] Controls cover common datatypes (string, number, boolean, enum, color, vector, UDim)
- [ ] Theme toggle themes chrome and the story
- [ ] Preview size presets / zoom / fit without breaking mount cleanup
- [ ] Actions log and interaction cases when a story declares them
- [ ] Capture helpers for window shots and `stateMatrix` gallery planning
- [ ] Dev fixtures never ship in the npm tarball (`pack:check`)

Release gates (no publish / Store upload without an explicit version) are in `RELEASING.md`.

### Example

Mount the `Storyblox` React component however/wherever you want and just pass in
the optional props for further customization.

```javascript
// root?: Instance;
//  default -> ReplicatedStorage
// extension?: `.${string}`;
//  default -> ".stories"
// primaryTheme?: Theme;
//  default -> DarkTheme from @rbxts/uiblox
// secondaryTheme?: Theme;
// default -> LightTheme from @rbxts/uiblox
// logoSrc?: string;
// default -> Storyblox logo assetId
<Storyblox />
```

Next, just start writing stories for your components! By default, it will look for
ModuleScripts in `ReplicatedStorage` whose names end in `.stories`, but you can change
this by passing in a `root?: Instance` prop to the `Storyblox` component. The loader
reads a `default` export with `title` and `template`, a function `(target, context) -> cleanup`,
or a table `{ renderer = "native", title = "...", mount = fn }`. `defineStory({ title, args, argTypes, render })` is the same kind of table: `controls.string()`, `controls.boolean()`, `controls.number()`, `controls.enum()`, `controls.radio()`, and `controls.slider()` describe args, and a present value has to match. A missing arg is not the same as `false` or `0`. Optional controls can clear back to missing. Invalid number text stays in the field and is not written into args. The controls pane edits color, vector, UDim, UDim2, enum, asset, and CFrame values. Color and vectors are comma-separated numbers. A value that does not parse shows the reason and is not written into args. Objects, dictionaries, arrays, and unions patch a copy of the value. Functions, instances, and bindings stay read-only. Story actions are a capped in-memory log with reset. Setup cleanup still runs when setup throws. Decorators wrap the story from the outside in. A story preview width and height is the logical size. `preset = "phone"`, `"tablet"`, `"desktop"`, or `"console"` picks a size, and an explicit width and height win. Fit scales that into the dock. 100% keeps the scale at 1. Stories without a declared size use the dock size for the grid, and Fit and 100% match until zoom changes the scale. A preview background paints a declared box, and a bounds stroke outlines it. Grid draws theme-aware 8px lines behind the story. Zoom steps that scale by 50, 100, and 200 percent. The chrome theme toggle also themes the story. A viewport preview hosts the camera and the scene. Dragging across the scene turns the camera. Story `tools` (a list or a host callback) render in a secondary bar under the chrome tools; 3D/Camera puts Orbit and Cam reset there. Stories without tools keep a single chrome bar. Other shapes are skipped.
Star on the canvas marks the selected story. Those stories list under Favorites, and the dev plugin keeps that list in the favorites setting. Setting `storyblox-favorite` to a title toggles it. Below 760px the shell uses Stories and Canvas tabs instead of the side-by-side split. `storyblox-pane` is `stories`, `canvas`, or `inspector`. The inspector lists the story title, renderer, language, module path, description, and arg names. `node scripts/capture-window.mjs [name]` writes `captures/<name>.png` and a json manifest from the Storyblox Studio window. The backend is `studio-window`. The png is the whole window, so it is gitignored. `node scripts/capture-diff.mjs baseline.png actual.png` prints how many BMP bytes differ and exits 1 when they do. `--update` copies the actual shot over the baseline on purpose. `node scripts/state-gallery.mjs` reads Uiblox `stateMatrix` and writes `captures/gallery.json`, split into `editRows` and `playRows`. Edit captures only the rest rows; hover, press, and focus require a real pointer in Play. `node scripts/viewport-gallery.mjs <name> --status <json>` requires fresh story, theme, ready, error, and layout stats from the viewport harness before writing under `../storyblox-assets/captures`. `STORYBLOX_CAPTURES` overrides that destination. On a wide dock it sits to the right of the canvas. On a narrow dock it is the third tab.
A story `description` shows above its controls. Each control is labelled with its name, control kind, whether it is optional, its default from `args`, and its `description`.
A story `cases` table holds named interaction cases. Each case starts from the default args and gets `find`, `args`, `setArg`, `wait`, a `clock` with `after` and `advance`, a seeded `random`, and `expect`. Setting the `storyblox-case` attribute on the stories root runs one, and `storyblox-case-result` holds the JSON result with at most 16 failures.
For automation, write a JSON request to the `storyblox-request` attribute on the stories root. The reply is written to `storyblox-response`. A request has `protocolVersion = 1`, a `requestId`, a `command`, and an optional `payload`. The commands are `getStatus`, `listStories`, `selectStory`, `setArgs`, `resetArgs`, `runCase`, and `getCaptureBounds`. Commands that act on the mounted story need the `expectedGeneration` from `getStatus`. They can also pass a `storyId`, and a mismatch on either one returns `stale`. `setArgs` accepts up to 64 string, number, or boolean values. A case that does not finish within 10 seconds replies `timeout`, and switching or remounting the story replies `cancelled`. Send one request at a time. Nothing in the bridge runs arbitrary code.
The dev plugin adds "Storyblox: Focus search" and "Storyblox: Remount story" actions. Bind keys to them in Studio's shortcut settings.
Native mounts get `context.theme`, `context.args`, and `context.target`. With `preview = { kind = "viewport" }` they also get `context.sceneRoot` and `context.camera`, and leaving the story destroys both. `preview = { kind = "workspace" }` is off until "Storyblox: Allow workspace preview" is run, and until then the canvas shows a notice. After that, `context.sceneRoot` is a `StorybloxPreview` folder in Workspace marked `storyblox-owned`, and `context.camera` is the Studio camera. Leaving the story, a mount error, or unloading destroys only that folder and restores the camera's CFrame, Focus, CameraType, and FieldOfView. While it is mounted, the place shows as changed. `own`, `connect`, and `onCleanup` register cleanup that still runs if `mount` throws. A returned function remounts when args or the theme change. `{ update = fn }` applies the next args on the same instances. Refresh remounts either way. Functions on the args table stay functions. A framework adapter is a function that returns `mount` and owns its `update` and `destroy`. See `fixtures/adapter`. Storyblox does not ship Fusion or Vide adapters. Luau stories can require compiled TS modules, and TS stories can import a `.luau` module that has a `.d.ts` file next to it. A story that fails to load is dropped from the tree with a warning that names the module.

Here are some example stories:

#### TreeView.stories.tsx

Every story can be passed props (optional) if the component itself has a Props
interface. These props are passed to the `story.template` method when rendering
the story.

You should name your stories in the syntax `<component_name>/<story_name>`>.
There can only be one story per title (they must be unique). A later module with
the same title replaces the earlier one.

```javascript
import React from '@rbxts/react';
import { Story } from '@rbxts/storyblox';
import { TreeView, TreeViewProps } from '@rbxts/uiblox';

const template = (props: TreeViewProps) => <TreeView {...props} />;

export const story: Story<TreeViewProps> = {
  title: 'TreeView/Base',
  component: TreeView,
  template,
  props: {
    tree: {
      title: 'Sample Tree',
      branches: [
        {
          title: 'Branch 1',
          leaves: [
            {
              title: 'Leaf 1',
            },
            {
              title: 'Leaf 2',
            },
          ],
        },
        {
          title: 'Branch 2',
          leaves: [
            {
              title: 'Leaf 3',
            },
            {
              title: 'Leaf 4',
            },
          ],
        },
        {
          title: 'Branch 3',
          leaves: []
        },
        {
          title: 'Branch 4',
          leaves: [
            {
              title: 'Leaf 5',
            },
          ],
        },
        {
          title: 'Branch 5',
          leaves: [
            {
              title: 'Leaf 6',
            },
            {
              title: 'Leaf 7',
            },
            {
              title: 'Leaf 8',
            },
            {
              title: 'Leaf 9',
            }
          ],
        },
        {
          title: 'Branch 6',
          leaves: []
        }
      ],
    },
  }
};

export default story;
```

#### ProgressBar.stories.tsx

You can also return a tuple from the `story.template` method which will be
called when the story template unmounts. This can be used to clean-up or
disconnect any event listeners used by your story.

```javascript
import Maid from '@rbxts/maid';
import React, { useState } from '@rbxts/react';
import { Lighting, RunService } from '@rbxts/services';
import { ProgressBar } from '@rbxts/uiblox';
import { ProgressBarProps } from '@rbxts/uiblox/out/ui/packages/progressBar/components/ProgressBar';
import { Story, StoryCallback, StoryElement } from '@rbxts/storyblox';
import useProgressBarStyles from './ProgressBar.styles';

const template = (props: ProgressBarProps) => {
  const maid = new Maid(); // Maid to do cleaning once we are done

  // Use IntValue so that React will re-render when the value changes / listen
  // to lifecycle events
  const progressValue = new Instance("IntValue");
  progressValue.Name = "ProgressValue";
  progressValue.Parent = Lighting;
  maid.GiveTask(progressValue);

  progressValue.Value = props.progress;
  let step = 0;
  const INTERVAL = 250;
  const stepper = (secondsSinceLastFrame: number) => {
    const milliseconds = math.ceil(secondsSinceLastFrame * 1000);
    step += milliseconds;

    if (step < INTERVAL) {
      return;
    }

    const { Value } = progressValue;
    const addedProgress = math.max(1, math.random() * 10);
    const newProgress = math.round(Value + addedProgress);

    if (newProgress <= 100) {
      progressValue.Value = newProgress;
    }
    else {
      progressValue.Value = 0;
    }

    step = 0;
  };

  maid.GiveTask(RunService.Heartbeat.Connect(stepper));

  function MyComponent({ progress }: ProgressBarProps) {
    const { container, progressBar, label } = useProgressBarStyles();

    const [percentage, setPercentage] = useState<number>(progress);

    maid.GiveTask(progressValue.GetPropertyChangedSignal("Value").Connect(() => {
      if (progressValue) {
        try {
          setPercentage(progressValue.Value);
        }
        catch {
          // Component is unmounting. Do nothing.
        }
      }
    }));

    return (
      <frame
        key={"Container"}
        {...container}>
        <textlabel
          {...label}
          Text={`Loading resources... ${percentage || 0}%`} />
        <ProgressBar className={progressBar} progress={percentage || 0} />
      </frame>
    )
  }

  const callback = () => {
    maid.DoCleaning();
  }

  const component = <MyComponent {...props} />;
  return [component, callback] as LuaTuple<[StoryElement, StoryCallback]>;
};

export const story: Story<ProgressBarProps> = {
  title: 'ProgressBar/Base',
  component: ProgressBar,
  template,
  props: {
    progress: 0, // This prop is just because its not an optional field
  }
};

export default story;
```

#### MyComponent.stories.tsx

If your component does not extend from a props interface, you can omit them from
the story.

```javascript
import React from '@rbxts/react';
import { Story } from '@rbxts/storyblox';
import { MyComponent } from './MyComponent';

const template = () => <MyComponent />;

export const story: Story = { // Notice now it is not Story<TProps>
  title: 'MyComponent/Base',
  component: MyComponent,
  template,
  }
};

export default story;
```

# Try it out

See it in action in the pre-release version's test game [Storyblox Pre-Release Experience](https://www.roblox.com/games/9159382473)
