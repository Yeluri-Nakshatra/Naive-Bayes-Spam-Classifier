import React, { useState } from 'react';
import { analyzeText, submitFeedback } from '../services/api';

const SpamAnalyzer = () => {
  const [text, setText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    
    setIsAnalyzing(true);
    setResult(null);
    setFeedbackSent(false);
    
    try {
      const data = await analyzeText(text);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert('Error analyzing text. Is the backend running?');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFeedback = async (isCorrect) => {
    if (!result) return;
    
    try {
      const userCorrectedLabel = isCorrect ? result.label : (result.label === 'spam' ? 'ham' : 'spam');
      
      await submitFeedback({
        text,
        predicted_label: result.label,
        predicted_score: result.score,
        user_corrected_label: userCorrectedLabel,
        is_spam: userCorrectedLabel === 'spam'
      });
      setFeedbackSent(true);
    } catch (error) {
      console.error(error);
      alert('Error submitting feedback');
    }
  };

  return (
    <div className="analyzer-grid">
      {/* Left Panel: Input Area */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">Message Content</div>
        </div>
        <div className="input-wrapper">
          <textarea 
            className="modern-input"
            placeholder="Paste the email or message body here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck="false"
          />
        </div>
        <div className="action-footer">
          <button 
            className="btn-primary"
            onClick={handleAnalyze}
            disabled={isAnalyzing || !text.trim()}
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4V2M12 22V20M4 12H2M22 12H20M17.6569 6.34315L19.0711 4.92893M4.92893 19.0711L6.34315 17.6569M17.6569 17.6569L19.0711 19.0711M4.92893 4.92893L6.34315 6.34315" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Analyzing...
              </>
            ) : (
              'Run Analysis'
            )}
          </button>
        </div>
      </div>

      {/* Right Panel: Results */}
      <div className="panel results-panel">
        <div className="panel-header">
          <div className="panel-title">Analysis Results</div>
        </div>
        
        {!result && !isAnalyzing && (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12h4l3-9 5 18 3-9h5"/>
            </svg>
            <p>Enter a message to see the spam probability analysis.</p>
          </div>
        )}

        {isAnalyzing && (
          <div className="empty-state" style={{ opacity: 0.7 }}>
            <p>Running ML model inference...</p>
          </div>
        )}

        {result && !isAnalyzing && (
          <>
            <div>
              <div className={`status-badge ${result.is_spam ? 'spam' : 'ham'}`}>
                <div className="status-indicator"></div>
                {result.is_spam ? 'Spam Detected' : 'Clean Message'}
              </div>
            </div>

            <div className="score-section">
              <div className="score-header">
                <span className="score-label">Spam Probability</span>
                <span className="score-value">{(result.score * 100).toFixed(1)}%</span>
              </div>
              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill" 
                  style={{ 
                    width: `${result.score * 100}%`,
                    backgroundColor: result.is_spam ? 'var(--danger-text)' : 'var(--success-text)'
                  }}
                ></div>
              </div>
            </div>

            <div className="feedback-box">
              <div className="feedback-header">Help improve the model</div>
              {feedbackSent ? (
                <p style={{ color: 'var(--success-text)', fontSize: '0.875rem' }}>✓ Feedback recorded</p>
              ) : (
                <div className="feedback-actions">
                  <button className="btn-outline" onClick={() => handleFeedback(true)}>
                    Looks correct
                  </button>
                  <button className="btn-outline" onClick={() => handleFeedback(false)}>
                    Report incorrect
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SpamAnalyzer;
