import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export async function uploadToCloudinary(
  buffer: Buffer,
  options: { folder: string; resource_type: "image" | "raw"; public_id?: string }
): Promise<{ publicId: string; secureUrl: string }> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ ...options }, (err, result) => {
        if (err || !result) return reject(err ?? new Error("Upload failed"));
        resolve({ publicId: result.public_id, secureUrl: result.secure_url });
      })
      .end(buffer);
  });
}

/** Signed URL for private PDFs (raw resource type), valid for 1 hour by default. */
export function getSignedDownloadUrl(publicId: string, expiresInSeconds = 3600): string {
  return cloudinary.utils.private_download_url(publicId, "pdf", {
    expires_at: Math.floor(Date.now() / 1000) + expiresInSeconds,
    attachment: false,
  });
}
