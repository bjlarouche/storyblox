const { acceptGeneration, nextGeneration } = await import("../src/packages/ui/storyblox/storyGeneration.ts");

const first = nextGeneration(0);
const second = nextGeneration(first);
if (first !== 1 || second !== 2) throw new Error("generation did not advance");
if (!acceptGeneration(second, second, false)) throw new Error("completed generation was dropped");
if (acceptGeneration(first, second, false)) throw new Error("stale generation was accepted");
if (acceptGeneration(second, second, true)) throw new Error("failed generation advanced");
console.log("story generation ok");
