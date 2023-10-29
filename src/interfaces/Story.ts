import Roact from "@rbxts/roact";

export interface StoryElement extends Roact.Element {}
export type StoryCallback = () => void;
export type StoryTitle = `${string}/${string}`;

export default interface Story<P = {}> {
	title: StoryTitle;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	component: Roact.Component<P> | ((props: any) => Roact.Element);
	template: P extends keyof never
		? () => StoryElement
		: (props: P) => Roact.Element | LuaTuple<[StoryElement, StoryCallback]>;
	props?: P extends keyof never ? unknown : P;
}
