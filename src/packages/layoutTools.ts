export interface BoxRect {
	x: number;
	y: number;
	width: number;
	height: number;
	name: string;
	className: string;
}

export function guiBox(gui: GuiObject): BoxRect {
	const pos = gui.AbsolutePosition;
	const size = gui.AbsoluteSize;
	return {
		x: pos.X,
		y: pos.Y,
		width: size.X,
		height: size.Y,
		name: gui.Name,
		className: gui.ClassName,
	};
}

export function collectGuiBoxes(root: Instance, max = 64): BoxRect[] {
	const boxes = new Array<BoxRect>();
	const stack: Instance[] = [root];
	while (stack.size() > 0 && boxes.size() < max) {
		const node = stack.pop()!;
		if (node.IsA("GuiObject")) {
			const gui = node as GuiObject;
			if (gui.AbsoluteSize.X > 0 && gui.AbsoluteSize.Y > 0) boxes.push(guiBox(gui));
		}
		for (const child of node.GetChildren()) stack.push(child);
	}
	return boxes;
}

export function formatMeasure(box: BoxRect): string {
	return `${box.name} ${math.floor(box.width)}×${math.floor(box.height)} @ ${math.floor(box.x)},${math.floor(box.y)}`;
}

export function relativeBox(box: BoxRect, origin: BoxRect): BoxRect {
	return {
		x: box.x - origin.x,
		y: box.y - origin.y,
		width: box.width,
		height: box.height,
		name: box.name,
		className: box.className,
	};
}
