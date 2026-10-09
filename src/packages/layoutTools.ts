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

const OVERLAY_NAME = "OutlineOverlay";

export function collectGuiBoxes(root: Instance, max = 64): BoxRect[] {
	const boxes = new Array<BoxRect>();
	const stack: Instance[] = [root];
	while (stack.size() > 0 && boxes.size() < max) {
		const node = stack.pop()!;
		if (node !== root && node.Name === OVERLAY_NAME) continue;
		if (node.IsA("GuiObject")) {
			const gui = node as GuiObject;
			if (gui.AbsoluteSize.X > 0 && gui.AbsoluteSize.Y > 0) boxes.push(guiBox(gui));
		}
		for (const child of node.GetChildren()) stack.push(child);
	}
	return boxes;
}

function scaleFactor(scale: number) {
	if (scale !== scale || scale <= 0 || scale === math.huge || scale === -math.huge) return 1;
	return scale;
}

export function overlayLocal(box: BoxRect, origin: BoxRect, scale: number): BoxRect {
	const factor = scaleFactor(scale);
	return {
		x: (box.x - origin.x) / factor,
		y: (box.y - origin.y) / factor,
		width: box.width / factor,
		height: box.height / factor,
		name: box.name,
		className: box.className,
	};
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
