import prisma from '../../config/database';
import { generateTokenPair } from '../../utils/jwt.util';
import { hashPassword, comparePassword } from '../../utils/password.util';
import { generateOtp, storeOtp, verifyStoredOtp, sendOtp, checkOtpRateLimit } from '../../utils/otp.util';
import { generateReferralCode } from '../../utils/slug.util';
import { JwtUserPayload } from '../../types/common.types';
import { verifyRefreshToken } from '../../utils/jwt.util';
import axios from 'axios';

// ------- Register -------
export const registerUser = async (data: {
  name: string;
  phone: string;
  email?: string;
  password: string;
  interests: string[];
}) => {
  // Check if phone already exists
  const existing = await prisma.user.findUnique({ where: { phone: data.phone } });
  if (existing) {
    throw { statusCode: 409, message: 'auth.phone_exists' };
  }

  const passwordHash = await hashPassword(data.password);
  const referralCode = generateReferralCode(data.name);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email || undefined,
      passwordHash,
      authProvider: 'EMAIL',
      referralCode,
      interests: data.interests || [],
      isPhoneVerified: true, // Bypass OTP by marking verified immediately
    },
  });

  const payload: JwtUserPayload = {
    id: user.id,
    phone: user.phone,
    role: user.role,
    name: user.name,
  };

  const tokens = generateTokenPair(payload);

  // Save the refresh token
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: tokens.refreshToken },
  });

  return {
    user: sanitizeUser(updatedUser),
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    message: 'auth.register_success',
  };
};

// ------- Send OTP -------
export const sendOtpToPhone = async (phone: string) => {
  const canSend = await checkOtpRateLimit(phone);
  if (!canSend) {
    throw { statusCode: 429, message: 'auth.otp_rate_limit' };
  }

  const otp = generateOtp();
  await storeOtp(phone, otp);
  await sendOtp(phone, otp);

  return { message: 'auth.otp_sent' };
};

// ------- Verify OTP -------
export const verifyOtp = async (phone: string, otp: string) => {
  const isValid = await verifyStoredOtp(phone, otp);
  if (!isValid) {
    throw { statusCode: 400, message: 'auth.otp_invalid' };
  }

  // Mark phone as verified
  let user = await prisma.user.findUnique({ where: { phone } });

  if (!user) {
    // Auto-create user if they verify OTP without prior registration (phone-first flow)
    user = await prisma.user.create({
      data: {
        name: 'User',
        phone,
        isPhoneVerified: true,
        authProvider: 'PHONE',
        referralCode: generateReferralCode('User'),
      },
    });
  } else {
    user = await prisma.user.update({
      where: { phone },
      data: { isPhoneVerified: true },
    });
  }

  if (user.isBlocked) {
    throw { statusCode: 403, message: 'auth.account_blocked' };
  }

  const payload: JwtUserPayload = {
    id: user.id,
    phone: user.phone,
    role: user.role,
    name: user.name,
  };

  const tokens = generateTokenPair(payload);

  // Save refresh token
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: tokens.refreshToken },
  });

  return {
    user: sanitizeUser(user),
    ...tokens,
  };
};

// ------- Login with Phone + OTP -------
export const loginWithPhone = async (phone: string, otp: string) => {
  return verifyOtp(phone, otp);
};

// ------- Login with Email + Password -------
export const loginWithEmail = async (email: string, password: string) => {
  const user = await prisma.user.findFirst({ where: { email } });
  if (!user || !user.passwordHash) {
    throw { statusCode: 401, message: 'auth.invalid_credentials' };
  }

  const isMatch = await comparePassword(password, user.passwordHash);
  if (!isMatch) {
    throw { statusCode: 401, message: 'auth.invalid_credentials' };
  }

  if (user.isBlocked) {
    throw { statusCode: 403, message: 'auth.account_blocked' };
  }

  const payload: JwtUserPayload = {
    id: user.id,
    phone: user.phone,
    role: user.role,
    name: user.name,
  };

  const tokens = generateTokenPair(payload);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: tokens.refreshToken },
  });

  return {
    user: sanitizeUser(user),
    ...tokens,
  };
};

