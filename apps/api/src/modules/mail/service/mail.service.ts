import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';
import { EmailPurpose } from '../type/email-purpose.type';
import { MAIL_CONSTANTS } from '../constants/mail.constants';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter;
  private readonly fromAddress: string;

  constructor(private readonly configService: ConfigService) {
    this.fromAddress = this.configService.get<string>(
      'MAIL_FROM',
      MAIL_CONSTANTS.from,
    );

    this.transporter = createTransport({
      host: this.configService.get<string>('SMTP_HOST', 'localhost'),
      port: Number(this.configService.get<string>('SMTP_PORT', '587')),
      secure: this.configService.get<string>('SMTP_SECURE', 'false') === 'true',
      auth: this.configService.get<string>('SMTP_USER')
        ? {
            user: this.configService.get<string>('SMTP_USER'),
            pass: this.configService.get<string>('SMTP_PASS'),
          }
        : undefined,
    });
  }

  async sendEmailCode(
    email: string,
    code: string,
    purpose: EmailPurpose,
  ): Promise<void> {
    const subject: string =
      purpose === 'password_reset' || purpose === 'password_change'
        ? MAIL_CONSTANTS.passwordResetSubject
        : MAIL_CONSTANTS.verificationSubject;

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>JangMaNal 인증 코드</h2>
        <p>요청하신 인증 코드는 아래와 같습니다.</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${code}</p>
        <p>본 코드는 10분 후 만료됩니다.</p>
      </div>
    `;

    await this.transporter.sendMail({
      from: this.fromAddress,
      to: email,
      subject,
      html,
    });

    this.logger.log(`Email sent to=${email} purpose=${purpose}`);
  }
}
