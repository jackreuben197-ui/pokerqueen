from PIL import Image, ImageDraw
import os

# 配置
INPUT_DIR = r"E:\AiCode\pokerqueen\assets\new_texture\game\table"
TARGET_SIZE = (88, 171)  # (width, height)
CORNER_RADIUS = 20  # 圆角半径


def center_crop_and_resize(img, target_w, target_h):
    """居中裁剪并缩放到目标尺寸"""
    original_w, original_h = img.size

    # 计算目标宽高比
    target_ratio = target_w / target_h
    original_ratio = original_w / original_h

    if original_ratio > target_ratio:
        # 原图更宽，裁剪左右
        new_w = int(original_h * target_ratio)
        left = (original_w - new_w) // 2
        right = left + new_w
        img = img.crop((left, 0, right, original_h))
    else:
        # 原图更高，裁剪上下
        new_h = int(original_w / target_ratio)
        top = (original_h - new_h) // 2
        bottom = top + new_h
        img = img.crop((0, top, original_w, bottom))

    # 缩放到目标尺寸（Lanczos 高质量缩放）
    return img.resize((target_w, target_h), Image.Resampling.LANCZOS)


def add_rounded_corners(img, radius):
    """添加圆角效果"""
    w, h = img.size
    # 创建圆角 mask
    mask = Image.new("L", (w, h), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle([(0, 0), (w, h)], radius=radius, fill=255)
    # 应用到 alpha 通道
    img = img.convert("RGBA")
    img.putalpha(mask)
    return img


def main():
    # 处理 desk1.png 到 desk13.png
    for i in range(1, 14):
        input_name = f"desk{i}.png"
        output_name = f"table{i + 1}.png"  # desk1 -> table2, desk2 -> table3...

        input_path = os.path.join(INPUT_DIR, input_name)
        output_path = os.path.join(INPUT_DIR, output_name)

        if not os.path.exists(input_path):
            print(f"跳过: {input_name} 不存在")
            continue

        print(f"处理中: {input_name} -> {output_name}")

        # 打开图片
        img = Image.open(input_path)

        # 1. 居中裁剪并缩放到 88x171
        img = center_crop_and_resize(img, TARGET_SIZE[0], TARGET_SIZE[1])

        # 2. 添加圆角
        img = add_rounded_corners(img, CORNER_RADIUS)

        # 3. 保存
        img.save(output_path, "PNG")
        print(f"  完成: {output_path}")

    print("\n全部处理完成!")


if __name__ == "__main__":
    main()
