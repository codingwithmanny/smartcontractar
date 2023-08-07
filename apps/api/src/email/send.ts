// Imports
// ========================================================
import nodemailer from 'nodemailer';

// Main Script
// ========================================================
async function main() {
  const transporter = nodemailer.createTransport({
    // url: 'smtp://resend:re_123456789@localhost:1025',
    url: `${process.env.EMAIL_SERVER}`
  });

  const info = await transporter.sendMail({
    from: `${process.env.EMAIL_FROM}`,
    to: 'test@example.dev',
    subject: 'Hello World',
    html: '<strong>It works!</strong>',
  });

  console.log('Message sent: %s', info.messageId);
}

// Init
// ========================================================
main().catch(console.error);