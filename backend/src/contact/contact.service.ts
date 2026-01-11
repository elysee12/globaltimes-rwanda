import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ContactDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
  private transporter: nodemailer.Transporter | null = null;
  private readonly toEmail: string;
  private readonly emailEnabled: boolean;

  constructor() {
    const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.EMAIL_PORT || '587', 10);
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    this.emailEnabled = !!(user && pass);

    if (!this.emailEnabled) {
      console.warn(
        '[ContactService] EMAIL_USER or EMAIL_PASS not set. Contact form emails will not be sent until these are configured.',
      );
    } else {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    }

    this.toEmail = process.env.CONTACT_TO_EMAIL || 'robertbjournal@gmail.com';
  }

  async sendContactMessage(data: ContactDto) {
    if (!this.emailEnabled || !this.transporter) {
      console.error('[ContactService] Email transport is not configured.');
      throw new InternalServerErrorException(
        'Email service is not configured on the server.',
      );
    }

    const { name, email, subject, message } = data;

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"Global Times Rwanda Contact" <${process.env.EMAIL_USER}>`,
      to: this.toEmail,
      subject: `[Contact Form] ${subject || 'New message from website'}`,
      text: `You have received a new message from the contact form.\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br/>')}</p>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true };
    } catch (error) {
      console.error('[ContactService] Failed to send email:', error);
      throw new InternalServerErrorException('Failed to send contact message.');
    }
  }
}


