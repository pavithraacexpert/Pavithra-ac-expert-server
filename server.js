const express = require('express');
const cors = require('cors'); // ← ADD THIS
const fs = require('fs');
const path = require('path');
const app = express();

// ✅ Allow your Netlify frontend domain
app.use(cors({
  origin: 'https://pavithraservices.com' // ← replace with your actual Netlify URL
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const FEEDBACK_FILE = path.join(__dirname, 'feedback.json');

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

  fs.writeFileSync(FEEDBACK_FILE, JSON.stringify(feedbacks, null, 2));
  res.json({ success: true, message: 'Feedback saved successfully!' });
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
