const express = require('express');
const cors = require('cors'); // ← ADD THIS
const fs = require('fs');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');

require('dotenv').config();
const twilio = require('twilio');

// Load environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER;

// ✅ Allow your Netlify frontend domain
app.use(cors({
  origin: 'https://pavithraservices.com' // ← replace with your actual Netlify URL
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const FEEDBACK_FILE = path.join(__dirname, 'feedback.json');

const client = twilio(accountSid, authToken);

// Replace with the recipient's number
const toNumber = '+919626141540'; // Include country code


app.post('/send-message', async (req, res) => {
  const { to, body } = req.body;

  try {
    const message = await client.messages.create({
      from: fromWhatsAppNumber,
      to: toNumber,
      body: body
    });

    res.json({ success: true, sid: message.sid });
  } catch (error) {
    res.json({ success: false, error: error.message });
  }
});

// Save feedback and keep only the latest 10
app.post('/submit-feedback', (req, res) => {
  const { name } = req.body;
  const { feedback } = req.body;
  const { rating } = req.body;

  if (!feedback) return res.json({ success: false, message: 'No feedback received' });

  let feedbacks = [];
  if (fs.existsSync(FEEDBACK_FILE)) {
    feedbacks = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf-8'));
  }

  feedbacks.push({ name,feedback, rating, date: new Date().toISOString() });
  if (feedbacks.length > 10) feedbacks = feedbacks.slice(-10);

   try {
    fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(feedbacks, null, 2));
    console.log("Feedback saved."); // 👈
    res.json({ success: true, message: 'Feedback saved successfully!' });
  } catch (err) {
    console.error("Write error:", err); // 👈
    res.status(500).json({ success: false, message: 'Could not save feedback', error: err.message });
  }
});

// Read all feedbacks
app.get('/get-feedbacks', (req, res) => {
  let feedbacks = [];
  if (fs.existsSync(FEEDBACK_FILE)) {
    feedbacks = JSON.parse(fs.readFileSync(FEEDBACK_FILE, 'utf-8'));
  }
  res.json(feedbacks);
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
