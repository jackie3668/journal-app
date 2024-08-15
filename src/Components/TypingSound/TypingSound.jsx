import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../../Context/ThemeContext';
import './TypingSound.css';

const TypingSound = ({ onSoundChange, setSelectedMenu }) => {
  const { typingSoundName, setTypingSoundName } = useTheme();
  const [sounds, setSounds] = useState([]);
  const [selectedSound, setSelectedSound] = useState('');
  const [volume, setVolume] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [audio, setAudio] = useState(null);

  useEffect(() => {
    const fetchSounds = async () => {
      try {
        const response = await axios.get('https://journal-app-backend-8szt.onrender.com/api/assets' || 'https://journal-app-backend-8szt.onrender.com/api/assets');
        const typingSounds = response.data.filter(asset => asset.type === 'typing');
        setSounds(typingSounds);

        if (typingSoundName) {
          const matchingSound = typingSounds.find(sound => sound.name === typingSoundName);
          if (matchingSound) {
            setSelectedSound(matchingSound.url);
          }
        } else if (typingSounds.length > 0) {
          setSelectedSound(typingSounds[0].url);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching assets:', error); 
        setError('Failed to load typing sounds.');
        setLoading(false);
      }
    };

    fetchSounds();
  }, [typingSoundName]);

  useEffect(() => {
    if (selectedSound) {
      onSoundChange({ url: selectedSound, volume });
      setTypingSoundName(sounds.find(sound => sound.url === selectedSound)?.name || '');

      if (audio) {
        audio.pause();
      }

      const newAudio = new Audio(selectedSound);
      newAudio.volume = volume;
      newAudio.play().catch(err => console.error('Error playing sound:', err));
      setAudio(newAudio);
    }
  }, [selectedSound, volume, onSoundChange, sounds, setTypingSoundName]);

  const handleSoundChange = (soundUrl) => {
    setSelectedSound(soundUrl);
  };

  const handleVolumeChange = (event) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);

    if (audio) {
      audio.volume = newVolume;
    }
  };

  return (
    <div className="typing-sound-menu glass">
      <button className='close-gallery' onClick={() => setSelectedMenu('')}>Close</button>
      <div className="setting-group volume">
        <label htmlFor="volume">Volume:</label>
        <input
          type="range"
          id="volume"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          aria-label={`Volume: ${Math.round(volume * 100)}%`}
        />
        <span>{Math.round(volume * 100)}%</span>
      </div>
      <div className="setting-group">
        {loading ? (
          <p>Loading sounds...</p>
        ) : error ? (
          <p className="error-message">{error}</p>
        ) : (
          <ul className="sound-list">
            {sounds.map((sound) => (
              <li
                key={sound._id}
                className={`sound-item ${selectedSound === sound.url ? 'active' : ''}`}
                onClick={() => handleSoundChange(sound.url)}
              >
                {sound.name}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TypingSound;
