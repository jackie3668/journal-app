import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useTheme } from '../../Context/ThemeContext'; // Import the custom hook

const AmbienceMixer = () => {
  const { sounds: presetSounds } = useTheme(); // Get preset sounds from theme context
  const [sounds, setSounds] = useState([]);
  const [selectedSounds, setSelectedSounds] = useState([]);
  const [volumes, setVolumes] = useState({});
  const audioRefs = useRef({});

  // Fetch available sounds from the server
  useEffect(() => {
    const fetchSounds = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/assets');
        const soundAssets = response.data.filter(asset => asset.type === 'sound');
        setSounds(soundAssets);
      } catch (error) {
        console.error('Error fetching sounds:', error);
      }
    };
    fetchSounds();
  }, []);

  // Update selected sounds based on the preset
  useEffect(() => {
    if (presetSounds.length > 0) {
      // Match preset sounds with available sounds
      const matchedSounds = presetSounds
        .map(name => sounds.find(sound => sound.name === name))
        .filter(Boolean); // Filter out any null/undefined

      setSelectedSounds(matchedSounds);
      // Set default volumes for matched sounds
      const initialVolumes = matchedSounds.reduce((acc, sound) => {
        acc[sound._id] = 0.5; // Default volume
        return acc;
      }, {});
      setVolumes(initialVolumes);
    }
  }, [presetSounds, sounds]);

  const handleSelectSound = (sound) => {
    if (selectedSounds.length < 3 && !selectedSounds.some(s => s._id === sound._id)) {
      setSelectedSounds([...selectedSounds, sound]);
      setVolumes({ ...volumes, [sound._id]: 0.5 });
    }
  };

  const handleVolumeChange = (soundId, volume) => {
    setVolumes({ ...volumes, [soundId]: volume });
    if (audioRefs.current[soundId]) {
      audioRefs.current[soundId].volume = volume;
    }
  };

  const handleRemoveSound = (soundId) => {
    setSelectedSounds(selectedSounds.filter(sound => sound._id !== soundId));
    setVolumes(prevVolumes => {
      const newVolumes = { ...prevVolumes };
      delete newVolumes[soundId];
      return newVolumes;
    });
    // Remove the audio reference as well
    if (audioRefs.current[soundId]) {
      audioRefs.current[soundId].pause(); // Stop playing
      delete audioRefs.current[soundId];
    }
  };

  return (
    <div>
      <h2>Ambience Mixer</h2>
      <div className="sounds-list">
        <h3>Available Sounds</h3>
        <ul>
          {sounds.map((sound) => (
            <li key={sound._id}>
              {sound.name} <button onClick={() => handleSelectSound(sound)}>Add</button>
            </li>
          ))}
        </ul>
      </div>
      <div className="selected-sounds">
        <h3>Selected Sounds</h3>
        {selectedSounds.map((sound) => (
          <div key={sound._id} className="sound-control">
            <span>{sound.name}</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volumes[sound._id]}
              onChange={(e) => handleVolumeChange(sound._id, e.target.value)}
            />
            <button onClick={() => handleRemoveSound(sound._id)}>Remove</button>
            <audio
              ref={(el) => (audioRefs.current[sound._id] = el)}
              src={sound.url}
              autoPlay
              loop
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default AmbienceMixer;
