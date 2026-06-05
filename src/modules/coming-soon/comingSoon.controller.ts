import { Request, Response } from 'express';
import * as csService from './comingSoon.service';
import { sendSuccess, sendCreated, sendError } from '../../utils/response.util';
import { t } from '../../utils/i18n.util';
import { p } from '../../utils/param.util';

export const getAll = async (_req: Request, res: Response) => {
  try { const services = await csService.getAllServices(); sendSuccess(res, services); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const getDetail = async (req: Request, res: Response) => {
  try { const service = await csService.getServiceDetail(p(req.params.serviceId)); sendSuccess(res, service); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const notifyMe = async (req: Request, res: Response) => {
  try {
    const serviceId = p(req.params.serviceId);
    const signup = await csService.notifyMe(serviceId, { ...req.body, userId: req.user?.id });
    sendCreated(res, signup, t('coming_soon.signed_up', req.language, { service: serviceId }));
  } catch (err: any) { sendError(res, t(err.message, req.language, { service: p(req.params.serviceId) }), err.statusCode || 500); }
};
