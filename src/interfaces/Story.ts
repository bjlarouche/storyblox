import React from "@rbxts/react";

export interface StoryElement extends React.Element {}
export type StoryCallback = () => void;
export type StoryTitle = `${string}/${string}`;

export default interface Story<P = {}> {
	title: StoryTitle;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	component: React.Component<P> | ((props: any) => React.Element);
	template: P extends keyof never
		? () => StoryElement
		: (props: P) => React.Element | LuaTuple<[StoryElement, StoryCallback]>;
	props?: P extends keyof never ? unknown : P;
}
