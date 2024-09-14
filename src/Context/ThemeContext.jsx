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
  const [volumes, setVolumes] = useState({
    typing: {},
    ambient: {},
  }); 

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await axios.get('https://journal-app-backend-8szt.onrender.com/api/assets' || 'https://journal-app-backend-8szt.onrender.com/api/assets');
        setAssets(response.data);
      } catch (err) {
        console.error('Error fetching assets:', err);
      }
    };

    fetchAssets();
  }, []);

  useEffect(() => {
    console.log(selectedPrompt);
    
  },[selectedPrompt])

  const selectPreset = (preset) => {
    if (preset) {
      const backgroundAsset = assets.find(asset => asset._id === preset.videoId);
      const typingSoundAsset = assets.find(asset => asset.name === preset.assets[0]);
      const otherSoundAssets = preset.assets.slice(1).map(name => assets.find(asset => asset.name === name)).filter(Boolean);

      setBackgroundName(preset.assets[0]);
      setTypingSoundName(typingSoundAsset ? typingSoundAsset.name : '');
      setSounds(otherSoundAssets.map(asset => asset.name));

      if (backgroundAsset) {
        setBackgroundUrl(backgroundAsset.url);
      } else {
        setBackgroundUrl('');
        console.log('No Background URL found');
      }

      const newVolumes = {
        typing: {},
        ambient: {},
      };

      if (typingSoundAsset) {
        newVolumes.typing[typingSoundAsset.name] = volumes.typing[typingSoundAsset.name] || 0.1;
      }

      otherSoundAssets.forEach(asset => {
        if (asset) {
          newVolumes.ambient[asset.name] = volumes.ambient[asset.name] || 0.1;
        }
      });

      setVolumes(newVolumes);

    } else {
      setBackgroundName('');
      setTypingSoundName('');
      setSounds([]);
      setBackgroundUrl('');
      setVolumes({ typing: {}, ambient: {} });
    }
  };

  const updateVolume = (soundType, soundName, volume) => {
    setVolumes(prevVolumes => ({
      ...prevVolumes,
      [soundType]: {
        ...prevVolumes[soundType],
        [soundName]: volume,
      },
    }));
  };

  return (
    <ThemeContext.Provider value={{
      backgroundName, setBackgroundName,
      typingSoundName, setTypingSoundName,
      sounds, setSounds, volumes, updateVolume, backgroundUrl, setBackgroundUrl,
      selectPreset, selectedPrompt, setSelectedPrompt
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
