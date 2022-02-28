import nodemailer, { Transporter } from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import { EMAIL_CONFIG } from "../config";

const FROM_ADDRESS = "";

export class EmailService {
  readonly transporter: Transporter;

  constructor(config: SMTPTransport.Options) {
    this.transporter = nodemailer.createTransport(EMAIL_CONFIG);
  }

  async send(to: string, subject: string, body: string): Promise<any> {
    var message = {
      from: FROM_ADDRESS,
      to,
      subject,
      text: body,
      html: body,
    };

    return this.transporter.sendMail(message);
  }
}
