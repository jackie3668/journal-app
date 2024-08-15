import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../Context/ThemeContext';
import axios from 'axios';

const Player = () => {
  const { sounds, volumes } = useTheme();
  const [soundAssets, setSoundAssets] = useState([]);
  const audioRefs = useRef([]);

  useEffect(() => {
    const fetchSounds = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/assets' || 'https://journal-app-backend-8szt.onrender.com/api/assets');
        const soundAssets = response.data.filter(asset => asset.type === 'sound');
        setSoundAssets(soundAssets);
      } catch (error) {
        console.error('Error fetching sounds:', error);
      }
    };
    fetchSounds();
  }, []);

  useEffect(() => {
    audioRefs.current.forEach(audio => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });


    audioRefs.current = [];


    sounds.forEach((soundName) => {
      const soundAsset = soundAssets.find(asset => asset.name === soundName);
      if (soundAsset && soundAsset.url) {
        const audio = new Audio(soundAsset.url);
        audio.loop = true; 
        audio.volume = volumes.ambient[soundName] 
        audio.play().catch(err => console.error('Error playing sound:', err));
        audioRefs.current.push(audio); 
      }
    });

    return () => {
      audioRefs.current.forEach(audio => {
        if (audio) {
          audio.pause();
        }
      });
    };
  }, [sounds, soundAssets, volumes]); 

  return null; 
};

export default Player;
