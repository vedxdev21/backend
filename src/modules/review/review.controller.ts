import { Request, Response } from 'express';
import * as reviewService from './review.service';
import { sendSuccess, sendCreated, sendError } from '../../utils/response.util';
import { t } from '../../utils/i18n.util';
import { p } from '../../utils/param.util';

export const getReviews = async (req: Request, res: Response) => {
  try { const result = await reviewService.getReviews(p(req.params.targetType), p(req.params.targetId), req.query); sendSuccess(res, result); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const create = async (req: Request, res: Response) => {
  try { const review = await reviewService.createReview(req.user!.id, req.body); sendCreated(res, review, t('review.created', req.language)); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const update = async (req: Request, res: Response) => {
  try { const review = await reviewService.updateReview(p(req.params.id), req.user!.id, req.body); sendSuccess(res, review, t('review.updated', req.language)); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const remove = async (req: Request, res: Response) => {
  try { await reviewService.deleteReview(p(req.params.id), req.user!.id); sendSuccess(res, null, t('review.deleted', req.language)); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
