const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const testMail = async () => {
  try {
    console.log('Using Email:', process.env.EMAIL_USER);
    console.log('Using Pass:', process.env.EMAIL_PASS ? 'FOUND' : 'MISSING');
    
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('Environment variables missing!');
        return;
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER, // Send to self
      subject: 'Test OTP',
      text: 'Your test code is 1234'
    });
    console.log('Email sent successfully:', info.messageId);
  } catch (err) {
    console.error('Email failed:', err);
  }
};

testMail();
