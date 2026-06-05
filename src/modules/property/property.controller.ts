import { Request, Response } from 'express';
import * as propertyService from './property.service';
import { sendSuccess, sendCreated, sendError } from '../../utils/response.util';
import { t } from '../../utils/i18n.util';
import { p } from '../../utils/param.util';

export const create = async (req: Request, res: Response) => {
  try { const property = await propertyService.createProperty(req.user!.id, req.body); sendCreated(res, property, t('property.created', req.language)); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const browse = async (req: Request, res: Response) => {
  try { const result = await propertyService.browseProperties(req.query); sendSuccess(res, result.properties, 'Properties fetched', 200, result.meta); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const getById = async (req: Request, res: Response) => {
  try { const property = await propertyService.getPropertyById(p(req.params.id)); sendSuccess(res, property); }
  catch (err: any) { sendError(res, t(err.message, req.language), err.statusCode || 500); }
};
export const update = async (req: Request, res: Response) => {
  try { const property = await propertyService.updateProperty(p(req.params.id), req.user!.id, req.body); sendSuccess(res, property, t('property.updated', req.language)); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const remove = async (req: Request, res: Response) => {
  try { await propertyService.deleteProperty(p(req.params.id), req.user!.id); sendSuccess(res, null, t('property.deleted', req.language)); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const updateStatus = async (req: Request, res: Response) => {
  try { const property = await propertyService.updatePropertyStatus(p(req.params.id), req.user!.id, req.body.status); sendSuccess(res, property, t('property.status_updated', req.language)); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const myListings = async (req: Request, res: Response) => {
  try { const listings = await propertyService.getMyListings(req.user!.id, req.query.status as string); sendSuccess(res, { properties: listings }); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const toggleSave = async (req: Request, res: Response) => {
  try { const result = await propertyService.toggleSave(p(req.params.id), req.user!.id); sendSuccess(res, result, result.saved ? t('property.saved', req.language) : t('property.unsaved', req.language)); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const getSaved = async (req: Request, res: Response) => {
  try { const properties = await propertyService.getSavedProperties(req.user!.id); sendSuccess(res, properties); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const sendInquiry = async (req: Request, res: Response) => {
  try { const inquiry = await propertyService.sendInquiry(p(req.params.id), req.user!.id, req.body.message); sendCreated(res, inquiry, t('property.inquiry_sent', req.language)); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const getInquiries = async (req: Request, res: Response) => {
  try { const inquiries = await propertyService.getInquiries(p(req.params.id), req.user!.id); sendSuccess(res, inquiries); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const showNumber = async (req: Request, res: Response) => {
  try { const result = await propertyService.showNumber(p(req.params.id), req.user!.id); sendSuccess(res, result); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const compare = async (req: Request, res: Response) => {
  try { const ids = (req.query.ids as string)?.split(',') || []; const properties = await propertyService.compareProperties(ids); sendSuccess(res, properties); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const createAlert = async (req: Request, res: Response) => {
  try { const alert = await propertyService.createAlert(req.user!.id, req.body); sendCreated(res, alert, t('property.alert_created', req.language)); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const getAlerts = async (req: Request, res: Response) => {
  try { const alerts = await propertyService.getAlerts(req.user!.id); sendSuccess(res, alerts); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const deleteAlert = async (req: Request, res: Response) => {
  try { await propertyService.deleteAlert(p(req.params.id), req.user!.id); sendSuccess(res, null, 'Alert deleted'); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const ownerDashboard = async (req: Request, res: Response) => {
  try { const dashboard = await propertyService.getOwnerDashboard(req.user!.id); sendSuccess(res, dashboard); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
