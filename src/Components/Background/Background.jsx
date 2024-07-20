import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../Context/ThemeContext'; // Adjust the import path as necessary
import './Background.css';

const Background = () => {
  const { backgroundUrl } = useTheme();
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load(); // Reload video when backgroundUrl changes
    }
  }, [backgroundUrl]);

  return (
    <div className="background-container">
      <video ref={videoRef} className="background-video" autoPlay loop muted>
        <source src={backgroundUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default Background;
