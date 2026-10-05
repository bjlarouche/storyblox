import { AssetService } from "@rbxts/services";

const FRAME_SIZE = 64;

type ContentApi = { fromObject: (object: EditableImage) => unknown };
type ImageWithContent = ImageLabel & { ImageContent: unknown };
type AssetServiceCreate = AssetService & {
	CreateEditableImage: (options: { Size: Vector2 }) => EditableImage;
};

declare const Content: ContentApi;

function createBlankEditableImage(size = FRAME_SIZE): EditableImage {
	return (AssetService as AssetServiceCreate).CreateEditableImage({ Size: new Vector2(size, size) });
}

export function paintReelFrame(image: EditableImage, frameIndex: number, frameCount: number, size = FRAME_SIZE): void {
	const pixels: number[] = [];
	const cx = math.floor(((size - 16) * frameIndex) / math.max(frameCount - 1, 1)) + 8;
	const cy = math.floor(size / 2);
	const radius = 10;

	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			let r = 28;
			let g = 32;
			let b = 48;
			const a = 255;

			if (x < 5 || x >= size - 5) {
				const hole = y % 10 < 5;
				r = hole ? 18 : 210;
				g = hole ? 18 : 210;
				b = hole ? 22 : 220;
			} else {
				const dx = x - cx;
				const dy = y - cy;
				if (dx * dx + dy * dy <= radius * radius) {
					r = 255;
					g = 170 + frameIndex * 20;
					b = 40;
				} else if (y > size - 14 && y < size - 6 && x > 8 && x < size - 8) {
					r = 70;
					g = 90;
					b = 130;
				}
			}

			pixels.push(r, g, b, a);
		}
	}

	const buf = buffer.create(size * size * 4);
	for (let i = 0; i < pixels.size(); i++) {
		buffer.writeu8(buf, i, pixels[i]);
	}
	image.WritePixelsBuffer(Vector2.zero, new Vector2(size, size), buf);
}

export function createReelFrames(frameCount: number, size = FRAME_SIZE): EditableImage[] {
	const count = math.clamp(math.floor(frameCount), 2, 8);
	const frames: EditableImage[] = [];
	for (let i = 0; i < count; i++) {
		const image = createBlankEditableImage(size);
		paintReelFrame(image, i, count, size);
		frames.push(image);
	}
	return frames;
}

export function destroyReelFrames(frames: EditableImage[]): void {
	for (const frame of frames) {
		frame.Destroy();
	}
	frames.clear();
}

export function showReelFrame(label: ImageLabel, frames: EditableImage[], index: number): void {
	const frame = frames[index];
	if (!frame) return;
	(label as ImageWithContent).ImageContent = Content.fromObject(frame);
}

export const REEL_FRAME_SIZE = FRAME_SIZE;
