import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../Context/AuthContext';
import 'react-quill/dist/quill.snow.css';
import './JournalEditor.css';
import TypingSound from '../TypingSound/TypingSound';
import QuillContainer from '../QuillContainer/QuillContainer';
import AmbienceMixer from '../AmbienceMixer/AmbienceMixer';

const JournalEditor = () => {
  const { authState, login, userData } = useAuth();
  const [typingSound, setTypingSound] = useState({ url: '', volume: 1 });
  const [audio, setAudio] = useState(null);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (authState.isAuthenticated && userData) {
      const savedEntry = localStorage.getItem('pendingEntry');
      if (savedEntry) {
        localStorage.removeItem('pendingEntry');
      }
    }
  }, [authState.isAuthenticated, userData]);

  const handleSave = async (entryTitle, entryText, selectedFolder) => {
    if (!authState.isAuthenticated) {
      localStorage.setItem('pendingEntry', entryText);
      login();
      return;
    }

    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/entries', {
        userId: authState.user.sub,
        entryTitle,
        entryText,
        folderName: selectedFolder,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Error saving journal entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = () => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio.play().catch((error) => {
        console.error('Error playing audio:', error);
      });
    }
  };

  return (
    <div className='journal-editor'>
      <AmbienceMixer />
      <TypingSound onSoundChange={setTypingSound} />
      <QuillContainer 
        handleKeyDown={handleKeyDown}
        handleSave={handleSave}
      />
    </div>
  );
};

export default JournalEditor;
