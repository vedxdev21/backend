import { Request, Response } from 'express';
import * as authService from './auth.service';
import { sendSuccess, sendCreated, sendError } from '../../utils/response.util';
import { t } from '../../utils/i18n.util';

export const register = async (req: Request, res: Response) => {
  try {
    const result = await authService.registerUser(req.body);
    sendCreated(res, result.user, t(result.message, req.language));
  } catch (err: any) {
    sendError(res, t(err.message, req.language), err.statusCode || 500);
  }
};

export const sendOtp = async (req: Request, res: Response) => {
  try {
    const result = await authService.sendOtpToPhone(req.body.phone);
    sendSuccess(res, null, t(result.message, req.language, { phone: req.body.phone }));
  } catch (err: any) {
    sendError(res, t(err.message, req.language), err.statusCode || 500);
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const result = await authService.verifyOtp(req.body.phone, req.body.otp);
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    sendSuccess(res, {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    }, t('auth.otp_verified', req.language));
  } catch (err: any) {
    sendError(res, t(err.message, req.language), err.statusCode || 500);
  }
};

export const loginPhone = async (req: Request, res: Response) => {
  try {
    const result = await authService.loginWithPhone(req.body.phone, req.body.otp);
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    sendSuccess(res, {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    }, t('auth.login_success', req.language));
  } catch (err: any) {
    sendError(res, t(err.message, req.language), err.statusCode || 500);
  }
};

export const loginEmail = async (req: Request, res: Response) => {
  try {
    const result = await authService.loginWithEmail(req.body.email, req.body.password);
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    sendSuccess(res, {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    }, t('auth.login_success', req.language));
  } catch (err: any) {
    sendError(res, t(err.message, req.language), err.statusCode || 500);
  }
};

export const googleAuth = async (req: Request, res: Response) => {
  try {
    const result = await authService.loginWithGoogle(req.body.idToken);
    if ('accessToken' in result) {
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    }
    sendSuccess(res, result, t('auth.login_success', req.language));
  } catch (err: any) {
    sendError(res, t(err.message, req.language), err.statusCode || 500);
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken || req.body.refreshToken;
    if (!token) {
      sendError(res, 'Refresh token is required', 400);
      return;
    }
    const result = await authService.refreshAccessToken(token);
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    sendSuccess(res, { accessToken: result.accessToken }, t('auth.token_refreshed', req.language));
  } catch (err: any) {
    sendError(res, err.message, err.statusCode || 500);
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const result = await authService.forgotPassword(req.body.phone);
    sendSuccess(res, null, result.message);
  } catch (err: any) {
    sendError(res, err.message, err.statusCode || 500);
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const result = await authService.resetPassword(req.body.phone, req.body.otp, req.body.newPassword);
    sendSuccess(res, null, t(result.message, req.language));
  } catch (err: any) {
    sendError(res, t(err.message, req.language), err.statusCode || 500);
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const result = await authService.logoutUser(req.user!.id);
    res.clearCookie('refreshToken');
    sendSuccess(res, null, t(result.message, req.language));
  } catch (err: any) {
    sendError(res, err.message, err.statusCode || 500);
  }
};
