import { randomInt } from 'crypto';

export class OtpGenerate {
  static generateOtp(length = 6): string {
    if (length <= 0) {
      throw new Error('OTP length must be greater than 0');
    }

    let otp = '';

    for (let index = 0; index < length; index += 1) {
      otp += randomInt(0, 10).toString();
    }

    return otp;
  }
}
