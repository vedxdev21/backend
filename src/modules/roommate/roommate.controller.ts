import { Request, Response } from 'express';
import * as roommateService from './roommate.service';
import { sendSuccess, sendCreated, sendError } from '../../utils/response.util';
import { t } from '../../utils/i18n.util';
import { p } from '../../utils/param.util';

export const browse = async (req: Request, res: Response) => {
  try {
    const result = await roommateService.browseProfiles(req.user?.id || null, req.query);
    sendSuccess(res, result.profiles, 'Profiles fetched', 200, result.meta);
  }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const getById = async (req: Request, res: Response) => {
  try { const profile = await roommateService.getProfileById(p(req.params.id), req.user?.id); sendSuccess(res, profile); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const create = async (req: Request, res: Response) => {
  try { const profile = await roommateService.createProfile(req.user!.id, req.body); sendCreated(res, profile, t('roommate.profile_created', req.language)); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const update = async (req: Request, res: Response) => {
  try { const profile = await roommateService.updateProfile(req.user!.id, req.body); sendSuccess(res, profile, t('roommate.profile_updated', req.language)); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const remove = async (req: Request, res: Response) => {
  try { await roommateService.deleteProfile(req.user!.id); sendSuccess(res, null, 'Profile deleted'); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const sendInterest = async (req: Request, res: Response) => {
  try { const interest = await roommateService.sendInterest(req.user!.id, p(req.params.id), req.body.message); sendCreated(res, interest, t('roommate.interest_sent', req.language)); }
  catch (err: any) { sendError(res, t(err.message, req.language), err.statusCode || 500); }
};
export const respondToInterest = async (req: Request, res: Response) => {
  try { const result = await roommateService.respondToInterest(p(req.params.id), req.user!.id, req.body.status); const msgKey = req.body.status === 'ACCEPTED' ? 'roommate.interest_accepted' : 'roommate.interest_declined'; sendSuccess(res, result, t(msgKey, req.language)); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const getInterests = async (req: Request, res: Response) => {
  try { const interests = await roommateService.getInterests(req.user!.id); sendSuccess(res, interests); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const getConnections = async (req: Request, res: Response) => {
  try { const connections = await roommateService.getConnections(req.user!.id); sendSuccess(res, connections); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const browseGroups = async (req: Request, res: Response) => {
  try { const groups = await roommateService.browseGroups(req.query); sendSuccess(res, groups); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const createGroup = async (req: Request, res: Response) => {
  try { const group = await roommateService.createGroup(req.user!.id, req.body); sendCreated(res, group, 'Group created'); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const joinGroup = async (req: Request, res: Response) => {
  try { const result = await roommateService.joinGroup(p(req.params.id), req.user!.id); sendSuccess(res, result, 'Joined group'); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const leaveGroup = async (req: Request, res: Response) => {
  try { await roommateService.leaveGroup(p(req.params.id), req.user!.id); sendSuccess(res, null, 'Left group'); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
