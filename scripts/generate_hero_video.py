import os
import subprocess
import math
from PIL import Image, ImageEnhance

img_path = "/home/zaswear/projects/apps/web/nasaexplorer/public/assets/hero_ref.png"
out_mp4 = "/home/zaswear/projects/apps/web/nasaexplorer/public/assets/hero_space.mp4"

if not os.path.exists(img_path):
    raise FileNotFoundError(f"Image not found at {img_path}")

base_img = Image.open(img_path).convert("RGB")
orig_w, orig_h = base_img.size

target_w, target_h = 1920, 1080
fps = 60
duration = 10
total_frames = fps * duration

ffmpeg_cmd = [
    "ffmpeg", "-y",
    "-f", "rawvideo",
    "-vcodec", "rawvideo",
    "-s", f"{target_w}x{target_h}",
    "-pix_fmt", "rgb24",
    "-r", str(fps),
    "-i", "-",
    "-c:v", "libx264",
    "-preset", "fast",
    "-crf", "18",
    "-pix_fmt", "yuv420p",
    out_mp4
]

proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE)

for frame_idx in range(total_frames):
    t = frame_idx / float(total_frames)  # 0.0 to 1.0
    
    # Smooth easing curve
    progress = 0.5 - 0.5 * math.cos(t * math.pi)
    
    # Dynamic camera zoom and pan
    zoom = 1.0 + 0.22 * math.sin(progress * math.pi)
    crop_w = orig_w / zoom
    crop_h = orig_h / zoom
    
    # Pan across image
    pan_x = (orig_w - crop_w) * (0.15 + 0.7 * progress)
    pan_y = (orig_h - crop_h) * (0.25 + 0.5 * math.sin(progress * math.pi * 2))
    
    box = (int(pan_x), int(pan_y), int(pan_x + crop_w), int(pan_y + crop_h))
    cropped = base_img.crop(box)
    resized = cropped.resize((target_w, target_h), Image.Resampling.LANCZOS)
    
    # Subtle brightness / glow variation during orbit
    enhancer = ImageEnhance.Brightness(resized)
    glow_factor = 1.0 + 0.06 * math.sin(t * math.pi * 4)
    final_frame = enhancer.enhance(glow_factor)
    
    proc.stdin.write(final_frame.tobytes())

proc.stdin.close()
proc.wait()
print(f"Video generated successfully: {out_mp4}")
