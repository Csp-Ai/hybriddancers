const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

admin.initializeApp();
const db = admin.firestore();

function createTransport() {
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY }
    });
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });
}

async function sendConfirmationEmail({ name, email, className }) {
  const transporter = createTransport();
  const from = process.env.EMAIL_FROM || process.env.GMAIL_USER || 'no-reply@hybriddancers.com';
  const mailOptions = {
    from,
    to: email,
    subject: 'Class Registration Confirmation',
    html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Registration Confirmed!</h2>
        <p>Hi ${name},</p>
        <p>You are confirmed for <strong>${className}</strong>.</p>
        <p>We look forward to seeing you.</p>
        <p>- Hybrid Dancers</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}

exports.registerForClass = functions.https.onCall(async (data, context) => {
  const { name, email, className } = data || {};
  if (!name || !email || !className) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields');
  }

  const docRef = await db.collection('registrations').add({
    name,
    email,
    class: className,
    created: admin.firestore.FieldValue.serverTimestamp()
  });

  try {
    await sendConfirmationEmail({ name, email, className });
  } catch (err) {
    console.error('Failed to send confirmation email:', err);
  }

  return { success: true, id: docRef.id };
});
