export function storyLanguage(source: string) {
	return source.sub(1, 40).find("Compiled with roblox-ts", 1, true)[0] !== undefined ? "TS" : "Luau";
}

export function storyLabel(title: string, renderer?: string, language?: string) {
	const crumbs = title.split("/").join(" › ");
	const badges = [renderer === "native" ? "native" : "react"];
	if (language !== undefined) badges.push(language);
	return `${crumbs}  ·  ${badges.join(" · ")}`;
}
