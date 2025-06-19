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

exports.dailyClassSummary = functions.pubsub
  .schedule('0 9 * * *')
  .timeZone('America/Los_Angeles')
  .onRun(async () => {
    const transporter = createTransport();
    const now = Date.now();
    const since = admin.firestore.Timestamp.fromMillis(now - 24 * 60 * 60 * 1000);
    const snapshot = await db
      .collection('class_signups')
      .where('created', '>=', since)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const classes = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      const className = data.className || data.class;
      const student = data.studentName || data.name;
      if (!classes[className]) {
        classes[className] = { students: [], count: 0 };
      }
      classes[className].students.push(student);
      classes[className].count += 1;
    });

    let html = '<h2>New Class Signups</h2>';
    for (const [className, info] of Object.entries(classes)) {
      html += `<h3>${className} (${info.count})</h3><ul>`;
      for (const student of info.students) {
        html += `<li>${student}</li>`;
      }
      html += '</ul>';
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM ||
        process.env.GMAIL_USER ||
        'no-reply@hybriddancers.com',
      to: process.env.ADMIN_EMAIL,
      subject: 'Daily Class Signup Summary',
      html
    };

    await transporter.sendMail(mailOptions);
    return null;
  });
