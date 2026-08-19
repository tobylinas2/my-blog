from pathlib import Path

from PIL import Image, ImageFilter, ImageStat


ROOT = Path(__file__).resolve().parents[1]
IMAGES = [
    ROOT / "public/images/mcedia-watercolor.png",
    ROOT / "public/images/tobys-camera-watercolor.png",
]


def smoothstep(value: float, low: float, high: float) -> int:
    position = max(0.0, min(1.0, (value - low) / (high - low)))
    return round(position * position * (3 - 2 * position) * 255)


def background_color(image: Image.Image) -> tuple[float, float, float]:
    width, height = image.size
    side = max(32, min(width, height) // 12)
    corners = [
        image.crop((0, 0, side, side)),
        image.crop((width - side, 0, width, side)),
        image.crop((0, height - side, side, height)),
        image.crop((width - side, height - side, width, height)),
    ]
    channels = zip(*(ImageStat.Stat(corner).mean for corner in corners))
    return tuple(sum(channel) / len(corners) for channel in channels)


def remove_background(path: Path) -> None:
    source = Image.open(path).convert("RGB")
    background = background_color(source)
    alpha = Image.new("L", source.size)
    alpha.putdata([
        smoothstep(
            sum((channel - reference) ** 2 for channel, reference in zip(pixel, background)) ** 0.5,
            16,
            88,
        )
        for pixel in source.get_flattened_data()
    ])
    alpha = alpha.filter(ImageFilter.GaussianBlur(radius=0.7))
    output = source.copy()
    output.putalpha(alpha)
    output.save(path)
    print(f"Processed {path.name}; sampled background: {background}")


for image in IMAGES:
    remove_background(image)
