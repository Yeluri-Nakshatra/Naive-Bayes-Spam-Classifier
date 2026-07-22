import React from 'react';

const ScoreGauge = ({ score, isSpam }) => {
  const percentage = Math.round(score * 100);
  const color = isSpam ? 'var(--danger)' : 'var(--success)';
  
  return (
    <div className="gauge-container" style={{ margin: '0 auto', textAlign: 'center' }}>
      <div style={{
        position: 'relative',
        width: '200px',
        height: '100px',
        overflow: 'hidden',
        margin: '0 auto'
      }}>
        <div style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '200px', height: '200px',
          borderRadius: '50%',
          border: '20px solid rgba(255, 255, 255, 0.1)',
          boxSizing: 'border-box'
        }}></div>
        <div style={{
          position: 'absolute',
          top: 0, left: 0,
          width: '200px', height: '200px',
          borderRadius: '50%',
          border: `20px solid ${color}`,
          borderColor: `${color} ${color} transparent transparent`,
          boxSizing: 'border-box',
          transform: `rotate(${-135 + (score * 180)}deg)`,
          transition: 'transform 1s cubic-bezier(0.2, 1, 0.3, 1)'
        }}></div>
      </div>
      <div className="gauge-value" style={{ marginTop: '10px' }}>
        {percentage}%
      </div>
      <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '5px' }}>
        Probability
      </div>
    </div>
  );
};

export default ScoreGauge;
