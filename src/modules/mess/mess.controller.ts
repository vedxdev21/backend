import { Request, Response } from 'express';
import * as messService from './mess.service';
import { sendSuccess, sendCreated, sendError } from '../../utils/response.util';
import { t } from '../../utils/i18n.util';
import { p } from '../../utils/param.util';

export const register = async (req: Request, res: Response) => {
  try { const mess = await messService.registerMess(req.user!.id, req.body); sendCreated(res, mess, t('mess.registered', req.language)); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const browse = async (req: Request, res: Response) => {
  try { const result = await messService.browseMessListings(req.query); sendSuccess(res, result.listings, 'Mess listings fetched', 200, result.meta); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const getById = async (req: Request, res: Response) => {
  try { const mess = await messService.getMessById(p(req.params.id)); sendSuccess(res, mess); }
  catch (err: any) { sendError(res, t(err.message, req.language), err.statusCode || 500); }
};
export const update = async (req: Request, res: Response) => {
  try { const mess = await messService.updateMess(p(req.params.id), req.user!.id, req.body); sendSuccess(res, mess, t('mess.updated', req.language)); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const remove = async (req: Request, res: Response) => {
  try { await messService.deleteMess(p(req.params.id), req.user!.id); sendSuccess(res, null, 'Mess deleted'); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const updateMenu = async (req: Request, res: Response) => {
  try { const menu = await messService.updateMenu(req.user!.id, req.body); sendSuccess(res, menu, t('mess.menu_updated', req.language)); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const getMenu = async (req: Request, res: Response) => {
  try { const menus = await messService.getMenu(p(req.params.id), req.query.date as string); sendSuccess(res, menus); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const toggleSave = async (req: Request, res: Response) => {
  try { const result = await messService.toggleSave(p(req.params.id), req.user!.id); sendSuccess(res, result, result.saved ? t('mess.saved', req.language) : t('mess.unsaved', req.language)); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const getSaved = async (req: Request, res: Response) => {
  try { const saved = await messService.getSaved(req.user!.id); sendSuccess(res, saved); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const dashboard = async (req: Request, res: Response) => {
  try { const data = await messService.getDashboard(req.user!.id); sendSuccess(res, data); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
