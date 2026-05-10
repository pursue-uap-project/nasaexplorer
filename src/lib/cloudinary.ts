const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";

export function cloudinaryUrl(
  publicId: string,
  opts: { width?: number; quality?: string } = {}
) {
  const transforms = [
    opts.width ? `w_${opts.width}` : null,
    `q_${opts.quality ?? "auto"}`,
    "f_auto",
  ]
    .filter(Boolean)
    .join(",");

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms}/${publicId}`;
}
