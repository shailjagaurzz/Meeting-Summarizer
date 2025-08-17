import React, { useState } from 'react';
import axios from 'axios';

function SummaryGenerator() {
  const [transcript, setTranscript] = useState('');
  const [customPrompt, setCustomPrompt] = useState('Summarize key points');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateSummary = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/summary/generate',
        { transcript, customPrompt }
      );
      setSummary(response.data.data.summary);
    } catch (error) {
      console.error('API Error:', error);
      alert('Failed to generate summary');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="summary-generator">
      <h2>Meeting Notes Summarizer</h2>
      
      <textarea
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        placeholder="Paste meeting transcript here..."
        rows={8}
      />
      
      <input
        type="text"
        value={customPrompt}
        onChange={(e) => setCustomPrompt(e.target.value)}
        placeholder="Custom instructions"
      />
      
      <button onClick={generateSummary} disabled={isLoading || !transcript}>
        {isLoading ? 'Generating...' : 'Generate Summary'}
      </button>
      
      {summary && (
        <div className="summary-result">
          <h3>Generated Summary</h3>
          <pre>{summary}</pre>
        </div>
      )}
    </div>
  );
}

export default SummaryGenerator;