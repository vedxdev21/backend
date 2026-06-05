import multer from 'multer';
import path from 'path';
import { UPLOAD } from '../config/constants';

// Use memory storage — files go to Cloudinary, not disk
const storage = multer.memoryStorage();

const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowed = UPLOAD.ALLOWED_TYPES as readonly string[];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed. Allowed: ${allowed.join(', ')}`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: UPLOAD.MAX_FILE_SIZE,
  },
});

// Preset upload configurations
export const uploadSingle = upload.single('image');
export const uploadPropertyPhotos = upload.array('photos', UPLOAD.MAX_PROPERTY_PHOTOS);
export const uploadMessPhotos = upload.array('photos', UPLOAD.MAX_MESS_PHOTOS);
export const uploadRoomPhotos = upload.array('photos', UPLOAD.MAX_ROOM_PHOTOS);
export const uploadProfilePhoto = upload.single('profilePhoto');
