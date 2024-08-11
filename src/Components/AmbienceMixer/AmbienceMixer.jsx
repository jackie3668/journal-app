import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../../Context/ThemeContext'; 

const AmbienceMixer = ({ setSelectedMenu }) => {
  const { sounds, setSounds, updateVolume } = useTheme(); 
  const [allSounds, setAllSounds] = useState([]); 
  const [volumes, setVolumes] = useState({});

  useEffect(() => {
    const fetchSounds = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/assets');
        const soundAssets = response.data.filter(asset => asset.type === 'sound');
        setAllSounds(soundAssets);
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

  return (
    <div className='menu-container dark-glass'>
      <button onClick={() => setSelectedMenu('')}>close</button>

      <div className="sounds-list">
        <h3>Available Sounds</h3>
        <ul>
          {allSounds.map((sound) => (
            <li key={sound._id}>
              {sound.name} 
              <button onClick={() => handleSelectSound(sound)}>Add</button>
            </li>
          ))}
        </ul>
      </div>


      <div className="selected-sounds">
        <h3>Selected Sounds</h3>
        {sounds.map((soundName) => {
          const sound = allSounds.find(s => s.name === soundName);
          if (!sound) {
            return null;
          }
          return (
            <div key={sound._id} className="sound-control">
              <span>{sound.name}</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volumes[sound.name]}
                onChange={(e) => handleVolumeChange(sound.name, parseFloat(e.target.value))}
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
