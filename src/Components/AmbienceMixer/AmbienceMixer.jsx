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

  useEffect(() => {
    const fetchSounds = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/assets');
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
  }, [sounds, allSounds]);

  const handleSelectSound = (sound) => {
    if (sounds.length < 8 && !sounds.some(s => s === sound.name)) {
      setSounds([...sounds, sound.name]); 
      setVolumes({ ...volumes, [sound.name]: 0.1 });
      updateVolume('ambient', sound.name, 0.1);
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
    updateVolume('ambient', soundName, 0);
  };

  const filteredSounds = activeCategory === 'All'
    ? allSounds
    : allSounds.filter(sound => sound.category === activeCategory);


  const handleImageLoad = () => {
    setImagesLoadedCount(prevCount => {
      const newCount = prevCount + 1;
      if (newCount === 25) { 
        console.log('finished');
        setLoading(false); 
      }
      return newCount;
    });
  };
  

  return (
    <div className='ambience-mixer menu-container dark-glass'>
      <button className='close-gallery' onClick={() => setSelectedMenu('')}>close</button>
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


        {/* <ul className="gallery">
          {filteredSounds.map((sound) => (
            <li onClick={() => handleSelectSound(sound)} className='item' key={sound._id}>
              <img src={sound.imageUrl} alt={sound.name} className="sound-image" />
              <p className='item-title'>{sound.name}</p>
            </li>
          ))}
        </ul> */}

        <Scrollbar>
          <ul className="gallery sound">
            {filteredSounds.flatMap((sound) => 
              Array.from({ length: 5 }, (_, index) => (
                <li onClick={() => handleSelectSound(sound)} className='item' key={`${sound._id}-${index}`}>
                  <img src={sound.imageUrl} onLoad={handleImageLoad} alt={sound.name} className="sound-image" />
                  <p className='item-title'>{sound.name}</p>
                </li>
              ))
            )}
          </ul>
        </Scrollbar>
      </div>

      <div className="mixer-panel">
        <h3>Selected Sounds</h3>
        {sounds.map((soundName) => {
          const sound = allSounds.find(s => s.name === soundName);
          if (!sound) {
            return null;
          }
          return (
            <div key={sound._id} className="sound-control">
              <img src={sound.imageUrl} alt={sound.name} className="sound-image" />
              <span>{sound.name}</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volumes[sound.name]}
                onChange={(e) => handleVolumeChange(sound.name, parseFloat(e.target.value))}
                className="volume-slider"
              />
              <button onClick={() => handleRemoveSound(sound.name)}>Remove</button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AmbienceMixer;
