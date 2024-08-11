import React from 'react';
import { useTheme } from '../../Context/ThemeContext';

const GlobalVolume = () => {
  const { toggleMute, isMuted } = useTheme();

  return (
    <div>
      <h2>Global Sound Control</h2>
      <button onClick={toggleMute}>
        {isMuted ? 'Unmute All Sounds' : 'Mute All Sounds'}
      </button>
    </div>
  );
};

export default GlobalVolume;
