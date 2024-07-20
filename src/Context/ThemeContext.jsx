import React, { createContext, useState, useContext } from 'react';

// Create a Context for the theme
const ThemeContext = createContext();

// Create a Provider component
export const ThemeProvider = ({ children }) => {
  const [backgroundUrl, setBackgroundUrl] = useState('https://videos.pexels.com/video-files/3515758/3515758-uhd_2560_1440_25fps.mp4');

  return (
    <ThemeContext.Provider value={{ backgroundUrl, setBackgroundUrl }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the ThemeContext
export const useTheme = () => useContext(ThemeContext);
