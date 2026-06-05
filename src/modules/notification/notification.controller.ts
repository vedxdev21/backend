import { Request, Response } from 'express';
import * as notifService from './notification.service';
import { sendSuccess, sendError } from '../../utils/response.util';
import { t } from '../../utils/i18n.util';
import { p } from '../../utils/param.util';

export const getAll = async (req: Request, res: Response) => {
  try { const result = await notifService.getNotifications(req.user!.id, req.query); sendSuccess(res, result.notifications, 'Notifications', 200, result.meta); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const getUnreadCount = async (req: Request, res: Response) => {
  try { const count = await notifService.getUnreadCount(req.user!.id); sendSuccess(res, { count }); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const markRead = async (req: Request, res: Response) => {
  try { await notifService.markAsRead(p(req.params.id), req.user!.id); sendSuccess(res, null, t('notification.marked_read', req.language)); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const markAllRead = async (req: Request, res: Response) => {
  try { await notifService.markAllRead(req.user!.id); sendSuccess(res, null, t('notification.all_read', req.language)); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
