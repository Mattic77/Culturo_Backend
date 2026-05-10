import nodemailer from 'nodemailer';

export class AuthEmail {
  private static getMailConfig() {
    const host = process.env.SMTP_HOST ?? '';
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;
    const from = process.env.SMTP_USER ?? user;

    if (!host || !user || !pass || !from) {
      throw new Error('SMTP configuration is missing');
    }

    return { host, port, user, pass, from };
  }

  private static createTransporter() {
    const { host, port, user, pass } = this.getMailConfig();

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
    });

    return transporter;
  }

  static confirmation(email: string, otp: number) {
    const { from } = this.getMailConfig();
    const message = `
      <p>Dear ${email},</p>
      <p>Welcome to Culturo platform!</p>
      <p>Please use the following OTP to confirm your email address:</p>
      <p>Your OTP is: ${otp}</p>
      <p>If you didn't create an account, please ignore this email.</p>`;

    return this.createTransporter().sendMail({
      from,
      to: email,
      subject: 'Confirm your email address',
      html: message,
    });
  }

  static welcoming(email: string, username: string) {
    const { from } = this.getMailConfig();
    const message = `
      <p>Dear ${username}</p>
      <p>Welcome to Culturo platform!</p>
      <p>Your account has been created successfully.</p>
      <p>We’re glad to have you with us.</p>`;

    return this.createTransporter().sendMail({
      from,
      to: email,
      subject: 'Welcome to Culturo',
      html: message,
    });
  }
}
