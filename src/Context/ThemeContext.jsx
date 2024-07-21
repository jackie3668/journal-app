import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Create a Context for the theme
const ThemeContext = createContext();

// Create a Provider component
export const ThemeProvider = ({ children }) => {
  const [backgroundName, setBackgroundName] = useState('');
  const [typingSoundName, setTypingSoundName] = useState('');
  const [sounds, setSounds] = useState([]);
  const [backgroundUrl, setBackgroundUrl] = useState(''); // Added backgroundUrl
  const [assets, setAssets] = useState([]);

  // Fetch assets on component mount
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/assets');
        setAssets(response.data);
      } catch (err) {
        console.error('Error fetching assets:', err);
      }
    };

    fetchAssets();
  }, []);

  // Function to update the theme based on the selected preset
  const selectPreset = (preset) => {
    if (preset) {
      const backgroundAsset = assets.find(asset => asset.name === preset.assets[0]);
      const typingSoundAsset = assets.find(asset => asset.name === preset.assets[1]);
      const otherSoundAssets = preset.assets.slice(2).map(name => assets.find(asset => asset.name === name));

      setBackgroundName(preset.assets[0]); // Set background name
      setTypingSoundName(preset.assets[1]); // Set typing sound name
      setSounds(otherSoundAssets.map(asset => asset.name)); // Set other sound names

      if (backgroundAsset) {
        setBackgroundUrl(backgroundAsset.url); // Set background URL
      } else {
        setBackgroundUrl(''); // Default if no matching asset
      }
    } else {
      setBackgroundName('');
      setTypingSoundName('');
      setSounds([]);
      setBackgroundUrl(''); // Clear URL if no preset
    }
  };

  return (
    <ThemeContext.Provider value={{ backgroundName, setBackgroundName, typingSoundName,setTypingSoundName, sounds, backgroundUrl, setBackgroundUrl, selectPreset }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the ThemeContext
export const useTheme = () => useContext(ThemeContext);
