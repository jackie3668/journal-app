import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const AmbienceMixer = () => {
  const [sounds, setSounds] = useState([]);
  const [selectedSounds, setSelectedSounds] = useState([]);
  const [volumes, setVolumes] = useState({});
  const audioRefs = useRef({});

  useEffect(() => {
    const fetchSounds = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/sounds');
        setSounds(response.data);
      } catch (error) {
        console.error('Error fetching sounds:', error);
      }
    };
    fetchSounds();
  }, []);

  const handleSelectSound = (sound) => {
    if (selectedSounds.length < 3 && !selectedSounds.some(s => s._id === sound._id)) {
      setSelectedSounds([...selectedSounds, sound]);
      setVolumes({ ...volumes, [sound._id]: 1 });
    }
  };

  const handleVolumeChange = (soundId, volume) => {
    setVolumes({ ...volumes, [soundId]: volume });
    if (audioRefs.current[soundId]) {
      audioRefs.current[soundId].volume = volume;
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
