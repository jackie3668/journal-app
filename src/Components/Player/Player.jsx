import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../Context/ThemeContext';
import axios from 'axios';

const Player = () => {
  const { sounds, volumes } = useTheme();
  const [soundAssets, setSoundAssets] = useState([]);
  const audioRefs = useRef({}); 

  useEffect(() => {
    const fetchSounds = async () => {
      try {
        const response = await axios.get('https://journal-app-backend-8szt.onrender.com/api/assets');
        const soundAssets = response.data.filter(asset => asset.type === 'sound');
        setSoundAssets(soundAssets);
      } catch (error) {
        console.error('Error fetching sounds:', error);
      }
    };
    fetchSounds();
  }, []);

  useEffect(() => {
    sounds.forEach((soundName) => {
      if (!audioRefs.current[soundName]) {
        const soundAsset = soundAssets.find(asset => asset.name === soundName);

        if (soundAsset && soundAsset.url) {
          const audio = new Audio(soundAsset.url);
          audio.loop = true; 
          audio.volume = volumes.ambient[soundName] || 0.1;

          audio.play().catch(err => console.error('Error playing sound:', err));
          audioRefs.current[soundName] = audio;
        }
      }
    });

    Object.keys(audioRefs.current).forEach((soundName) => {
      if (!sounds.includes(soundName)) {
        const audio = audioRefs.current[soundName];
        if (audio) {
          audio.pause();
          delete audioRefs.current[soundName];
        }
      }
    });

  }, [sounds, soundAssets, volumes]);

  useEffect(() => {
    Object.keys(audioRefs.current).forEach((soundName) => {
      const audio = audioRefs.current[soundName];
      if (audio) {
        audio.volume = volumes.ambient[soundName] || 0.1; 
      }
    });
  }, [volumes]);

  return null;
};

export default Player;
