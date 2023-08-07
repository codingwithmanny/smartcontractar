// Imports
// ========================================================
import nodemailer from "nodemailer";

// Configured Mail Server
// ========================================================
const transporter = nodemailer.createTransport({
  // url: 'smtp://resend:re_123456789@localhost:1025',
  url: `${process.env.EMAIL_SERVER}`,
  // host: 'smtp.resend.com',
  // secure: true,
  // port: 465,
  // auth: {
  //   user: 'resend',
  //   pass: 're_123456789',
  // },
});

// Exports
// ========================================================
export default transporter;
