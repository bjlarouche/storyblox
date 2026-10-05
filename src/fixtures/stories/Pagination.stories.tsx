import React from "@rbxts/react";
import { Pagination, useArg } from "./kitBreadth";

interface Args {
	count: number;
	page: number;
	disabled: boolean;
}

function PaginationStory(args: Args) {
	const [page, setPage] = useArg(args.page);
	return <Pagination count={args.count} page={page} disabled={args.disabled} onChange={setPage} />;
}

export default {
	title: "Components/Pagination",
	args: { count: 5, page: 1, disabled: false },
	argTypes: {
		count: { type: "number" },
		page: { type: "number" },
		disabled: { type: "boolean" },
	},
	render: (args: Args) => <PaginationStory {...args} />,
};
