import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import './JournalEditor.css';
import TypingSound from '../TypingSound/TypingSound';
import QuillContainer from '../QuillContainer/QuillContainer';
import AmbienceMixer from '../AmbienceMixer/AmbienceMixer';

const JournalEditor = () => {
  const { authState, login, userData } = useAuth();
  const [entryTitle, setEntryTitle] = useState('');
  const [entryText, setEntryText] = useState('');
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    if (authState.isAuthenticated && userData) {
      const savedEntry = localStorage.getItem('pendingEntry');
      if (savedEntry) {
        setEntryText(savedEntry);
        localStorage.removeItem('pendingEntry');
      }
    }
  }, [authState.isAuthenticated, userData]);

  const handleSave = async () => {
    console.log(entryTitle, entryText);
    if (!authState.isAuthenticated) {
      localStorage.setItem('pendingEntry', entryText);
      login();
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/entries', {
        userId: authState.user.sub,
        entryTitle: entryTitle, 
        entryText: entryText,
        createdAt: new Date(),
      });
      console.log('Entry saved:', response.data);
      setEntryTitle(''); 
      setEntryText(''); 
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
  }

  const handleTitleChange = (content) => {
    setEntryTitle(content);
  };

  const handleChange = (content) => {
    setEntryText(content);
  };

  return (
    <div className='journal-editor'>
      <AmbienceMixer />
      <TypingSound onSoundChange={setTypingSound} />
      <QuillContainer 
        className='quill-container'
        entryText={entryText}
        handleChange={handleChange}
        handleTitleChange={handleTitleChange}
        setEntryText={setEntryText}
        setEntryTitle={setEntryTitle}
        handleKeyDown={handleKeyDown}
      />
      <button className='save' onClick={handleSave} disabled={loading}>
        {loading ? 'Saving...' : 'Save Entry'}
      </button>
    </div>
  );
};

export default JournalEditor;
