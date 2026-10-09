import React from "@rbxts/react";
import { Pagination, useArg } from "./kitBreadth";

interface Args {
	count: number;
	page: number;
	disabled: boolean;
	siblingCount: number;
	boundaryCount: number;
	size: "small" | "medium" | "large";
	variant: "text" | "outlined";
}

function PaginationStory(args: Args) {
	const [page, setPage] = useArg(args.page);
	return (
		<frame AutomaticSize={Enum.AutomaticSize.Y} Size={new UDim2(0, 280, 0, 0)} BackgroundTransparency={1}>
			<uilistlayout FillDirection={Enum.FillDirection.Vertical} Padding={new UDim(0, 8)} SortOrder={Enum.SortOrder.LayoutOrder} />
			<Pagination
				count={args.count}
				page={page}
				disabled={args.disabled}
				siblingCount={args.siblingCount}
				boundaryCount={args.boundaryCount}
				size={args.size}
				variant={args.variant}
				onChange={setPage}
			/>
			<Pagination count={5} page={1} size="small" variant="text" onChange={() => {}} />
		</frame>
	);
}

export default {
	title: "Components/Pagination",
	preview: { kind: "gui", width: 320, height: 100 },
	args: { count: 10, page: 5, disabled: false, siblingCount: 1, boundaryCount: 1, size: "medium", variant: "outlined" },
	argTypes: {
		count: { type: "number" },
		page: { type: "number" },
		disabled: { type: "boolean" },
		siblingCount: { type: "number", min: 0, max: 3, step: 1 },
		boundaryCount: { type: "number", min: 1, max: 3, step: 1 },
		size: { type: "enum", options: ["small", "medium", "large"] },
		variant: { type: "enum", options: ["text", "outlined"] },
	},
	render: (args: Args) => <PaginationStory {...args} />,
};
