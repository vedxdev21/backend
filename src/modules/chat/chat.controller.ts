import { Request, Response } from 'express';
import * as chatService from './chat.service';
import { sendSuccess, sendCreated, sendError } from '../../utils/response.util';
import { p } from '../../utils/param.util';

export const getConversations = async (req: Request, res: Response) => {
  try { const convs = await chatService.getConversations(req.user!.id); sendSuccess(res, convs); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const getMessages = async (req: Request, res: Response) => {
  try { const result = await chatService.getMessages(p(req.params.id), req.user!.id, req.query); sendSuccess(res, result.messages, 'Messages fetched', 200, result.meta); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const startConversation = async (req: Request, res: Response) => {
  try { const conv = await chatService.startConversation(req.user!.id, req.body); sendCreated(res, conv); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
export const sendMessage = async (req: Request, res: Response) => {
  try { const msg = await chatService.sendMessage(p(req.params.id), req.user!.id, req.body); sendCreated(res, msg); }
  catch (err: any) { sendError(res, err.message, err.statusCode || 500); }
};
