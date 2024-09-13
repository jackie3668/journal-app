import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../../Context/ThemeContext'; 
import './AmbienceMixer.css'
import { Scrollbar } from 'react-scrollbars-custom';
import LoadingScreen from '../LoadingScreen/LoadingScreen';

const AmbienceMixer = ({ setSelectedMenu }) => {
  const { sounds, setSounds, updateVolume } = useTheme(); 
  const [allSounds, setAllSounds] = useState([]); 
  const [volumes, setVolumes] = useState({});
  const [categories, setCategories] = useState([]); 
  const [activeCategory, setActiveCategory] = useState('All'); 
  const [imagesLoadedCount, setImagesLoadedCount] = useState(0);
  const [loading, setLoading] = useState(true); 
  const [isDragging, setIsDragging] = useState(false);
  const [soundPositions, setSoundPositions] = useState(new Array(8).fill(null)); 

  useEffect(() => {
    const fetchSounds = async () => {
      try {
        const response = await axios.get('https://journal-app-backend-8szt.onrender.com/api/assets' || 'https://journal-app-backend-8szt.onrender.com/api/assets');
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
    const matchedSounds = sounds
      .map(name => allSounds.find(sound => sound.name === name))
      .filter(Boolean);

    const initialVolumes = matchedSounds.reduce((acc, sound) => {
      acc[sound.name] = volumes[sound.name] || 0.1; 
      return acc;
    }, {});

    setVolumes(initialVolumes);

    const newSoundPositions = [...soundPositions];
    sounds.forEach((soundName, index) => {
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
        setVolumes({ ...volumes, [sound.name]: 0.1 });
        updateVolume('ambient', sound.name, 0.1);
      }
    }
  };

  const handleVolumeChange = (soundName, volume) => {
    setVolumes({ ...volumes, [soundName]: volume });
    updateVolume('ambient', soundName, volume);
  };

  const handleRemoveSound = (soundName) => {
    setSounds(sounds.filter(s => s !== soundName));
    setVolumes(prevVolumes => {
      const newVolumes = { ...prevVolumes };
      delete newVolumes[soundName];
      return newVolumes;
    });
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
        console.log('finished');
        setLoading(false); 
      }
      return newCount;
    });
  };
  
  const handleSliderChange = (e, soundName) => {
    const sliderHeight = e.target.clientHeight;
    const newVolume = 1 - e.nativeEvent.offsetY / sliderHeight;
    setVolumes((prevVolumes) => ({
      ...prevVolumes,
      [soundName]: Math.max(0, Math.min(1, newVolume)),
    }));
    updateVolume('ambient', soundName, newVolume);
  };
  
  const handleSliderMove = (e, soundName) => {
    if (!isDragging) return;
    handleSliderChange(e, soundName);
  };
  
  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);
  

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
                  <div className="custom-slider">
                    <div className="custom-slider-thumb inactive"></div>
                  </div>
                  <span>None selected</span>
                </div>
              );
            }
            return (
              <div key={sound._id} className="sound-control clickable">
                <div
                  className="custom-slider clickable"
                  onMouseDown={(e) => handleSliderChange(e, sound.name)}
                  onMouseMove={(e) => handleSliderMove(e, sound.name)}
                  onMouseUp={() => setIsDragging(false)}
                  onMouseLeave={() => setIsDragging(false)}
                >
                  <div
                    className="active-track clickable"
                    style={{ height: `${volumes[sound.name] * 100}%` }}
                  ></div>
                  <div
                    className="custom-slider-thumb clickable"
                    style={{ top: `${(1 - volumes[sound.name]) * 100}%` }}
                  ></div>
                </div>
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
