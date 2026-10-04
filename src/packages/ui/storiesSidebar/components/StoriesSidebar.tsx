import React, { useEffect, useState } from "@rbxts/react";
import { Icons, Sidebar, Divider, Branch, Leaf, Tree, TreeView, TreeViewProps, Input } from "@rbxts/uiblox";
import { Story } from "../../../../interfaces";
import useStoriesSidebarStyles from "./StoriesSidebar.styles";
import Log from "@rbxts/log";
import { VERSION } from "constants/AppConstants";
import { storyMatches } from "../storySearch";

const SEARCH_DELAY = 0.2;

export interface StoriesSidebarProps {
	stories: Story[];
	logoSrc: string;
	version?: string;
	selected?: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onClick: (story: Story<any>) => void;
}

function StoriesSidebar({ stories, logoSrc, version = VERSION, selected, onClick }: StoriesSidebarProps) {
	const { logo, filterInput, storiesTree, divider, versionLabel } = useStoriesSidebarStyles();

	const [draft, setDraft] = useState("");
	const [query, setQuery] = useState("");
	const [tree, setTree] = useState<Tree | undefined>();

	useEffect(() => {
		const pending = task.delay(SEARCH_DELAY, () => setQuery(draft));
		return () => task.cancel(pending);
	}, [draft]);

	useEffect(() => {
		if (stories.size() === 0) {
			setTree(undefined);
			return;
		}

		const matches = stories.filter((story) => storyMatches(story.title, query));
		if (matches.size() === 0) {
			setTree(undefined);
			return;
		}

		const tree: Tree = {
			title: "STORIES", // TODO: Allow this to be customized
			branches: [],
		};

		if (query.size() > 0) {
			matches.forEach((story) => {
				tree.branches.push({
					title: story.title,
					leaves: [],
					onClick: () => onClick(story),
				});
			});
			setTree(tree);
			return;
		}

		matches.forEach((story) => {
			const paths = story.title.split("/");
			const componentName = paths[0];
			const storyName = paths[1];

			if (componentName === undefined) {
				Log.Error("Story title is empty should follow the pattern '<componentName>/<storyName>'");
				return;
			}

			const newleaf: Leaf = {
				title: storyName,
				onClick: () => onClick(story),
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
	}, [stories, query]);

	return (
		<Sidebar size="large">
			<imagelabel key="Logo" Image={logoSrc} {...logo} />

			<Input
				{...({
					variant: "standard",
					placeholder: "Filter",
					width: new UDim(1, 0),
					text: draft,
					className: filterInput,
					onInput: (text: string) => setDraft(text),
					onTextChanged: (text: string) => setDraft(text),
				} as React.ComponentProps<typeof Input> & { onInput?: (text: string) => void })}
			/>

			<frame key="StoriesTree" {...storiesTree}>
				{tree !== undefined && <TreeView {...({ tree, icon: Icons.Book, selected } as TreeViewProps)} />}
				{query.size() > 0 && tree === undefined && (
					<textlabel
						{...versionLabel}
						Text="No stories found"
						Position={new UDim2(0, 0, 0, 0)}
						AnchorPoint={new Vector2(0, 0)}
						TextXAlignment={Enum.TextXAlignment.Left}
					/>
				)}
			</frame>

			<Divider className={divider} />

			<textlabel {...versionLabel} Text={`@rbxts/storyblox ${version}`}></textlabel>
		</Sidebar>
	);
}

export default StoriesSidebar;
