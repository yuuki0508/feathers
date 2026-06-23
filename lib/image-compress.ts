import sharp from "sharp";

const MAX_DIMENSION = 1920;
const JPEG_QUALITY = 82;

export type CompressedImage = {
  buffer: Buffer;
  contentType: string;
  extension: string;
};

/** 思い出写真を Storage 保存用にリサイズ・JPEG 圧縮する */
export async function compressMemoryPhoto(input: Buffer): Promise<CompressedImage> {
  const buffer = await sharp(input)
    .rotate()
    .resize(MAX_DIMENSION, MAX_DIMENSION, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer();

  return {
    buffer,
    contentType: "image/jpeg",
    extension: "jpg",
  };
}
