import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../../Context/ThemeContext'; // Adjust the path according to your file structure

const TypingSound = ({ onSoundChange }) => {
  const { typingSoundName, setTypingSoundName } = useTheme(); // Access theme context
  const [sounds, setSounds] = useState([]);
  const [selectedSound, setSelectedSound] = useState('');
  const [volume, setVolume] = useState(1); // Default volume

  useEffect(() => {
    // Fetch typing sounds from the API
    const fetchSounds = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/assets');
        const typingSounds = response.data.filter(asset => asset.type === 'typing');
        setSounds(typingSounds);

        // Set default selected sound from the theme context, if available
        if (typingSoundName) {
          const matchingSound = typingSounds.find(sound => sound.name === typingSoundName);
          if (matchingSound) {
            setSelectedSound(matchingSound.url);
          }
        } else if (typingSounds.length > 0) {
          setSelectedSound(typingSounds[0].url);
        }
      } catch (error) {
        console.error('Error fetching assets:', error);
      }
    };

    fetchSounds();
  }, [typingSoundName]); // Re-fetch if typingSoundName changes

  useEffect(() => {
    onSoundChange({ url: selectedSound, volume }); // Notify parent with both URL and volume
    setTypingSoundName(sounds.find(sound => sound.url === selectedSound)?.name || ''); // Update context with the selected sound name
  }, [selectedSound, volume, onSoundChange, sounds, setTypingSoundName]);

  const handleSoundChange = (event) => {
    setSelectedSound(event.target.value);
  };

  const handleVolumeChange = (event) => {
    setVolume(parseFloat(event.target.value)); // Update volume state
  };

  return (
    <div>
      <label htmlFor="typing-sound">Select Typing Sound:</label>
      <select id="typing-sound" value={selectedSound} onChange={handleSoundChange}>
        {sounds.map((sound) => (
          <option key={sound._id} value={sound.url}>
            {sound.name}
          </option>
        ))}
      </select>

      <label htmlFor="volume">Volume:</label>
      <input
        type="range"
        id="volume"
        min="0"
        max="1"
        step="0.01"
        value={volume}
        onChange={handleVolumeChange}
      />
    </div>
  );
};

export default TypingSound;
