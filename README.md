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

Mount the `Storyblox` Roact component however/wherever you want and just pass in
the optional props for further customization. 

```javascript
    // root?: Instance;
    //  default -> ReplicatedStorage
    // extension?: `.${string}`;
    //  default -> "*.stories"
    // primaryTheme?: Theme;
    //  default -> DarkTheme from @rbxts/uiblox
    // secondaryTheme?: Theme;
    // default -> LightTheme from @rbxts/uiblox
    // logoSrc?: string;
    // default -> Storyblox logo assetId
    <Storyblox />
```

Next, just start writing stories for your components! By default, it will look for
Modulescripts in `ReplicatedStorage` named as `*.stories`, but you can change
this by passing in a `root?: Instance` prop to the `Storyblox` component.

Here are some example stories:

#### TreeView.stories.tsx

Every story can be passed props (optional) if the component itself has a Props
interface. These props are passed to the `story.template` method when rendering
the story.

You should name your stories in the syntax `<component_name>/<story_name>`>.
There can only be one story per title (they must be unique). Otherwise, it will
only render the first story loaded with a given title.

```javascript
import Roact from '@rbxts/roact';
import { Story } from '@rbxts/storyblox';
import { TreeView } from '@rbxts/uiblox';
import { TreeViewProps } from '@rbxts/uiblox/out/ui/packages/treeView/components/TreeView';

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
import Roact from '@rbxts/roact';
import { markPureComponent, useState } from '@rbxts/roact-hooked';
import { Lighting, RunService } from '@rbxts/services';
import { ProgressBar } from '@rbxts/uiblox';
import { ProgressBarProps } from '@rbxts/uiblox/out/ui/packages/progressBar/components/ProgressBar';
import { Story, StoryCallback, StoryElement } from '@rbxts/storyblox';
import useProgressBarStyles from './ProgressBar.styles';

const template = (props: ProgressBarProps) => {
  const maid = new Maid(); // Maid to do cleaning once we are done

  // Use IntValue so that Roact will re-render when the value changes / listen
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
        Key={"Container"}
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
import Roact from '@rbxts/roact';
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