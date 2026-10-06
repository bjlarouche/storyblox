import React, { useState } from "@rbxts/react";
import {
	Alert,
	AppBar,
	AssetField,
	Avatar,
	Box,
	Breadcrumbs,
	Button,
	Chip,
	Dialog,
	FormHelperText,
	FormLabel,
	Input,
	LinearProgress,
	Paper,
	Select,
	Snackbar,
	Stack,
	Typography,
	useTheme,
	WriteableStyle,
} from "@rbxts/uiblox";
import { Markdown, MarkdownEditor, ScrollView, useArg } from "./kitBreadth";

interface Args {
	viewport: "phone" | "desktop";
	mode: "split" | "edit" | "preview";
	fullscreen: boolean;
	editorHeight: number;
	publishOpen: boolean;
	savedOpen: boolean;
}

const VIEWPORT: { [key in Args["viewport"]]: { width: number; height: number } } = {
	phone: { width: 390, height: 760 },
	desktop: { width: 1120, height: 760 },
};

const CATEGORIES = [
	{ label: "Product feedback", value: "feedback" },
	{ label: "How-to", value: "howto" },
	{ label: "Showcase", value: "showcase" },
];

const INITIAL = `## A small proposal

The activity page is useful, but scanning repeated events takes longer than it should.

- Group related events into a single row
- Keep errors expanded
- Preserve the current filters

What would make this easier for your team?`;

const HTML_SAMPLE =
	"<h2>Imported note</h2><p>The <strong>daily digest</strong> should keep failed deliveries visible.</p><ul><li>Group repeats</li><li>Keep timestamps</li></ul>";

const POST_ONE = `We have the same issue with long build runs. Grouping is helpful as long as the latest timestamp stays visible.

> Keep errors expanded

That part would save us the most time.`;

const POST_TWO = `A compact summary could work well:

1. Show the latest event
2. Add a count for repeats
3. Expand on demand

I would keep the filter behavior unchanged.`;

const STACK = { Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y };

function TextLine(props: {
	text: string;
	variant?: "h2" | "h3" | "body" | "caption" | "overline";
	color?: "textPrimary" | "textSecondary" | "error";
	wrap?: boolean;
}) {
	return (
		<Typography
			text={props.text}
			variant={props.variant ?? "body"}
			color={props.color ?? "textPrimary"}
			sx={{
				Size: new UDim2(1, 0, 0, props.wrap ? 0 : props.variant === "h2" ? 32 : 20),
				AutomaticSize: props.wrap ? Enum.AutomaticSize.Y : Enum.AutomaticSize.None,
			}}
		/>
	);
}

