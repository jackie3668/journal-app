import React, { useState } from 'react';
import sound1 from '../../Assets/Typing Sounds/01.mp3';
import sound2 from '../../Assets/Typing Sounds/02.mp3';
import sound3 from '../../Assets/Typing Sounds/03.mp3';
import sound4 from '../../Assets/Typing Sounds/04.mp3';

const TypingSound = ({ onSoundChange }) => {
  const localSounds = [
    { id: 1, name: 'Typing Sound 1', url: sound1 },
    { id: 2, name: 'Typing Sound 2', url: sound2 },
    { id: 3, name: 'Typing Sound 3', url: sound3 },
    { id: 4, name: 'Typing Sound 4', url: sound4 },
  ];

  const [selectedSound, setSelectedSound] = useState(localSounds[0].url);

  const handleSoundChange = (event) => {
    const soundUrl = event.target.value;
    setSelectedSound(soundUrl);
    onSoundChange(soundUrl); 
  };

  return (
    <div>
      <label htmlFor="typing-sound">Select Typing Sound:</label>
      <select id="typing-sound" value={selectedSound} onChange={handleSoundChange}>
        {localSounds.map((sound) => (
          <option key={sound.id} value={sound.url}>
            {sound.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TypingSound;
