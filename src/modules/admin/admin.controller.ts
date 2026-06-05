import { Request, Response } from 'express';
import * as adminService from './admin.service';
import { sendSuccess, sendCreated, sendError } from '../../utils/response.util';

// Helper to extract param as string (Express 5 compat)
const p = (val: string | string[]): string => Array.isArray(val) ? val[0] : val;

const h = (fn: Function) => async (req: Request, res: Response) => {
  try { const result = await fn(req); sendSuccess(res, result); } catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};

export const login = async (req: Request, res: Response) => {
  try { const result = await adminService.adminLogin(req.body.email, req.body.password); sendSuccess(res, result); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};

export const dashboard = h(() => adminService.getDashboard());
export const getUsers = h((req: Request) => adminService.getUsers(req.query));
export const getUserDetail = h((req: Request) => adminService.getUserDetail(p(req.params.id)));
export const verifyUser = h((req: Request) => adminService.verifyUser(p(req.params.id)));
export const blockUser = h((req: Request) => adminService.blockUser(p(req.params.id), req.body.block ?? true));
export const deleteUser = h((req: Request) => adminService.deleteUser(p(req.params.id)));

export const getProperties = h((req: Request) => adminService.getProperties(req.query));
export const approveProperty = h((req: Request) => adminService.approveProperty(p(req.params.id)));
export const rejectProperty = h((req: Request) => adminService.rejectProperty(p(req.params.id)));
export const featureProperty = h((req: Request) => adminService.featureProperty(p(req.params.id), req.body.featured ?? true));
export const deleteProperty = h((req: Request) => adminService.deleteProperty(p(req.params.id)));

export const getMess = h((req: Request) => adminService.getMessListings(req.query));
export const verifyMess = h((req: Request) => adminService.verifyMess(p(req.params.id)));
export const deleteMess = h((req: Request) => adminService.deleteMess(p(req.params.id)));

export const getCooks = h((req: Request) => adminService.getCooks(req.query));
export const verifyCook = h((req: Request) => adminService.verifyCook(p(req.params.id)));
export const deleteCook = h((req: Request) => adminService.deleteCook(p(req.params.id)));

export const getReviews = h((req: Request) => adminService.getReviews(req.query));
export const hideReview = h((req: Request) => adminService.hideReview(p(req.params.id)));
export const featureReview = h((req: Request) => adminService.featureReview(p(req.params.id)));
export const deleteReview = h((req: Request) => adminService.deleteReview(p(req.params.id)));

export const getReports = h((req: Request) => adminService.getReports(req.query));
export const updateReport = h((req: Request) => adminService.updateReport(p(req.params.id), req.body));

export const sendNotification = async (req: Request, res: Response) => {
  try { const result = await adminService.sendNotification(req.body); sendCreated(res, result); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};

export const analytics = h(() => adminService.getAnalytics());
export const comingSoonStats = h(() => adminService.getComingSoonStats());
export const getSettings = h(() => adminService.getSettings());
export const updateSettings = h((req: Request) => adminService.updateSettings(req.body.key, req.body.value));
