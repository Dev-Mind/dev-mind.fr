import * as nodemailer from "nodemailer";
import * as Mail from "nodemailer/lib/mailer";

export interface MailerConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
}

export class Mailer {

  transport: Mail;

  constructor(config: MailerConfig) {
    this.transport = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
          user: config.user,
          pass: config.password
        }
      });
  }

  sendMail(adress: string, subject: string, html: string){
    this.transport.sendMail({
      from: '"Dev-Mind" <contact@dev-mind.fr>',
      to: adress,
      subject: subject,
      html: html
    })
      .then(result => console.log(`Email to ${adress} sent`))
      .catch(error => console.error(`Error on email sending to ${adress} :${error}`))
  }
}
