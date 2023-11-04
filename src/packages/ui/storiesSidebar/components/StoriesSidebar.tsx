import Roact from "@rbxts/roact";
import { markPureComponent, useEffect, useState } from "@rbxts/roact-hooked";
import { Icon, Icons, Sidebar, Divider, Branch, Leaf, Tree, TreeView, Input } from "@rbxts/uiblox";
import { Story } from "../../../../interfaces";
import useStoriesSidebarStyles from "./StoriesSidebar.styles";
import Log from "@rbxts/log";
import { RELEASE, VERSION } from "constants/AppConstants";

export interface StoriesSidebarProps {
	stories: Story[];
	logoSrc: string;
	version?: string;
	release?: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onClick: (story: Story<any>) => void;
	primaryThemeEnabled: boolean;
	onToggleTheme: () => void;
}

function StoriesSidebar({
	stories,
	logoSrc,
	version,
	release,
	onClick,
	primaryThemeEnabled,
	onToggleTheme,
}: StoriesSidebarProps) {
	const { themeButton, menuIcon, corner, logo, filterInput, storiesTree, divider, versionLabel, releaseLabel } =
		useStoriesSidebarStyles();

	const [filter, setFilter] = useState<string>("");
	const [, setSelectedStory] = useState<Story | undefined>();
	const [tree, setTree] = useState<Tree | undefined>();

	const clickOnStory = (story: Story) => {
		setSelectedStory(story);
		onClick(story);
	};

	useEffect(() => {
		if (stories.size() === 0) {
			return;
		}

		const tree: Tree = {
			title: "STORIES", // TODO: Allow this to be customized
			branches: [],
		};

		stories.forEach((story) => {
			const paths = story.title.split("/");
			const componentName = paths[0];
			const storyName = paths[1];

			if (componentName === undefined) {
				Log.Error("Story title is empty should follow the pattern '<componentName>/<storyName>'");
				return;
			}

			const newleaf: Leaf = {
				title: storyName,
				onClick: () => clickOnStory(story),
			};

			const branch = tree.branches.find((branch: Branch) => branch.title === componentName);
			if (branch === undefined) {
				const newBranch: Branch = {
					title: componentName,
					leaves: [newleaf],
				};

				tree.branches.push(newBranch);
			} else {
				branch.leaves?.push(newleaf);
			}
		});

		setTree(tree);
	}, [stories]);

	return (
		<Sidebar size="large">
			<textbutton
				Key="ThemeButton"
				{...themeButton}
				Event={{
					MouseButton1Click: () => {
						onToggleTheme();
					},
				}}
			>
				<uicorner {...corner} />
				<Icon icon={primaryThemeEnabled === true ? Icons.DarkTheme : Icons.LightTheme} className={menuIcon} />
			</textbutton>

			<imagelabel Key="Logo" Image={logoSrc} {...logo} />

			<Input
				variant="standard"
				placeholder="Filter"
				width={new UDim(1, 0)}
				className={filterInput}
				onTextChanged={(text: string) => {
					if (filter !== text) {
						setFilter(text);
					}
				}}
			/>

			<frame Key="StoriesTree" {...storiesTree}>
				{tree !== undefined && <TreeView tree={tree} icon={Icons.Book} filter={filter} />}
			</frame>

			<Divider className={divider} />

			<textlabel {...versionLabel} Text={`Version ${version}`}></textlabel>
			<textlabel {...releaseLabel} Text={`${release}`}></textlabel>
		</Sidebar>
	);
}

export default markPureComponent(StoriesSidebar);
