import React, { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../Context/ThemeContext';
import axios from 'axios';

const Player = () => {
  const { sounds, volumes } = useTheme();  // Get sounds and volumes from ThemeContext
  const [soundAssets, setSoundAssets] = useState([]);
  const audioRefs = useRef([]);

  useEffect(() => {
    const fetchSounds = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/assets');
        const soundAssets = response.data.filter(asset => asset.type === 'sound');
        setSoundAssets(soundAssets);
      } catch (error) {
        console.error('Error fetching sounds:', error);
      }
    };
    fetchSounds();
  }, []);

  useEffect(() => {
    console.log(sounds);
    
    // Stop and reset previous sounds
    audioRefs.current.forEach(audio => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    });

    // Clear the ref array
    audioRefs.current = [];

    // Play new sounds with the corresponding volume from the context
    sounds.forEach((soundName) => {
      const soundAsset = soundAssets.find(asset => asset.name === soundName);
      if (soundAsset && soundAsset.url) {
        console.log(`Playing sound: ${soundAsset.url}`); // Log the sound URL
        const audio = new Audio(soundAsset.url);
        audio.loop = true; 
        audio.volume = volumes.ambient[soundName] 
        audio.play().catch(err => console.error('Error playing sound:', err));
        audioRefs.current.push(audio); // Add audio object to refs
      }
    });

    // Cleanup when the component is unmounted or sounds change
    return () => {
      audioRefs.current.forEach(audio => {
        if (audio) {
          audio.pause();
        }
      });
    };
  }, [sounds, soundAssets, volumes]); // Dependency on sounds, soundAssets, and volumes

  return null; 
};

export default Player;
