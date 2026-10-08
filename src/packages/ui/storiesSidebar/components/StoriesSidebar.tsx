import React, { useEffect, useRef, useState } from "@rbxts/react";
import { UserInputService } from "@rbxts/services";
import {
	Branch,
	Icons,
	Sidebar,
	Divider,
	Tree,
	TreeView,
	TreeViewProps,
	Input,
	Icon,
	IconButton,
	Typography,
	VirtualList,
	VirtualListHandle,
	WriteableStyle,
	useTheme,
} from "@rbxts/uiblox";
import { Story } from "interfaces";
import useStoriesSidebarStyles from "./StoriesSidebar.styles";
import Log from "@rbxts/log";
import { VERSION } from "constants/AppConstants";
import { searchStories, stepSearchIndex, StorySearchHit } from "../storySearch";
import { adoptTree, favoriteBranch, orderedStoryTitles, sortByTitle, stepStoryTitle, storyBranches } from "../storyTree";

const SEARCH_DELAY = 0.2;

export interface StoriesSidebarProps {
	stories: Story[];
	logoSrc: string;
	version?: string;
	selected?: string;
	focusSearch?: number;
	favorites?: string[];
	includeTags?: string;
	excludeTags?: string;
	onIncludeTagsChange?: (value: string) => void;
	onExcludeTagsChange?: (value: string) => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	onClick: (story: Story<any>) => void;
}

