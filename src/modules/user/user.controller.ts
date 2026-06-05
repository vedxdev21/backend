import { Request, Response } from 'express';
import * as userService from './user.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { t } from '../../utils/i18n.util';
import { p } from '../../utils/param.util';
import { uploadToCloudinary } from '../../config/cloudinary';

export const setupProfile = async (req: Request, res: Response) => {
  try { const user = await userService.setupProfile(req.user!.id, req.body); sendSuccess(res, user, t('profile.setup_complete', req.language)); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const getMe = async (req: Request, res: Response) => {
  try { const user = await userService.getProfile(req.user!.id); sendSuccess(res, user); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const updateProfile = async (req: Request, res: Response) => {
  try { const user = await userService.updateProfile(req.user!.id, req.body); sendSuccess(res, user, t('profile.updated', req.language)); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const updateLocation = async (req: Request, res: Response) => {
  try { const { lat, lng, city, area } = req.body; const user = await userService.updateLocation(req.user!.id, lat, lng, city, area); sendSuccess(res, user); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const updateLanguage = async (req: Request, res: Response) => {
  try { const { language } = req.body; const user = await userService.updateLanguage(req.user!.id, language); sendSuccess(res, user); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const getPublicProfile = async (req: Request, res: Response) => {
  try { const user = await userService.getPublicProfile(p(req.params.id)); sendSuccess(res, user); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const getStats = async (req: Request, res: Response) => {
  try { const stats = await userService.getUserStats(req.user!.id); sendSuccess(res, stats); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};

export const uploadImage = async (req: Request, res: Response) => {
  try {
    if (!req.file?.buffer) {
      sendError(res, 'Image file is required', 400);
      return;
    }

    const folder = req.body?.folder || `projectx/users/${req.user!.id}`;
    const uploaded = await uploadToCloudinary(req.file.buffer, folder, req.file.mimetype);

    sendSuccess(res, {
      imageUrl: uploaded.url,
      imageId: uploaded.publicId,
      publicId: uploaded.publicId,
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype,
    }, 'Image uploaded successfully');
  } catch (err: any) {
    sendError(res, err.message, err.statusCode || 500);
  }
};
