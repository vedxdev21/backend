import { v2 as cloudinary } from 'cloudinary';
import { env } from './env';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

export const uploadToCloudinary = async (
  file: string | Buffer,
  folder: string = 'projectx',
  mimeType: string = 'application/octet-stream'
): Promise<{ url: string; publicId: string }> => {
  const uploadSource = Buffer.isBuffer(file)
    ? `data:${mimeType};base64,${file.toString('base64')}`
    : file;

  const result = await cloudinary.uploader.upload(uploadSource, {
    folder,
    resource_type: 'auto',
    transformation: [
      { width: 1200, height: 1200, crop: 'limit' },
      { quality: 'auto', fetch_format: 'auto' },
    ],
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
  };
};

export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  await cloudinary.uploader.destroy(publicId);
};
