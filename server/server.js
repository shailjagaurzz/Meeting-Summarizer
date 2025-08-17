const express = require('express');
const cors = require('cors');
const { Groq } = require('groq-sdk');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10kb' }));

const path = require('path');

// Serve static files from the React frontend build
app.use(express.static(path.join(__dirname, '../client/build')));

// Catch-all handler to serve React's index.html for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
});




// Email validation helper
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Initialize Groq client with fallback models
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later'
});
app.use('/api/', limiter);

// Health check
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Meeting Notes Summarizer API',
    version: '1.0.1'
  });
});

// AI Summary Generation with Model Fallback
app.post('/api/summary/generate', async (req, res) => {
  try {
    const { transcript, customPrompt } = req.body;
    
    if (!transcript) {
      return res.status(400).json({ 
        status: 'fail',
        error: 'Valid transcript is required' 
      });
    }

    const models = ["llama3-70b-8192", "mixtral-8x7b", "gemma-7b-it"];
    let summary;
    let lastError;

    for (const model of models) {
      try {
        const completion = await groq.chat.completions.create({
          messages: [
            {
              role: "system",
              content: "Summarize meeting notes professionally. Focus on decisions, action items, and key points."
            },
            {
              role: "user",
              content: `TRANSCRIPT:\n${transcript}\n\nINSTRUCTIONS: ${customPrompt || "Provide a concise summary in bullet points"}`
            }
          ],
          model,
          temperature: 0.3,
          max_tokens: 2000
        });
        summary = completion.choices[0]?.message?.content;
        break;
      } catch (error) {
        lastError = error;
        continue;
      }
    }

    if (!summary) {
      throw lastError || new Error('All models failed');
    }

    res.status(200).json({
      status: 'success',
      data: { summary }
    });

  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({
      status: 'error',
      error: 'Summary generation failed',
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Please try again later'
    });
  }
});

// Email Sharing with Enhanced Validation
app.post('/api/summary/send-email', async (req, res) => {
  try {
    const { to, subject, summary } = req.body;

    if (!to || !summary) {
      return res.status(400).json({
        status: 'fail',
        error: 'Recipient email and summary content are required'
      });
    }

    const recipients = to.split(',').map(email => email.trim());
    if (recipients.some(email => !validateEmail(email))) {
      return res.status(400).json({
        status: 'fail',
        error: 'Invalid email address format'
      });
    }

    const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465, // or 587 for TLS
  secure: true, // true for 465, false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  debug: true // Add this to see SMTP logs
});

const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

app.post('/api/upload', upload.single('transcript'), (req, res) => {
  try {
    const text = fs.readFileSync(req.file.path, 'utf8');
    fs.unlinkSync(req.file.path); // Delete temp file
    res.json({ status: 'success', data: text });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

    await transporter.sendMail({
      from: `"Meeting Summarizer" <${process.env.EMAIL_USER}>`,
      to: recipients.join(','),
      subject: subject || 'Meeting Summary',
      text: summary,
      html: `
        <div style="font-family: Arial; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Meeting Summary</h2>
          <div style="white-space: pre-wrap; padding: 1rem; background: #f3f4f6; border-radius: 8px;">
            ${summary}
          </div>
          <p style="color: #6b7280; font-size: 0.8rem; margin-top: 1rem;">
            Sent via Meeting Summarizer App
          </p>
        </div>
      `
    });

    res.status(200).json({
      status: 'success',
      message: 'Email sent successfully'
    });

  } catch (error) {
    console.error('Email Error:', error);
    res.status(500).json({
      status: 'error',
      error: 'Email sending failed',
      message: process.env.NODE_ENV === 'development'
        ? error.message
        : 'Please try again later'
    });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({
    status: 'error',
    error: 'Internal server error'
  });
});

// 404 Handler
app.all('*', (req, res) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server`
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔑 Groq API: ${process.env.GROQ_API_KEY ? 'Ready' : 'Missing'}`);
  console.log(`✉️  Email Service: ${process.env.EMAIL_USER ? 'Ready' : 'Disabled'}`);
});

