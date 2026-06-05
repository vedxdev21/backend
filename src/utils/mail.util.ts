import { env } from '../config/env';

type MailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

let cachedTransporter: any = null;

const canSendEmail = () =>
  env.EMAIL_NOTIFICATIONS_ENABLED &&
  env.SMTP_HOST &&
  env.SMTP_PORT &&
  env.SMTP_USER &&
  env.SMTP_PASS &&
  env.EMAIL_FROM;

const getTransporter = async () => {
  if (!canSendEmail()) return null;
  if (cachedTransporter) return cachedTransporter;

  const nodemailer = await import('nodemailer');
  cachedTransporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  });

  return cachedTransporter;
};

export const sendEmail = async (payload: MailPayload) => {
  const transporter = await getTransporter();
  if (!transporter) return { skipped: true };

  await transporter.sendMail({
    from: env.EMAIL_FROM,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });

  return { sent: true };
};
