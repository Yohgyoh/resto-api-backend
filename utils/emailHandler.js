import { format } from "morgan";
import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const mailOPtions = {
    from: "jakarta cafe <noreply@resto.com>",
    to: options.to,
    subject: options.subject,
    text: options.text,
  };
  await transporter.sendMail(mailOPtions);
};

export default sendEmail;
