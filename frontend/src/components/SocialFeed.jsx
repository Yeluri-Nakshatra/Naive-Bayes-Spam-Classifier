import React, { useState, useEffect, useRef } from 'react';
import { analyzeText } from '../services/api';

const MOCK_STREAM = [
  { name: "Dharaneeswar", handle: "@dharaneeswar", text: "Has anyone tried the new React compiler yet? It looks promising." },
  { name: "Bindhu", handle: "@bindhu", text: "BIG GIVEAWAY! Send 0.1 BTC to this address and receive 1 BTC back instantly! http://scam.link/btc" },
  { name: "Sribabu", handle: "@sribabu", text: "I just published a new article on modern CSS techniques for 2026." },
  { name: "Joshna", handle: "@joshna", text: "LOSE 20 POUNDS IN 1 WEEK!!! Doctors are shocked by this miracle pill. Buy now!" },
  { name: "Sireesha", handle: "@sireesha", text: "The new MacBook battery life is absolutely insane. Highly recommend." },
  { name: "Renu", handle: "@renu", text: "URGENT: Your account has been compromised. Please login immediately to verify your identity: http://secure-login.xyz" },
  { name: "Nandhini", handle: "@nandhini", text: "Why do programmers prefer dark mode? Because light attracts bugs." },
  { name: "Anjali", handle: "@anjali", text: "Congratulations! You have been selected to win a free iPhone 15 Pro Max. Click here to claim your prize." },
  { name: "Thanuja", handle: "@thanuja", text: "Just had the best coffee at this new spot downtown." },
  { name: "Nageswari", handle: "@nageswari", text: "Make $5000 a day working from home! No experience needed. Guaranteed income system." }
];

