import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import path from "path";
import config from "config";
import logger from "../utils/logger";

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
    host: config.get<string>("smptHost"),
    port: config.get<number>("smptPort"),
    service: process.env.SMPT_SERVICE,
    auth: {
      user: config.get<string>("smptUser"),
      pass: config.get<string>("smptPassword"),
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const handlebarOptions: hbs.NodemailerExpressHandlebarsOptions = {
    viewEngine: {
      extname: ".handlebars",
      partialsDir: path.resolve("./views"),
    },
    viewPath: path.resolve("./views"),
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
  }
};

export default sendMail;
