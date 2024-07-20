import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext'; // Ensure this path and export are correct
import 'react-quill/dist/quill.snow.css';
import './JournalEditor.css';
import TypingSound from '../TypingSound/TypingSound'; // Ensure this path and export are correct
import QuillContainer from '../QuillContainer/QuillContainer'; // Ensure this path and export are correct
import AmbienceMixer from '../AmbienceMixer/AmbienceMixer'; // Ensure this path and export are correct

const JournalEditor = ({selectedEntry, onEntrySaved}) => {
  const [typingSound, setTypingSound] = useState({ url: '', volume: 1 });
  const [audio, setAudio] = useState(null);

  useEffect(() => {
    if (audio) {
      audio.pause();
      audio.src = '';
    }

    if (typingSound.url) {
      const newAudio = new Audio(typingSound.url);
      newAudio.volume = typingSound.volume;
      setAudio(newAudio);
    }
  }, [typingSound]);

  const handleKeyDown = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.play().catch((error) => {
        console.error('Error playing audio:', error);
      });
    }
  };

  // Define the handleEntrySaved function
  useEffect(() => {
    if (onEntrySaved) {
      console.log('onEntrySaved is defined');
    }
  }, [onEntrySaved]);
  return (
    <div className='journal-editor'>
      <AmbienceMixer />
      <TypingSound onSoundChange={setTypingSound} />
      <QuillContainer handleKeyDown={handleKeyDown} selectedEntry={selectedEntry} onEntrySaved={onEntrySaved} />
    </div>
  );
};

export default JournalEditor;
