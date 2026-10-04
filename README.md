<img src=docs/logo.png width=60%>

# storyblox

> This package is a work in progress.

UI component explorer for roblox-ts developers

<img src=docs/darktheme.png width=60%>
<img src=docs/lighttheme.png width=60%>

## Overview

Storyblox is a [Storybook](https://storybook.js.org)-like plugin that developers
can use to preview their UI. It works similaer to
[hoarcekat](https://github.com/Kampfkarren/hoarcekat) by Kampfkarren.

# How to use

### Installation

Install the package to get started.

`npm install @rbxts/storyblox`

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
or a table `{ renderer = "native", title = "...", mount = fn }`. `defineStory({ title, args, argTypes, render })` is the same kind of table: `controls.string()`, `controls.boolean()`, `controls.number()`, `controls.enum()`, `controls.radio()`, and `controls.slider()` describe args, and a present value has to match. A missing arg is not the same as `false` or `0`. Optional controls can clear back to missing. Invalid number text stays in the field and is not written into args. The controls pane edits color, vector, UDim, UDim2, enum, asset, and CFrame values. Color and vectors are comma-separated numbers. A value that does not parse shows the reason and is not written into args. Objects, dictionaries, arrays, and unions patch a copy of the value. Functions, instances, and bindings stay read-only. Story actions are a capped in-memory log with reset. Setup cleanup still runs when setup throws. Decorators wrap the story from the outside in. A story preview width and height is the logical size. Fit scales that into the dock. 100% keeps the scale at 1. A preview background paints that box, and a bounds stroke outlines it. Grid draws 8px lines inside the same size. Zoom steps and a separate preview theme are not in the pane yet. Other shapes are skipped.
Native mounts get `context.theme`, `context.args`, and `context.target`. `own`, `connect`, and `onCleanup` register cleanup that still runs if `mount` throws. A returned function remounts when args or the theme change. `{ update = fn }` applies the next args on the same instances. Refresh remounts either way. Functions on the args table stay functions.

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
