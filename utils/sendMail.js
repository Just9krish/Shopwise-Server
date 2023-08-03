const nodemailer = require("nodemailer");
const hbs = require("nodemailer-express-handlebars");
const path = require("path");

exports.sendMail = async (
  subject,
  send_to,
  sent_from,
  reply_to,
  template,
  name,
  link,
  logoUrl
) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMPT_HOST.trim(),
    port: process.env.SMPT_PORT,
    service: process.env.SMPT_SERVICE,
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const handlebarOptions = {
    viewEngine: {
      extName: ".handlebars",
      partialsDir: path.resolve("./views"),
      defaultLayout: false,
    },
    viewPath: path.resolve("./views"),
    extName: ".handlebars",
  };

  transporter.use("compile", hbs(handlebarOptions));

  const mailOptions = {
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

  transporter.sendMail(mailOptions, function (err, info) {
    if (err) {
      console.log(err);
    } else {
      console.log(info);
    }
  });
};
