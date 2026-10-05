export interface A11yFinding {
	id: string;
	severity: "error" | "warn";
	message: string;
	target: string;
}

const MIN_TARGET = 24;

export function contrastRatio(a: Color3, b: Color3): number {
	const la = relativeLuminance(a);
	const lb = relativeLuminance(b);
	const lighter = la > lb ? la : lb;
	const darker = la > lb ? lb : la;
	return (lighter + 0.05) / (darker + 0.05);
}

function relativeLuminance(color: Color3): number {
	const channel = (value: number) => {
		return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * channel(color.R) + 0.7152 * channel(color.G) + 0.0722 * channel(color.B);
}

export function scanA11y(root: Instance, max = 64): A11yFinding[] {
	const findings = new Array<A11yFinding>();
	const stack: Instance[] = [root];
	let seen = 0;
	while (stack.size() > 0 && seen < max) {
		const node = stack.pop()!;
		seen += 1;
		if (node.IsA("GuiButton") || node.IsA("TextBox")) {
			const gui = node as GuiObject;
			const path = gui.GetFullName();
			if (gui.Selectable !== true) {
				findings.push({ id: "selectable", severity: "warn", message: "not Selectable", target: path });
			}
			const size = gui.AbsoluteSize;
			if (size.X > 0 && size.Y > 0 && (size.X < MIN_TARGET || size.Y < MIN_TARGET)) {
				findings.push({
					id: "target-size",
					severity: "warn",
					message: `target ${math.floor(size.X)}×${math.floor(size.Y)} < ${MIN_TARGET}`,
					target: path,
				});
			}
		}
		if (node.IsA("TextLabel") || node.IsA("TextButton") || node.IsA("TextBox")) {
			const text = node as TextLabel | TextButton | TextBox;
			if (text.Text.size() === 0 && text.IsA("GuiButton")) {
				findings.push({
					id: "label",
					severity: "warn",
					message: "empty control text",
					target: text.GetFullName(),
				});
			}
			if (text.TextTransparency < 1 && text.BackgroundTransparency < 1) {
				const ratio = contrastRatio(text.TextColor3, text.BackgroundColor3);
				if (ratio < 3) {
					findings.push({
						id: "contrast",
						severity: "warn",
						message: `contrast ${string.format("%.1f", ratio)}:1`,
						target: text.GetFullName(),
					});
				}
			}
		}
		for (const child of node.GetChildren()) stack.push(child);
	}
	return findings;
}
