const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 0.82;
/** Vercel Serverless のボディ上限（4.5MB）に余裕を持たせる */
export const MAX_UPLOAD_BYTES = 3.5 * 1024 * 1024;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("画像を読み込めませんでした"));
    };
    img.src = url;
  });
}

/** ブラウザ上でリサイズ・JPEG 圧縮してからアップロードする */
export async function compressImageFile(file: File): Promise<File> {
  const isImage =
    file.type.startsWith("image/") ||
    /\.(jpe?g|png|gif|webp|heic|heif)$/i.test(file.name);

  if (!isImage) {
    return file;
  }

  const img = await loadImage(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("画像の処理に失敗しました");
  }

  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY);
  });

  if (!blob) {
    throw new Error("画像の圧縮に失敗しました");
  }

  const baseName = file.name.replace(/\.[^.]+$/, "") || "photo";
  return new File([blob], `${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

export async function compressFormImageField(
  formData: FormData,
  fieldName: string,
  label: string,
): Promise<void> {
  const file = formData.get(fieldName);
  if (!(file instanceof File) || file.size === 0) {
    return;
  }

  const compressed = await compressImageFile(file);
  if (compressed.size > MAX_UPLOAD_BYTES) {
    throw new Error(`${label}が大きすぎます。別の画像をお試しください。`);
  }

  formData.set(fieldName, compressed);
}
