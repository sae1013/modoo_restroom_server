// src/mail/mail.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GmailSmtpService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(GmailSmtpService.name);

  constructor(private readonly configService: ConfigService) {
    // Gmail SMTP 설정
    this.transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: this.configService.get<string>('GMAIL_USER'),
        pass: this.configService.get<string>('GMAIL_PASSWORD'),
      },
    });

    // SMTP 연결 테스트
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error('Error connecting to SMTP server:', error);
      } else {
        this.logger.log('SMTP server is ready to take messages');
      }
    });
  }

  async sendMail(to: string, subject: string, text: string, html?: string): Promise<void> {
    const mailOptions: nodemailer.SendMailOptions = {
      from: `"해우소" <${this.configService.get<string>('GMAIL_USER')}>`,
      to,
      subject,
      text,
      html,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email sent: ${info.messageId}`);
    } catch (error) {
      this.logger.error('Error sending email:', error);
      throw error;
    }
  }
}
