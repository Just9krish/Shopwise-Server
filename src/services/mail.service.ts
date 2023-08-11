import nodemailer from "nodemailer";
import hbs from "nodemailer-express-handlebars";
import path from "path";
import config from "config";
import logger from "../utils/logger";
import ErrorHandler from "../utils/errorHandler";

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

  console.log(path.resolve("./views"));

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

  console.log(mailOptions);

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(info);
  } catch (err) {
    console.log("mail error");
    logger.error(err);
    throw new ErrorHandler("failed to send email", 500);
  }
};

export default sendMail;
