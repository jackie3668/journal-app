import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../Context/ThemeContext'; 
import './Background.css';

const Background = () => {
  const { backgroundUrl } = useTheme();
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && backgroundUrl) {
      videoRef.current.load(); 
    }
  }, [backgroundUrl]);

  return (
    <div className="background-container">
      <video ref={videoRef} className="background-video" autoPlay loop muted preload="metadata">
        <source src={backgroundUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default Background;
