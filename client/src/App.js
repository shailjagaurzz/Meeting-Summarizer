import { useState } from 'react';
import axios from 'axios';
import logo from './logo.svg';
import './App.css';

function App() {
  const [transcript, setTranscript] = useState('');
  const [customPrompt, setCustomPrompt] = useState('Summarize key points');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleGenerateSummary = async () => {
    if (!transcript) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/summary/generate', 
        { transcript, customPrompt },
        { timeout: 30000 }
      );
      setSummary(response.data.data.summary);
    } catch (error) {
      console.error('API Error:', error.response?.data || error);
      alert(`Error: ${error.response?.data?.error || 'Check console for details'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!summary || !emailRecipient) return;
    
    setIsSendingEmail(true);
    try {
      await axios.post(
        'http://localhost:5000/api/summary/send-email', 
        {
          to: emailRecipient,
          subject: 'Meeting Summary',
          summary
        },
        { timeout: 30000 }
      );
      alert('Email sent successfully!');
    } catch (error) {
      console.error('Email Error:', error.response?.data || error);
      alert(`Email failed: ${error.response?.data?.error || error.message}`);
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <h1>AI Meeting Notes Summarizer</h1>
        
      
        
        {/* Custom Prompt */}
        <div className="input-section">
  <h3>Meeting Transcript</h3>
  <input 
    type="file" 
    accept=".txt,.md"
    onChange={(e) => {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => setTranscript(e.target.result);
      reader.readAsText(file);
    }}
  />
  <small>Or paste below:</small>
  <textarea
    value={transcript}
    onChange={(e) => setTranscript(e.target.value)}
    placeholder="Paste transcript here..."
    rows={5}
  />
</div>
        
        {/* Generate Button */}
        <button 
          className={`generate-button ${isLoading ? 'loading' : ''}`}
          onClick={handleGenerateSummary}
          disabled={isLoading || !transcript}
        >
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Generating...
            </>
          ) : 'Generate Summary'}
        </button>
        
        {/* Summary Output */}
        {summary && (
          <div className="summary-section">
            <h3>Generated Summary</h3>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={8}
            />
            
            {/* Email Sharing */}
            <div className="email-section">
              <h4>Share via Email</h4>
              <input
                type="email"
                value={emailRecipient}
                onChange={(e) => setEmailRecipient(e.target.value)}
                placeholder="recipient@example.com"
                disabled={isSendingEmail}
              />
              <button 
                onClick={handleSendEmail}
                disabled={isSendingEmail || !emailRecipient}
              >
                {isSendingEmail ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;