function Author(props: { name: string; meta: string; initials?: string }) {
	return (
		<Stack direction="row" gap={1} alignItems="center" sx={STACK}>
			<Avatar name={props.initials ?? props.name} size={32} />
			<Stack direction="column" gap={0} sx={{ Size: new UDim2(1, -40, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
				<TextLine text={props.name} />
				<TextLine text={props.meta} variant="caption" color="textSecondary" />
			</Stack>
		</Stack>
	);
}

function Post(props: { name: string; meta: string; body: string; accent?: boolean }) {
	return (
		<Paper elevation={props.accent ? "raised" : "outlined"} sx={STACK}>
			<Stack direction="column" gap={1.5} sx={STACK}>
				<Author name={props.name} meta={props.meta} />
				<Markdown value={props.body} sx={{ Size: new UDim2(1, 0, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }} />
				<Stack direction="row" gap={1} sx={STACK}>
					<Button text="Reply" variant="text" size="small" onLeftClick={() => undefined} />
					<Button text="Quote" variant="text" size="small" onLeftClick={() => undefined} />
					<Button text="Helpful · 3" variant="text" size="small" onLeftClick={() => undefined} />
				</Stack>
			</Stack>
		</Paper>
	);
}

function TopicContext() {
	return (
		<Stack direction="column" gap={2} sx={STACK}>
			<Paper
				elevation="raised"
				sx={{
					...STACK,
					bgcolor: "surface.paper",
					gradient: { colors: ["primary.main", "surface.paper"], rotation: 110 },
				} as WriteableStyle<Frame>}
			>
				<Stack direction="column" gap={1} sx={STACK}>
					<TextLine text="Topic summary" variant="h3" />
					<TextLine text="4 participants · 6 replies · updated 8m ago" color="textSecondary" wrap />
					<LinearProgress value={0.72} sx={{ Size: new UDim2(1, 0, 0, 8) }} />
					<TextLine text="72% of readers reached the latest reply" variant="caption" color="textSecondary" wrap />
				</Stack>
			</Paper>
			<Paper elevation="outlined" sx={STACK}>
				<Stack direction="column" gap={1} sx={STACK}>
					<TextLine text="Participants" variant="h3" />
					<Author name="Mara Hill" meta="Topic author" />
					<Author name="Eli Rowan" meta="2 replies" />
					<Author name="Sam Park" meta="1 reply" />
				</Stack>
			</Paper>
			<Paper elevation="outlined" sx={STACK}>
				<Stack direction="column" gap={1} sx={STACK}>
					<TextLine text="Related" variant="h3" />
					<TextLine text="Notification grouping patterns" color="textSecondary" wrap />
					<TextLine text="Making status tables scannable" color="textSecondary" wrap />
				</Stack>
			</Paper>
		</Stack>
	);
}

function CommunityComposer(args: Args) {
	const { theme } = useTheme();
	const size = VIEWPORT[args.viewport];
	const narrow = args.viewport === "phone";
	const [mode, setMode] = useArg<string>(args.mode);
	const [fullscreen, setFullscreen] = useArg(args.fullscreen);
	const [editorHeight, setEditorHeight] = useArg(args.editorHeight);
	const [publishOpen, setPublishOpen] = useArg(args.publishOpen);
	const [savedOpen, setSavedOpen] = useArg(args.savedOpen);
	const [title, setTitle] = useState("Group repeated activity events");
	const [category, setCategory] = useState("feedback");
	const [body, setBody] = useState(INITIAL);
	const [image, setImage] = useState("");
	const [tags, setTags] = useState(["workflow", "notifications"]);
	const [attachments, setAttachments] = useState(["event-summary.png", "sample-events.txt"]);
	const titleError = title.size() < 8;
	const bodyError = body.size() < 40;
	const valid = !titleError && !bodyError;
	const bar = theme.spacing.calc(7);

	const removeTag = (tag: string) => setTags(tags.filter((entry) => entry !== tag));
	const removeAttachment = (name: string) => setAttachments(attachments.filter((entry) => entry !== name));

	return (
		<frame
			Size={new UDim2(0, size.width, 0, size.height)}
			BackgroundColor3={theme.palette.surface.canvas}
			BorderSizePixel={0}
			ClipsDescendants={true}
		>
			<AppBar title="Community" elevation="raised" color="default">
				<Button text="Save draft" variant="outlined" size="small" onLeftClick={() => setSavedOpen(true)} />
				<Button
					text="Publish"
					variant="contained"
					color="primary"
					size="small"
					disabled={!valid}
					onLeftClick={() => setPublishOpen(true)}
				/>
			</AppBar>
			<ScrollView sx={{ Position: new UDim2(0, 0, 0, bar), Size: new UDim2(1, 0, 1, -bar), p: narrow ? 1 : 2 }}>
				<Stack direction="column" gap={2} sx={STACK}>
					<Breadcrumbs
						items={[
							{ label: "Community" },
							{ label: "Product feedback" },
							{ label: "Activity" },
						]}
						maxItems={narrow ? 2 : 4}
					/>
					<Paper elevation="raised" sx={STACK}>
						<Stack direction="column" gap={1} sx={STACK}>
							<TextLine text="A clearer activity feed" variant="h2" wrap />
							<Author name="Mara Hill" meta="Opened yesterday · edited 20m ago" />
							<Stack direction="row" gap={1} wrap sx={STACK}>
								<Chip label="workflow" size="small" color="primary" />
								<Chip label="notifications" size="small" variant="outlined" />
								<Chip label="needs review" size="small" variant="outlined" />
							</Stack>
							<TextLine
								text="How should repeated activity events be grouped without hiding delivery failures or changing existing filters?"
								color="textSecondary"
								wrap
							/>
						</Stack>
					</Paper>
					<Stack direction={narrow ? "column" : "row"} gap={2} alignItems="start" sx={STACK}>
						<Stack
							direction="column"
							gap={1.5}
							sx={{ Size: narrow ? new UDim2(1, 0, 0, 0) : new UDim2(1, -300, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}
						>
							<Post name="Eli Rowan" meta="Yesterday · reply 1" body={POST_ONE} />
							<Post name="Sam Park" meta="3h ago · reply 2" body={POST_TWO} accent />
							<Alert severity="info" message="You are replying to the topic. Drafts are stored locally until published." />
							<Paper elevation="outlined" sx={STACK}>
								<Stack direction="column" gap={1.5} sx={STACK}>
									<TextLine text="Compose reply" variant="h3" />
									<Stack direction={narrow ? "column" : "row"} gap={1.5} sx={STACK}>
										<Stack direction="column" gap={0.5} sx={{ Size: narrow ? new UDim2(1, 0, 0, 0) : new UDim2(1, -220, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
											<FormLabel text="Title" required />
											<Input
												text={title}
												variant="outlined"
												width={new UDim(1, 0)}
												hasError={titleError}
												onTextChanged={setTitle}
											/>
											<FormHelperText
												text={titleError ? "Use at least 8 characters." : `${title.size()} characters`}
												hasError={titleError}
											/>
										</Stack>
										<Stack direction="column" gap={0.5} sx={{ Size: narrow ? new UDim2(1, 0, 0, 0) : new UDim2(0, 208, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
											<FormLabel text="Category" required />
											<Select
												value={category}
												options={CATEGORIES}
												onChange={setCategory}
												sx={{ Size: new UDim2(1, 0, 0, 36) }}
											/>
										</Stack>
									</Stack>
									<Stack direction="row" gap={1} wrap sx={STACK}>
										{tags.map((tag) => (
											<Chip key={tag} label={tag} size="small" variant="outlined" onDelete={() => removeTag(tag)} />
										))}
										<Button
											text="+ accessibility"
											variant="text"
											size="small"
											onLeftClick={() => {
												if (!tags.includes("accessibility")) setTags([...tags, "accessibility"]);
											}}
										/>
									</Stack>
									<Stack direction="row" gap={1} wrap sx={STACK}>
										<Button text="Bold" variant="text" size="small" onLeftClick={() => setBody(`${body}\n\n**Important**`)} />
										<Button text="Quote" variant="text" size="small" onLeftClick={() => setBody(`${body}\n\n> Add a quoted note.`)} />
										<Button text="Link" variant="text" size="small" onLeftClick={() => setBody(`${body}\n\n[Related note](https://example.test)`)} />
										<Button text="Load HTML sample" variant="text" size="small" onLeftClick={() => setBody(HTML_SAMPLE)} />
									</Stack>
									<MarkdownEditor
										value={body}
										onChange={setBody}
										mode={mode}
										onModeChange={setMode}
										fullscreen={fullscreen}
										onFullscreenChange={setFullscreen}
										resizable
										height={editorHeight}
										minHeight={260}
										maxHeight={620}
										onHeightChange={setEditorHeight}
										placeholder="Write a useful reply…"
									/>
									<FormHelperText
										text={
											bodyError
												? `Add ${40 - body.size()} more characters.`
												: `${body.size()} characters · drag the bottom-right editor grip to resize`
										}
										hasError={bodyError}
									/>
									<Stack direction="column" gap={1} sx={STACK}>
										<TextLine text="Attachments" variant="h3" />
										<AssetField
											value={image}
											onChange={setImage}
											placeholder="Optional image asset ID"
											preview={image.size() > 0}
										/>
										<Stack direction="row" gap={1} wrap sx={STACK}>
											{attachments.map((name) => (
												<Chip
													key={name}
													label={name}
													size="small"
													variant="outlined"
													onDelete={() => removeAttachment(name)}
												/>
											))}
										</Stack>
									</Stack>
									{!valid && <Alert severity="error" message="Fix the title and reply before publishing." />}
									<Stack direction="row" gap={1} wrap sx={STACK}>
										<Button text="Discard" variant="text" onLeftClick={() => setBody(INITIAL)} />
										<Button text="Save draft" variant="outlined" onLeftClick={() => setSavedOpen(true)} />
										<Button
											text="Publish reply"
											variant="contained"
											color="primary"
											disabled={!valid}
											onLeftClick={() => setPublishOpen(true)}
										/>
									</Stack>
								</Stack>
							</Paper>
						</Stack>
						{!narrow && (
							<Box sx={{ Size: new UDim2(0, 284, 0, 0), AutomaticSize: Enum.AutomaticSize.Y }}>
								<TopicContext />
							</Box>
						)}
						{narrow && <TopicContext />}
					</Stack>
				</Stack>
			</ScrollView>
			<Dialog
				open={publishOpen}
				title="Publish this reply?"
				onClose={() => setPublishOpen(false)}
				actions={
					<Stack direction="row" gap={1} sx={{ AutomaticSize: Enum.AutomaticSize.XY }}>
						<Button text="Keep editing" variant="text" onLeftClick={() => setPublishOpen(false)} />
						<Button
							text="Publish"
							variant="contained"
							color="primary"
							onLeftClick={() => {
								setPublishOpen(false);
								setSavedOpen(true);
							}}
						/>
					</Stack>
				}
			>
				<TextLine text="Everyone following Product feedback will be notified." color="textSecondary" wrap />
			</Dialog>
			<Snackbar
				open={savedOpen}
				message={publishOpen ? "Draft saved." : "Your reply was saved."}
				onDismiss={() => setSavedOpen(false)}
				action="Undo"
				onAction={() => setSavedOpen(false)}
			/>
		</frame>
	);
}

export default {
	title: "Scenarios/Community Composer",
	description: "Discussion thread with author context, rich Markdown composing, resizable editor, attachments, validation, drafts, and publish feedback.",
	args: {
		viewport: "desktop",
		mode: "split",
		fullscreen: false,
		editorHeight: 380,
		publishOpen: false,
		savedOpen: false,
	},
	argTypes: {
		viewport: { type: "enum", options: ["phone", "desktop"] },
		mode: { type: "enum", options: ["split", "edit", "preview"] },
		fullscreen: { type: "boolean" },
		editorHeight: { type: "number", min: 160, max: 760, step: 16 },
		publishOpen: { type: "boolean" },
		savedOpen: { type: "boolean" },
	},
	preview: { width: 1120, height: 760 },
	tags: ["scenario", "parity"],
	render: (args: Args) => <CommunityComposer {...args} />,
};
