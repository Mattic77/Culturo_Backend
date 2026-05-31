import nodemailer from 'nodemailer';

export class AuthEmail {
  private static getTransporter() {
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;
    const host = process.env.SMTP_HOST ?? 'smtp.gmail.com';
    const port = Number.parseInt(process.env.SMTP_PORT ?? '587', 10);

    if (!user || !pass) {
      throw new Error(
        'SMTP_USER or SMTP_PASSWORD is missing from environment variables',
      );
    }

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  private static getFromEmail() {
    return process.env.EMAIL_FROM ?? `Culturo <${process.env.SMTP_USER}>`;
  }

  static async confirmation(email: string, otp: number) {
    const from = this.getFromEmail();
    const message = `
      <p>Dear ${email},</p>
      <p>Welcome to Culturo platform!</p>
      <p>Please use the following OTP to confirm your email address:</p>
      <p>Your OTP is: <strong>${otp}</strong></p>
      <p>If you didn't create an account, please ignore this email.</p>`;

    try {
      const transporter = this.getTransporter();
      await transporter.sendMail({
        from,
        to: email,
        subject: 'Confirm your email address',
        html: message,
      });
    } catch (err) {
      console.error('SMTP Email sending failed (confirmation):', err);
      throw err;
    }
  }

  static async welcoming(email: string, username: string) {
    const from = this.getFromEmail();
    const message = `
      <p>Dear ${username},</p>
      <p>Welcome to Culturo platform!</p>
      <p>Your account has been created successfully.</p>
      <p>We’re glad to have you with us.</p>`;

    try {
      const transporter = this.getTransporter();
      await transporter.sendMail({
        from,
        to: email,
        subject: 'Welcome to Culturo',
        html: message,
      });
    } catch (err) {
      console.error('SMTP Email sending failed (welcoming):', err);
      throw err;
    }
  }
}
