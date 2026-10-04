export function storyInspector(story: {
	title?: string;
	renderer?: string;
	language?: string;
	source?: string;
	description?: string;
	argTypes?: { [key: string]: unknown };
} | undefined) {
	if (story === undefined || typeOf(story.title) !== "string") return "No story selected";
	const kind = story.renderer === "native" ? "native" : "react";
	const lines = [`${story.title}`, story.language !== undefined ? `${kind} · ${story.language}` : kind];
	if (typeOf(story.source) === "string" && (story.source as string).size() > 0) lines.push(story.source as string);
	if (typeOf(story.description) === "string" && (story.description as string).size() > 0) lines.push(story.description as string);
	const names = new Array<string>();
	if (typeOf(story.argTypes) === "table") {
		for (const [name] of pairs(story.argTypes as object)) names.push(name as string);
	}
	names.sort();
	if (names.size() > 0) lines.push(names.join(", "));
	return lines.join("\n");
}

export function storyLanguage(source: string) {
	return source.sub(1, 40).find("Compiled with roblox-ts", 1, true)[0] !== undefined ? "TS" : "Luau";
}

export function storyLabel(title: string, renderer?: string, language?: string) {
	const crumbs = title.split("/").join(" › ");
	const badges = [renderer === "native" ? "native" : "react"];
	if (language !== undefined) badges.push(language);
	return `${crumbs}  ·  ${badges.join(" · ")}`;
}

export function argDoc(
	name: string,
	spec: { type?: string; control?: string; optional?: boolean; description?: string } | undefined,
	fallback: unknown,
) {
	const parts = [name, spec?.control ?? spec?.type ?? "unknown"];
	if (spec?.optional === true) parts.push("optional");
	if (fallback === undefined) parts.push("no default");
	else if (typeOf(fallback) !== "table")
		parts.push(`default ${typeOf(fallback) === "string" ? `"${fallback}"` : tostring(fallback)}`);
	const line = parts.join(" · ");
	return spec?.description !== undefined ? `${line}\n${spec.description}` : line;
}
