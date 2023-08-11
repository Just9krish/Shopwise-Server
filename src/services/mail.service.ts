import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import path from "path";
import logger from "../utils/logger";
import ErrorHandler from "../utils/errorHandler";
import { NextFunction } from "connect";

interface MailOptions {
  from: string;
  to: string;
  replyTo: string;
  subject: string;
  template: string;
  context: {
    name: string;
    link: string;
    logoUrl: string;
  };
}

const sendMail = async (
  subject: string,
  send_to: string,
  sent_from: string,
  reply_to: string,
  template: string,
  name: string,
  link: string,
  logoUrl: string
) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMPT_HOST!,
    port: +process.env.SMPT_PORT!,
    service: process.env.SMPT_SERVICE!,
    auth: {
      user: process.env.SMPT_MAIL!,
      pass: process.env.SMPT_PASSWORD!,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const handlebarOptions: hbs.NodemailerExpressHandlebarsOptions = {
    viewEngine: {
      extname: ".handlebars",
      partialsDir: path.resolve("./views"),
      defaultLayout: false,
    },
    viewPath: path.resolve("./views"),
    extName: ".handlebars",
  };

  transporter.use("compile", hbs(handlebarOptions));

  const mailOptions: MailOptions = {
    from: sent_from,
    to: send_to,
    replyTo: reply_to,
    subject,
    template,
    context: {
      name,
      link,
      logoUrl,
    },
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(info);
  } catch (err) {
    logger.error(err);
    throw new ErrorHandler("Failed to send email", 500);
  }
};

export default sendMail;
