const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendTestEmail() {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });

  try {
    const info = await transporter.sendMail({
      from: '"Meeting Summarizer" <' + process.env.EMAIL_USER + '>',
      to: process.env.EMAIL_USER,
      subject: 'TEST: Meeting Summary',
      text: '• Test item 1\n• Test item 2',
      html: '<b>• Test item 1</b><br><b>• Test item 2</b>'
    });
    console.log('✅ Email sent! Message ID:', info.messageId);
  } catch (err) {
    console.error('❌ Failed:', err);
  }
}

sendTestEmail();