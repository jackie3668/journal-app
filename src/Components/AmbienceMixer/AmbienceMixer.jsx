import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../../Context/ThemeContext'; 
import 'rc-slider/assets/index.css'; // Import slider CSS
import Slider from 'rc-slider'; // Import the slider component
import { Scrollbar } from 'react-scrollbars-custom';
import LoadingScreen from '../LoadingScreen/LoadingScreen';
import './AmbienceMixer.css';

const AmbienceMixer = ({ setSelectedMenu }) => {
  const { sounds, setSounds, volumes, updateVolume } = useTheme();
  const [allSounds, setAllSounds] = useState([]); 
  const [categories, setCategories] = useState([]); 
  const [activeCategory, setActiveCategory] = useState('All'); 
  const [imagesLoadedCount, setImagesLoadedCount] = useState(0);
  const [loading, setLoading] = useState(true); 
  const [soundPositions, setSoundPositions] = useState(new Array(8).fill(null)); 

  useEffect(() => {
    const fetchSounds = async () => {
      try {
        const response = await axios.get('https://journal-app-backend-8szt.onrender.com/api/assets');
        const soundAssets = response.data.filter(asset => asset.type === 'sound');
        setAllSounds(soundAssets);

        const uniqueCategories = ['All', ...new Set(soundAssets.map(sound => sound.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching sounds:', error);
      }
    };
    fetchSounds();
  }, []);

  useEffect(() => {
    const newSoundPositions = [...soundPositions];
    sounds.forEach((soundName) => {
      const positionIndex = newSoundPositions.indexOf(soundName);
      if (positionIndex === -1) {
        const availablePosition = newSoundPositions.findIndex(pos => pos === null);
        if (availablePosition !== -1) {
          newSoundPositions[availablePosition] = soundName;
        }
      }
    });
    setSoundPositions(newSoundPositions);
  }, [sounds, allSounds]);

  const handleSelectSound = (sound) => {
    if (!soundPositions.includes(sound.name)) {
      const availablePosition = soundPositions.findIndex(pos => pos === null);
      if (availablePosition !== -1) {
        const newSounds = [...sounds];
        newSounds[availablePosition] = sound.name;
        setSounds(newSounds);
        setSoundPositions(prevPositions => {
          const newPositions = [...prevPositions];
          newPositions[availablePosition] = sound.name;
          return newPositions;
        });
        updateVolume('ambient', sound.name, volumes.ambient[sound.name] || 0.1); 
      }
    }
  };

  const handleVolumeChange = (soundName, value) => {
    updateVolume('ambient', soundName, value / 100); // rc-slider returns values between 0 and 100, convert it to 0-1
  };

  const handleRemoveSound = (soundName) => {
    setSounds(sounds.filter(s => s !== soundName));
    setSoundPositions(prevPositions => prevPositions.map(pos => (pos === soundName ? null : pos)));
    updateVolume('ambient', soundName, 0); 
  };

  const filteredSounds = activeCategory === 'All'
    ? allSounds
    : allSounds.filter(sound => sound.category === activeCategory);

  const handleImageLoad = () => {
    setImagesLoadedCount(prevCount => {
      const newCount = prevCount + 1;
      if (newCount === 14) { 
        setLoading(false); 
      }
      return newCount;
    });
  };

  return (
    <div className='ambience-mixer menu-container dark-glass'>
      <button className='close-gallery' onClick={() => setSelectedMenu('')}>Close</button>
      {loading && (<LoadingScreen />)}
      <div className="top">
        <div className="tab-nav-bar">
          {categories.map((category) => (
            <div
              key={category}
              className={`tab-nav-item ${category === activeCategory ? 'active' : ''}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </div>
          ))}
        </div>

        <Scrollbar>
          <ul className="gallery sound">
            {filteredSounds.flatMap((sound) => 
              Array.from({ length: 1 }, (_, index) => (
                <li onClick={() => handleSelectSound(sound)} className='item' key={`${sound._id}-${index}`}>
                  <img src={sound.imageUrl} onLoad={handleImageLoad} alt={sound.name} className="sound-image" />
                  <p className='item-title'>{sound.name}</p>
                </li>
              ))
            )}
          </ul>
        </Scrollbar>
      </div>

      <div className="mixer-wrapper">
        <div className="mixer-panel">
          {soundPositions.map((soundName, index) => {
            const sound = allSounds.find(s => s.name === soundName);
            if (!sound) {
              return (
                <div key={index} className="sound-control inactive">
                  <span>None selected</span>
                </div>
              );
            }
            return (
              <div key={sound._id} className="sound-control clickable">
                <Slider
                  vertical
                  min={0}
                  max={100}
                  value={(volumes.ambient[sound.name] || 0) * 100} 
                  onChange={(value) => handleVolumeChange(sound.name, value)}
                  className="custom-slider clickable"
                />
                <img src={sound.imageUrl} alt={sound.name} className="sound-image" />
                <span>{sound.name}</span>
                <button onClick={() => handleRemoveSound(sound.name)}>Remove</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AmbienceMixer;
