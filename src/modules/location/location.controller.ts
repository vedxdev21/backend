import { Request, Response } from 'express';
import * as locationService from './location.service';
import { sendSuccess } from '../../utils/response.util';
import { p } from '../../utils/param.util';

export const getCities = (_req: Request, res: Response) => {
  sendSuccess(res, locationService.getAllCities());
};

export const getAreas = (req: Request, res: Response) => {
  const areas = locationService.getAreasForCity(p(req.params.city));
  sendSuccess(res, areas);
};

export const detectLocation = async (req: Request, res: Response) => {
  const { lat, lng } = req.body;
  const result = await locationService.detectLocation(lat, lng);
  sendSuccess(res, result);
};

export const getAreaGuide = (req: Request, res: Response) => {
  const guide = locationService.getAreaGuide(p(req.params.city));
  sendSuccess(res, guide);
};
