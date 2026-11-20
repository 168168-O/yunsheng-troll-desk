"""生成 PWA 图标：192 / 512 两张巨魔头，无外部位图依赖。
用法：python tools/make-icons.py
"""
import os
from PIL import Image, ImageDraw

BG = (11, 22, 7, 255)
GREEN = (111, 191, 42, 255)
GREEN_DARK = (90, 166, 31, 255)
PINK = (255, 79, 216, 255)
INK = (11, 22, 7, 255)
WHITE = (255, 255, 255, 255)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "troll-app", "icons")


def draw_troll(size: int) -> Image.Image:
    S = size * 4  # 4x 超采样后缩放，边缘干净
    img = Image.new("RGBA", (S, S), BG)
    d = ImageDraw.Draw(img)
    cx = cy = S // 2
    u = S / 100.0

    # 头
    d.ellipse([cx - 36 * u, cy - 32 * u, cx + 36 * u, cy + 32 * u], fill=GREEN, outline=INK, width=int(3 * u))
    # 耳
    d.ellipse([cx - 48 * u, cy - 22 * u, cx - 20 * u, cy + 6 * u], fill=GREEN_DARK, outline=INK, width=int(2 * u))
    d.ellipse([cx + 20 * u, cy - 22 * u, cx + 48 * u, cy + 6 * u], fill=GREEN_DARK, outline=INK, width=int(2 * u))
    # 眼
    d.ellipse([cx - 17 * u, cy - 10 * u, cx - 7 * u, cy], fill=INK)
    d.ellipse([cx + 7 * u, cy - 10 * u, cx + 17 * u, cy], fill=INK)
    d.ellipse([cx - 15 * u, cy - 9 * u, cx - 11 * u, cy - 5 * u], fill=WHITE)
    d.ellipse([cx + 9 * u, cy - 9 * u, cx + 13 * u, cy - 5 * u], fill=WHITE)
    # 咧嘴：黑色大开口
    d.ellipse([cx - 23 * u, cy + 4 * u, cx + 23 * u, cy + 29 * u], fill=INK)
    # 上排獠牙
    for dx in (-15, -5, 5, 15):
        d.polygon([(cx + (dx - 4) * u, cy + 6 * u), (cx + (dx + 4) * u, cy + 6 * u),
                   (cx + dx * u, cy + 18 * u)], fill=WHITE)
    # 舌头
    d.ellipse([cx - 9 * u, cy + 19 * u, cx + 9 * u, cy + 28 * u], fill=PINK)
    # 粉角
    d.polygon([(cx, cy - 40 * u), (cx - 6 * u, cy - 30 * u), (cx + 6 * u, cy - 30 * u)], fill=PINK, outline=INK)

    return img.resize((size, size), Image.LANCZOS)


def main():
    os.makedirs(OUT, exist_ok=True)
    for s in (192, 512):
        p = os.path.join(OUT, f"icon-{s}.png")
        draw_troll(s).save(p, "PNG", optimize=True)
        print(f"{p}  {os.path.getsize(p)} bytes")


if __name__ == "__main__":
    main()