const SocialFeed = () => {
  const [feed, setFeed] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ total: 0, spam: 0, clean: 0, confidenceSum: 0 });
  const [isStreaming, setIsStreaming] = useState(true);
  const streamIndexRef = useRef(0);
  const logsEndRef = useRef(null);

  const addLog = (tag, message, type = 'info') => {
    const time = new Date();
    const timestamp = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}:${time.getSeconds().toString().padStart(2, '0')}.${time.getMilliseconds().toString().padStart(3, '0')}`;
    setLogs(prev => [...prev, { id: Date.now() + Math.random(), tag, message, type, time: timestamp }]);
  };

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(async () => {
      if (streamIndexRef.current >= MOCK_STREAM.length) {
        // Reset stream for continuous looping
        streamIndexRef.current = 0;
        setFeed([]);
        setStats({ total: 0, spam: 0, clean: 0, confidenceSum: 0 });
        addLog('SYS', "Stream buffer reset. Reconnecting to global socket...", "system");
        return;
      }

      const incomingComment = MOCK_STREAM[streamIndexRef.current];
      streamIndexRef.current += 1;
      
      const commentId = Date.now();
      const newPost = { ...incomingComment, id: commentId, status: 'analyzing' };
      
      setFeed(prev => [newPost, ...prev]);
      addLog('EVENT', `Payload intercepted from node [${incomingComment.handle}]`, 'intercept');
      addLog('EXEC', `Executing tokenization and probability inference pipeline...`, 'process');

      try {
        const result = await analyzeText(incomingComment.text);
        
        setTimeout(() => {
          setFeed(prev => prev.map(post => 
            post.id === commentId ? { ...post, status: 'done', is_spam: result.is_spam, score: result.score } : post
          ));

          setStats(prev => ({
            total: prev.total + 1,
            spam: prev.spam + (result.is_spam ? 1 : 0),
            clean: prev.clean + (result.is_spam ? 0 : 1),
            confidenceSum: prev.confidenceSum + result.score
          }));
          
          if (result.is_spam) {
            addLog('WARN', `Threshold exceeded. Spam probability: ${(result.score * 100).toFixed(2)}%`, 'alert');
            addLog('ACT', `Payload quarantined. Content hidden from public stream.`, 'system');
          } else {
            addLog('PASS', `Inference clear. Probability: ${(result.score * 100).toFixed(2)}%`, 'success');
          }
        }, 800); // Artificial delay to show "analyzing" state visually
        
      } catch (err) {
        addLog('ERR', `Connection reset by peer. Inference failed.`, 'error');
        setFeed(prev => prev.map(post => 
          post.id === commentId ? { ...post, status: 'error' } : post
        ));
      }

    }, 3500); // Emit a new comment every 3.5 seconds

    return () => clearInterval(interval);
  }, [isStreaming]);

  return (
    <div className="dashboard-wrapper">
      <div className="dashboard-header">
        <h1>Spam Filter</h1>
        <p>Real-time Machine Learning Inference Pipeline</p>
      </div>

      {/* Analytics Dashboard */}
      <div className="analytics-bar">
        <div className="stat-card">
          <div className="stat-label">Total Processed</div>
          <div className="stat-value">{feed.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Spam Detected</div>
          <div className="stat-value">{stats.total > 0 ? `${((stats.spam / stats.total) * 100).toFixed(1)}%` : '0'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Clean Content</div>
          <div className="stat-value">{stats.total > 0 ? `${((stats.clean / stats.total) * 100).toFixed(1)}%` : '0'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Avg Confidence</div>
          <div className="stat-value">{stats.total > 0 ? `${((stats.confidenceSum / stats.total) * 100).toFixed(1)}%` : '0'}</div>
        </div>
      </div>

      <div className="analyzer-grid">
        {/* Left Panel: Social Feed */}
        <div className="panel feed-panel">
          <div className="panel-header feed-header">
            <div className="panel-title">Live Global Stream</div>
            <button 
              className={`btn-toggle ${isStreaming ? 'active' : ''}`}
              onClick={() => setIsStreaming(!isStreaming)}
            >
              {isStreaming ? 'Pause Stream' : 'Resume Stream'}
            </button>
          </div>
          
          <div className="feed-container">
            {feed.length === 0 && <div className="empty-state">Awaiting connection to stream...</div>}
            
            {feed.map(post => (
              <div key={post.id} className={`post-card ${post.status === 'analyzing' ? 'analyzing' : ''} ${post.is_spam ? 'is-spam' : ''}`}>
                <div className="avatar"></div>
                
                <div className="post-content">
                  <div className="post-header">
                    <div className="user-info">
                      <span className="display-name">{post.name}</span>
                      <span className="username">{post.handle}</span>
                      <span className="dot-sep">·</span>
                      <span className="timestamp">Just now</span>
                    </div>
                    
                    <div className="post-status">
                      {post.status === 'analyzing' && (
                        <span className="badge processing">
                          <span className="pulse-dot"></span> Analyzing
                        </span>
                      )}
                      {post.status === 'done' && post.is_spam && (
                        <span className="badge danger">Filtered</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="post-body">
                    {post.status === 'done' && post.is_spam ? (
                      <div className="spam-overlay">
                        <span>This content was hidden by Spam Filter</span>
                      </div>
                    ) : (
                      <p>{post.text}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Terminal Logs */}
        <div className="panel terminal-panel">
          <div className="panel-header terminal-header">
            <div className="panel-title">Model Diagnostics Log</div>
            <div className="window-controls">
              <span className="dot dot-red"></span>
              <span className="dot dot-yellow"></span>
              <span className="dot dot-green"></span>
            </div>
          </div>
          
          <div className="terminal-body">
            {logs.length === 0 && (
              <div className="log-line system">
                <span className="log-time">[00:00:00.000]</span>
                <span className="log-tag">INIT</span>
                <span className="log-msg">Bootstrapping ML models...</span>
              </div>
            )}
            
            {logs.map(log => (
              <div key={log.id} className={`log-line ${log.type}`}>
                <span className="log-time">[{log.time}]</span> 
                <span className="log-tag">{log.tag}</span>
                <div className="log-content">
                  <span className="log-msg">{log.message}</span>
                  {log.tag === 'EXEC' && (
                    <div className="log-progress">
                      <div className="log-progress-bar"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialFeed;
