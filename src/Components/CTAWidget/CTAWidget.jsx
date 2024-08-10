import React from 'react';
import { Link } from 'react-router-dom';
import './CTAWidget.css';
import page from '../../Assets/Sounds/turnpage-99756.mp3'

const CTAWidget = () => {
  const handleClick = () => {
    const audio = new Audio(page);
    audio.play();
  }
  
  return (
    <div className="cta-widget">
      <h3>Start your day with a clear mind</h3>
      <p>Your word, your world</p>
      <button className='white-button'>
        <Link to='./journal' onClick={handleClick}>Start writing</Link>
      </button>
    </div>
  );
}

export default CTAWidget;
