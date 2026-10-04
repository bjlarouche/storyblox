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
	else parts.push(`default ${typeOf(fallback) === "string" ? `"${fallback}"` : tostring(fallback)}`);
	const line = parts.join(" · ");
	return spec?.description !== undefined ? `${line}\n${spec.description}` : line;
}
