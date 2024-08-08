import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [backgroundName, setBackgroundName] = useState('');
  const [typingSoundName, setTypingSoundName] = useState('');
  const [sounds, setSounds] = useState([]);
  const [backgroundUrl, setBackgroundUrl] = useState('https://cdn.pixabay.com/video/2023/10/26/186611-878455887_large.mp4'); 
  const [assets, setAssets] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null); 

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

  const selectPreset = (preset) => {
    if (preset) {
      const backgroundAsset = assets.find(asset => asset._id === preset.videoId);
      const typingSoundAsset = assets.find(asset => asset.name === preset.assets[0]);
      const otherSoundAssets = preset.assets.slice(1).map(name => assets.find(asset => asset.name === name));

      console.log('Background Asset:', backgroundAsset);


      setBackgroundName(preset.assets[0]); 
      setTypingSoundName(preset.assets[1]); 
      setSounds(otherSoundAssets.map(asset => asset ? asset.name : 'Unknown'));

      if (backgroundAsset) {
        setBackgroundUrl(backgroundAsset.url);
        console.log('Background URL from preset:', backgroundAsset.url);
      } else {
        setBackgroundUrl('');
      }
    } else {
      setBackgroundName('');
      setTypingSoundName('');
      setSounds([]);
      setBackgroundUrl('');
    }
  };

  return (
    <ThemeContext.Provider value={{
      backgroundName, setBackgroundName,
      typingSoundName, setTypingSoundName,
      sounds, backgroundUrl, setBackgroundUrl,
      selectPreset, selectedPrompt, setSelectedPrompt
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
