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
	WriteableStyle,
	useTheme,
} from "@rbxts/uiblox";
import { Story } from "interfaces";
import useStoriesSidebarStyles from "./StoriesSidebar.styles";
import Log from "@rbxts/log";
import { VERSION } from "constants/AppConstants";
import { searchStories, stepSearchIndex, StorySearchHit } from "../storySearch";
import { adoptTree, favoriteBranch, sortByTitle, storyBranches } from "../storyTree";

const SEARCH_DELAY = 0.2;

export interface StoriesSidebarProps {
	stories: Story[];
	logoSrc: string;
	version?: string;
	selected?: string;
	focusSearch?: number;
	favorites?: string[];
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
	onClick,
}: StoriesSidebarProps) {
	const {
		logo,
		filterInput,
		storiesTree,
		resultsList,
		resultsLayout,
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
	const searchingRef = useRef(false);
	const hitsRef = useRef<StorySearchHit[]>([]);
	const activeRef = useRef(0);
	const storiesRef = useRef(stories);
	storiesRef.current = stories;

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
			if (gameProcessed) return;
			const box = UserInputService.GetFocusedTextBox();
			const host = sidebar.current?.Parent;
			if (box === undefined || host === undefined || !box.IsDescendantOf(host)) return;
			const key = input.KeyCode;
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

				{searching && hits.size() === 0 && (
					<Typography
						text="No stories found"
						variant="caption"
						color="textSecondary"
						className={emptyLabel as WriteableStyle<TextLabel>}
					/>
				)}

				{searching && hits.size() > 0 && (
					<scrollingframe
						key="Results"
						{...resultsList}
						CanvasSize={new UDim2(0, 0, 0, hits.size() * (theme.spacing.calc(2) + theme.padding.calc(2)))}
					>
						<uilistlayout {...resultsLayout} />
						{hits.map((hit, index) => {
							const emphasized = index === active || index === hover || hit.title === selected;
							const rowStyle = {
								...resultRow,
								...(emphasized ? resultRowActive : {}),
								LayoutOrder: index,
							} as WriteableStyle<TextButton>;
							return (
								<textbutton
									key={hit.title}
									{...rowStyle}
									Event={{
										MouseButton1Click: () => openHit(hit),
										MouseEnter: () => setHover(index),
										MouseLeave: () => setHover(undefined),
									}}
								>
									<Icon
										icon={Icons.Book}
										size="xs"
										tint={theme.palette.secondary.main}
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
						})}
					</scrollingframe>
				)}
			</frame>

			<Divider className={divider} />

			<textlabel key="Status" {...versionLabel} {...statusLabel} Text={statusText} />
			<textlabel {...versionLabel} Text={`@rbxts/storyblox ${version}`}></textlabel>
		</Sidebar>
	);
}

export default StoriesSidebar;
