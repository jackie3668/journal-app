import React from 'react';
import { Link } from 'react-router-dom';
import './CTAWidget.css';

const CTAWidget = () => {
  return (
    <div className="cta-widget">
      <h3>Start your day with a clear mind</h3>
      <p>Your word, your world</p>
      <button className='white-button'>
        <Link to='./journal'>Start writing</Link>
      </button>
    </div>
  );
}

export default CTAWidget;
