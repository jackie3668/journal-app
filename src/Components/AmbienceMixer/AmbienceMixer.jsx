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


      <div className="mixer-wrapper">
        <div className="mixer-panel">
          
          {new Array(8).fill(null).map((_, index) => {
              const soundName = sounds[index];
              const sound = allSounds.find(s => s.name === soundName);
              
              if (!sound) {
                return (
                  <div key={index} className="sound-control inactive">
                    <div
                      className="custom-slider"
                    >
                      <div
                        className="custom-slider-thumb inactive"
                      ></div>
                    </div>
                    <span>None selected</span>
                  </div>
                );
              }
              
              return (
                <div key={sound._id} className="sound-control clickable">
                  <div
                    className="custom-slider"
                    onMouseDown={(e) => handleSliderChange(e, sound.name)}
                    onMouseMove={(e) => handleSliderMove(e, sound.name)}
                    onMouseUp={() => setIsDragging(false)}
                    onMouseLeave={() => setIsDragging(false)}
                  >
                    <div
                      className="active-track"
                      style={{ height: `${volumes[sound.name] * 100}%` }}
                    ></div>
                    <div
                      className="custom-slider-thumb"
                      style={{ top: `${(1 - volumes[sound.name]) * 100}%` }}
                    ></div>
                  </div>
                  <img src={sound.imageUrl} alt={sound.name} className="sound-image" />
                  <span>{sound.name}</span>
                  <button onClick={() => handleRemoveSound(sound.name)}>Remove</button>

                </div>
              );
            })
          }
        </div>
      </div>


    </div>
  );
};

export default AmbienceMixer;
