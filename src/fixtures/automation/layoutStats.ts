export interface LayoutIssue {
	kind: "zero-size" | "offscreen" | "text-overflow" | "text-overlap";
	path: string;
	detail?: string;
}

export interface LayoutStats {
	guiObjects: number;
	textObjects: number;
	issues: LayoutIssue[];
}

function pathOf(inst: Instance): string {
	return inst.GetFullName();
}

function overlaps(a: GuiObject, b: GuiObject): boolean {
	const ax2 = a.AbsolutePosition.X + a.AbsoluteSize.X;
	const ay2 = a.AbsolutePosition.Y + a.AbsoluteSize.Y;
	const bx2 = b.AbsolutePosition.X + b.AbsoluteSize.X;
	const by2 = b.AbsolutePosition.Y + b.AbsoluteSize.Y;
	return a.AbsolutePosition.X < bx2 && ax2 > b.AbsolutePosition.X && a.AbsolutePosition.Y < by2 && ay2 > b.AbsolutePosition.Y;
}

export function collectLayoutStats(root: GuiObject, viewport: Vector2): LayoutStats {
	const issues = new Array<LayoutIssue>();
	const texts = new Array<GuiObject>();
	let guiObjects = 0;
	for (const child of root.GetDescendants()) {
		if (!child.IsA("GuiObject")) continue;
		guiObjects += 1;
		const size = child.AbsoluteSize;
		const pos = child.AbsolutePosition;
		if (size.X === 0 || size.Y === 0) {
			issues.push({ kind: "zero-size", path: pathOf(child) });
		}
		if (pos.X + size.X < 0 || pos.Y + size.Y < 0 || pos.X > viewport.X || pos.Y > viewport.Y) {
			issues.push({ kind: "offscreen", path: pathOf(child) });
		}
		if (child.IsA("TextLabel") || child.IsA("TextButton") || child.IsA("TextBox")) {
			texts.push(child);
			if (child.Text !== "" && child.TextFits === false) {
				issues.push({ kind: "text-overflow", path: pathOf(child), detail: child.Text });
			}
		}
	}
	for (let i = 0; i < texts.size(); i++) {
		for (let j = i + 1; j < texts.size(); j++) {
			const a = texts[i];
			const b = texts[j];
			if (a.AbsoluteSize.X === 0 || b.AbsoluteSize.X === 0) continue;
			if (overlaps(a, b)) {
				issues.push({ kind: "text-overlap", path: `${pathOf(a)} | ${pathOf(b)}` });
			}
		}
	}
	return { guiObjects, textObjects: texts.size(), issues };
}
