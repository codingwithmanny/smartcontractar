// Imports
// ========================================================
import nodemailer from "nodemailer";

// Config
// ========================================================
const config =
  true || process.env.NODE_ENV === "production"
    ? {
        host: `${process.env.EMAIL_HOST}`,
        secure: true,
        port: parseInt(`${process.env.EMAIL_PORT}`),
        auth: {
          user: `${process.env.EMAIL_AUTH_USER}`,
          pass: `${process.env.EMAIL_AUTH_PASSWORD}`,
        },
      }
    : {
        url: `${process.env.EMAIL_SERVER}`,
      };

// Configured Mail Server
// ========================================================
const transporter = nodemailer.createTransport(config);

// Exports
// ========================================================
export default transporter;