function StoriesSidebar({
	stories,
	logoSrc,
	version = VERSION,
	selected,
	focusSearch = 0,
	favorites = [],
	includeTags = "",
	excludeTags = "",
	onIncludeTagsChange,
	onExcludeTagsChange,
	onClick,
}: StoriesSidebarProps) {
	const {
		logo,
		filterInput,
		tagFilters,
		storiesTree,
		resultsList,
		resultRow,
		resultRowActive,
		resultIcon,
		resultLeaf,
		resultPath,
		emptyLabel,
		divider,
		versionLabel,
		statusLabel,
	} = useStoriesSidebarStyles();
	const { theme } = useTheme();
	const sidebar = useRef<Frame>();
	const resultsRef = useRef<VirtualListHandle>();
	const searchingRef = useRef(false);
	const hitsRef = useRef<StorySearchHit[]>([]);
	const activeRef = useRef(0);
	const storiesRef = useRef(stories);
	const selectedRef = useRef(selected);
	const onClickRef = useRef(onClick);
	storiesRef.current = stories;
	selectedRef.current = selected;
	onClickRef.current = onClick;

	useEffect(() => {
		if (focusSearch === 0) return;
		const box = sidebar.current?.Parent?.FindFirstChildWhichIsA("TextBox", true);
		if (box) box.CaptureFocus();
	}, [focusSearch]);

	const [draft, setDraft] = useState("");
	const [query, setQuery] = useState("");
	const [active, setActive] = useState(0);
	const [hover, setHover] = useState<number | undefined>();
	const treeRef = useRef<Tree>();
	const [, setTreeRev] = useState(0);

	useEffect(() => {
		const pending = task.delay(SEARCH_DELAY, () => setQuery(draft));
		return () => task.cancel(pending);
	}, [draft]);

	useEffect(() => {
		if (stories.size() === 0) {
			treeRef.current = undefined;
			setTreeRev((n) => n + 1);
			return;
		}

		const built: Tree = {
			title: "STORIES",
			branches: [],
		};

		stories.forEach((story) => {
			if (story.title.split("/").size() < 2) {
				Log.Error("Story title is empty should follow the pattern '<componentName>/<storyName>'");
			}
		});
		const nodes = stories.map((story) => ({
			title: story.title,
			onClick: () => onClick(story),
		}));
		const starredIcon = (Icons as unknown as { Star: typeof Icons.OpenBox }).Star;
		const icons = { folder: Icons.OpenBox, story: Icons.Book, starred: starredIcon };
		built.branches = storyBranches(nodes, icons) as Branch[];
		const favoritesBranch = favoriteBranch(nodes, favorites, icons);
		if (favoritesBranch !== undefined) built.branches.unshift(favoritesBranch as Branch);

		treeRef.current = adoptTree(treeRef.current, built);
		setTreeRev((n) => n + 1);
	}, [stories, favorites]);

	const hits = searchStories(
		stories.map((story) => story.title),
		query,
	);
	sortByTitle(hits);
	const searching = query.size() > 0;
	searchingRef.current = searching;
	hitsRef.current = hits;
	activeRef.current = active;

	useEffect(() => {
		setActive(0);
		setHover(undefined);
	}, [query]);

	useEffect(() => {
		if (searching) resultsRef.current?.ensureVisible(active);
	}, [active, searching]);

	const openHit = (hit: StorySearchHit) => {
		const story = storiesRef.current.find((item) => item.title === hit.title);
		if (story !== undefined) onClick(story);
	};

	const clear = () => {
		const box = UserInputService.GetFocusedTextBox() ?? sidebar.current?.Parent?.FindFirstChildWhichIsA("TextBox", true);
		if (box !== undefined) box.Text = "";
		setDraft("");
		setQuery("");
	};

	useEffect(() => {
		const connection = UserInputService.InputBegan.Connect((input, gameProcessed) => {
			const box = UserInputService.GetFocusedTextBox();
			const host = sidebar.current?.Parent;
			const key = input.KeyCode;
			const searchFocused = box !== undefined && host !== undefined && box.IsDescendantOf(host);
			if (searchFocused) {
				if (gameProcessed) return;
				if (key === Enum.KeyCode.Escape) {
					clear();
					return;
				}
				if (!searchingRef.current) return;
				const count = hitsRef.current.size();
				if (count === 0) return;
				if (key === Enum.KeyCode.Up) {
					setActive((current) => stepSearchIndex(current, -1, count));
				} else if (key === Enum.KeyCode.Down) {
					setActive((current) => stepSearchIndex(current, 1, count));
				}
				return;
			}
			if (box !== undefined || searchingRef.current) return;
			const alt = UserInputService.IsKeyDown(Enum.KeyCode.LeftAlt) || UserInputService.IsKeyDown(Enum.KeyCode.RightAlt);
			if (!alt) return;
			const delta = key === Enum.KeyCode.Down ? 1 : key === Enum.KeyCode.Up ? -1 : 0;
			if (delta === 0) return;
			const icons = { folder: "", story: "", starred: "" };
			const nodes = storiesRef.current.map((story) => ({ title: story.title, onClick: () => {} }));
			const chosen = stepStoryTitle(orderedStoryTitles(storyBranches(nodes, icons)), selectedRef.current, delta);
			if (chosen === undefined) return;
			const story = storiesRef.current.find((item) => item.title === chosen);
			if (story !== undefined) onClickRef.current(story);
		});
		return () => connection.Disconnect();
	}, []);

	const tree = treeRef.current;

	const statusText = searching
		? hits.size() === 0
			? "No stories found"
			: hits.size() === 1
				? "1 match"
				: `${hits.size()} matches`
		: stories.size() === 0
			? "No stories found"
			: stories.size() === 1
				? "1 story"
				: `${stories.size()} stories`;

	return (
		<Sidebar size="large" className={{ Size: new UDim2(1, 0, 1, 0) } as WriteableStyle<Frame>}>
			<imagelabel key="Logo" Image={logoSrc} {...logo} />

			<Input
				{...({
					variant: "outlined",
					rounded: true,
					placeholder: "Search stories",
					width: new UDim(1, 0),
					text: draft,
					className: filterInput,
					onInput: (text: string) => setDraft(text),
					onTextChanged: (text: string) => setDraft(text),
					onEnterPressed: () => {
						if (!searching) return;
						const hit = hits[active];
						if (hit !== undefined) openHit(hit);
					},
					startAdornment: (
						<Icon
							icon={"rbxasset://textures/ui/SearchIcon.png" as Icons}
							size="xs"
							tint={theme.palette.text.secondary}
						/>
					),
					endAdornment:
						draft.size() > 0 ? (
							<IconButton
								icon={Icons.Close}
								size="xs"
								tint={theme.palette.text.secondary}
								onClick={clear}
							/>
						) : undefined,
				} as React.ComponentProps<typeof Input> & {
					onInput?: (text: string) => void;
					startAdornment?: React.Element;
					endAdornment?: React.Element;
				})}
			/>

			<frame key="TagFilters" {...tagFilters}>
				<Input
					{...({
						variant: "outlined",
						rounded: true,
						placeholder: "Include tags",
						width: new UDim(0.5, -theme.padding.calc(0.5)),
						text: includeTags,
						className: {
							Size: new UDim2(0.5, -theme.padding.calc(0.5), 1, 0),
							Position: UDim2.fromScale(0, 0),
						},
						onInput: onIncludeTagsChange,
						onTextChanged: onIncludeTagsChange,
					} as React.ComponentProps<typeof Input> & {
						onInput?: (text: string) => void;
					})}
				/>
				<Input
					{...({
						variant: "outlined",
						rounded: true,
						placeholder: "Exclude tags",
						width: new UDim(0.5, -theme.padding.calc(0.5)),
						text: excludeTags,
						className: {
							Size: new UDim2(0.5, -theme.padding.calc(0.5), 1, 0),
							Position: new UDim2(0.5, theme.padding.calc(0.5), 0, 0),
						},
						onInput: onExcludeTagsChange,
						onTextChanged: onExcludeTagsChange,
					} as React.ComponentProps<typeof Input> & {
						onInput?: (text: string) => void;
					})}
				/>
			</frame>

			<frame key="StoriesTree" ref={sidebar} {...storiesTree}>
				{tree !== undefined && (
					<frame
						key="TreeHost"
						Size={new UDim2(1, 0, 1, 0)}
						BackgroundTransparency={1}
						BorderSizePixel={0}
						Visible={!searching}
					>
						<TreeView {...({ tree, icon: Icons.Book, selected } as TreeViewProps)} />
					</frame>
				)}

				{((searching && hits.size() === 0) || (!searching && stories.size() === 0)) && (
					<Typography
						text="No stories found"
						variant="caption"
						color="textSecondary"
						className={emptyLabel as WriteableStyle<TextLabel>}
					/>
				)}

				{searching && hits.size() > 0 && (
					<VirtualList
						key="Results"
						className={resultsList}
						items={hits}
						getKey={(hit) => hit.title}
						itemHeight={theme.spacing.calc(2) + theme.padding.calc(2)}
						listRef={resultsRef}
						renderItem={(hit, index) => {
							const emphasized = index === active || index === hover || hit.title === selected;
							const rowStyle = {
								...resultRow,
								...(emphasized ? resultRowActive : {}),
							} as WriteableStyle<TextButton>;
							return (
								<textbutton
									{...rowStyle}
									Event={{
										MouseButton1Click: () => {
											if (resultsRef.current?.suppressClick()) return;
											openHit(hit);
										},
										MouseEnter: () => setHover(index),
										MouseLeave: () => setHover(undefined),
									}}
								>
									<Icon
										icon={Icons.Book}
										size="xs"
										tint={theme.palette.primary.main}
										className={resultIcon}
									/>
									<Typography
										text={hit.leaf}
										variant="body"
										color="textPrimary"
										family={hit.title === selected || index === active ? "bold" : "default"}
										className={resultLeaf as WriteableStyle<TextLabel>}
									/>
									{hit.breadcrumb.size() > 0 && (
										<Typography
											text={hit.breadcrumb}
											variant="caption"
											color="textSecondary"
											className={resultPath as WriteableStyle<TextLabel>}
										/>
									)}
								</textbutton>
							);
						}}
					/>
				)}
			</frame>

			<Divider className={divider} />

			<textlabel key="Status" {...versionLabel} {...statusLabel} Text={statusText} />
			<textlabel {...versionLabel} Text={`@rbxts/storyblox ${version}`}></textlabel>
		</Sidebar>
	);
}

export default StoriesSidebar;