// ------- Google OAuth -------
export const loginWithGoogle = async (idToken: string) => {
  // Verify Google ID token
  const googleUser = await verifyGoogleToken(idToken);
  if (!googleUser) {
    throw { statusCode: 401, message: 'Invalid Google token' };
  }

  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId: googleUser.sub }, { email: googleUser.email }] },
  });

  if (!user) {
    // New Google user — will need phone verification later
    return {
      isNewUser: true,
      googleData: {
        googleId: googleUser.sub,
        email: googleUser.email,
        name: googleUser.name,
        picture: googleUser.picture,
      },
      message: 'Phone verification required for new Google users',
    };
  }

  if (user.isBlocked) {
    throw { statusCode: 403, message: 'auth.account_blocked' };
  }

  // Update Google ID if missing
  if (!user.googleId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { googleId: googleUser.sub, profilePhoto: user.profilePhoto || googleUser.picture },
    });
  }

  const payload: JwtUserPayload = {
    id: user.id,
    phone: user.phone,
    role: user.role,
    name: user.name,
  };

  const tokens = generateTokenPair(payload);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: tokens.refreshToken },
  });

  return {
    isNewUser: false,
    user: sanitizeUser(user),
    ...tokens,
  };
};

// ------- Complete Google signup with phone -------
export const completeGoogleSignup = async (data: {
  googleId: string;
  name: string;
  email: string;
  phone: string;
  picture?: string;
}) => {
  const existing = await prisma.user.findUnique({ where: { phone: data.phone } });
  if (existing) {
    throw { statusCode: 409, message: 'auth.phone_exists' };
  }

  const user = await prisma.user.create({
    data: {
      name: data.name,
      phone: data.phone,
      email: data.email,
      googleId: data.googleId,
      profilePhoto: data.picture,
      authProvider: 'GOOGLE',
      isEmailVerified: true,
      isPhoneVerified: true,
      referralCode: generateReferralCode(data.name),
    },
  });

  const payload: JwtUserPayload = {
    id: user.id,
    phone: user.phone,
    role: user.role,
    name: user.name,
  };

  const tokens = generateTokenPair(payload);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: tokens.refreshToken },
  });

  return {
    user: sanitizeUser(user),
    ...tokens,
  };
};

// ------- Refresh Token -------
export const refreshAccessToken = async (refreshToken: string) => {
  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    throw { statusCode: 401, message: 'Invalid refresh token' };
  }

  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  if (!user || user.refreshToken !== refreshToken) {
    throw { statusCode: 401, message: 'Refresh token revoked' };
  }

  const payload: JwtUserPayload = {
    id: user.id,
    phone: user.phone,
    role: user.role,
    name: user.name,
  };

  const tokens = generateTokenPair(payload);

  // Rotate refresh token
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken: tokens.refreshToken },
  });

  return tokens;
};

// ------- Forgot Password -------
export const forgotPassword = async (phone: string) => {
  const user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    // Don't reveal if phone exists
    return { message: 'If this phone is registered, an OTP has been sent' };
  }

  const otp = generateOtp();
  await storeOtp(phone, otp);
  await sendOtp(phone, otp);

  return { message: 'auth.otp_sent' };
};

// ------- Reset Password -------
export const resetPassword = async (phone: string, otp: string, newPassword: string) => {
  const isValid = await verifyStoredOtp(phone, otp);
  if (!isValid) {
    throw { statusCode: 400, message: 'auth.otp_invalid' };
  }

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({
    where: { phone },
    data: { passwordHash },
  });

  return { message: 'auth.password_reset' };
};

// ------- Logout -------
export const logoutUser = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { refreshToken: null },
  });
  return { message: 'auth.logout_success' };
};

// ===== Helpers =====

const verifyGoogleToken = async (idToken: string) => {
  try {
    const response = await axios.get(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`
    );
    return response.data as {
      sub: string;
      email: string;
      name: string;
      picture: string;
    };
  } catch {
    return null;
  }
};

const sanitizeUser = (user: any) => ({
  id: user.id,
  name: user.name,
  phone: user.phone,
  email: user.email,
  profilePhoto: user.profilePhoto,
  role: user.role,
  isPhoneVerified: user.isPhoneVerified,
  isEmailVerified: user.isEmailVerified,
  isProfileComplete: user.isProfileComplete,
  city: user.city,
  area: user.area,
  interests: user.interests,
  language: user.language,
  referralCode: user.referralCode,
  createdAt: user.createdAt,
});
