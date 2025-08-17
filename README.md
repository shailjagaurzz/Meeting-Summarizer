# AI Meeting Summarizer

An AI-powered tool that generates structured summaries from meeting transcripts with custom prompts. Built with Node.js (backend) and vanilla HTML/JS (frontend).

![Demo Screenshot](https://via.placeholder.com/800x400?text=AI+Meeting+Summarizer+Demo) 
*(Replace with actual screenshot after deployment)*

## Features

- Upload text transcripts or paste meeting notes
- Add custom prompts (e.g., "Summarize for executives")
- AI-powered summarization (using Groq/Llama 3 or OpenAI)
- Edit generated summaries
- Share via email

## Tech Stack

**Backend**:
- Node.js + Express
- Groq API (Llama 3) / OpenAI
- Nodemailer (for email sharing)

**Frontend**:
- Vanilla HTML/CSS/JS
- Responsive design

## Deployment

### Prerequisites
- Node.js (v18+)
- Groq/OpenAI API key
- Gmail account (for email sharing)

### How to Run Locally

1. Clone the repo:
   ```bash
   git clone https://github.com/yourusername/meeting-summarizer.git
   cd meeting-summarizer