import Story from "./Story";

export default interface StoryExport<P = {}> {
	default: Story<P>;
}
