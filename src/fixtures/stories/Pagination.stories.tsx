import React from "@rbxts/react";
import { Pagination, useArg } from "./kitBreadth";

interface Args {
	count: number;
	page: number;
	disabled: boolean;
	siblingCount: number;
	boundaryCount: number;
}

function PaginationStory(args: Args) {
	const [page, setPage] = useArg(args.page);
	return (
		<Pagination
			count={args.count}
			page={page}
			disabled={args.disabled}
			siblingCount={args.siblingCount}
			boundaryCount={args.boundaryCount}
			onChange={setPage}
		/>
	);
}

export default {
	title: "Components/Pagination",
	args: { count: 10, page: 5, disabled: false, siblingCount: 1, boundaryCount: 1 },
	argTypes: {
		count: { type: "number" },
		page: { type: "number" },
		disabled: { type: "boolean" },
		siblingCount: { type: "number", min: 0, max: 3, step: 1 },
		boundaryCount: { type: "number", min: 1, max: 3, step: 1 },
	},
	render: (args: Args) => <PaginationStory {...args} />,
};
