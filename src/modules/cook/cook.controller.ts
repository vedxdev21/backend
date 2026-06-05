import { Request, Response } from 'express';
import * as cookService from './cook.service';
import { sendSuccess, sendCreated, sendError } from '../../utils/response.util';
import { t } from '../../utils/i18n.util';
import { p } from '../../utils/param.util';

export const register = async (req: Request, res: Response) => {
  try { const cook = await cookService.registerCook(req.user!.id, req.body); sendCreated(res, cook, t('cook.registered', req.language)); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const browse = async (req: Request, res: Response) => {
  try { const result = await cookService.browseCooks(req.query); sendSuccess(res, result.cooks, 'Cooks fetched', 200, result.meta); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const getById = async (req: Request, res: Response) => {
  try { const cook = await cookService.getCookById(p(req.params.id)); sendSuccess(res, cook); }
  catch (err: any) { sendError(res, t(err.message, req.language), err.statusCode || 500); }
};
export const update = async (req: Request, res: Response) => {
  try { const cook = await cookService.updateCook(p(req.params.id), req.user!.id, req.body); sendSuccess(res, cook, t('cook.updated', req.language)); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const remove = async (req: Request, res: Response) => {
  try { await cookService.deleteCook(p(req.params.id), req.user!.id); sendSuccess(res, null, 'Cook deleted'); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const toggleSave = async (req: Request, res: Response) => {
  try { const result = await cookService.toggleSave(p(req.params.id), req.user!.id); sendSuccess(res, result, result.saved ? t('cook.saved', req.language) : t('cook.unsaved', req.language)); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const getSaved = async (req: Request, res: Response) => {
  try { const saved = await cookService.getSaved(req.user!.id); sendSuccess(res, saved); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const dashboard = async (req: Request, res: Response) => {
  try { const data = await cookService.getDashboard(req.user!.id); sendSuccess(res, data); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
