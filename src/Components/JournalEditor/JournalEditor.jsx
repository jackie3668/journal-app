import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import './JournalEditor.css'
import TypingSound from '../TypingSound/TypingSound';
import s1 from '../../Assets/Typing Sounds/01.mp3'

import QuillContainer from '../QuillContainer/QuillContainer';
import AmbienceMixer from '../AmbienceMixer/AmbienceMixer';

const JournalEditor = () => {

  const { authState, login, userData } = useAuth(); 
  const [entry, setEntry] = useState(''); 
  const [loading, setLoading] = useState(false); 
  const [typingSound, setTypingSound] = useState(s1);
  const [audio, setAudio] = useState(null); 
  const modules = {
    toolbar: [
      [{ 'font': [] },{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
      ['bold', 'italic', 'underline']
    ],
  };

  
  
  useEffect(() => {
    if (audio) {
      audio.pause();
      audio.src = '';
    }

    if (typingSound) {
      const newAudio = new Audio(typingSound);
      setAudio(newAudio);
    }
  }, [typingSound]);

  useEffect(() => {
    if (authState.isAuthenticated && userData) {
      const savedEntry = localStorage.getItem('pendingEntry');
      if (savedEntry) {
        setEntry(savedEntry);
        localStorage.removeItem('pendingEntry'); 
      }
    }
  }, [authState.isAuthenticated, userData]);

  const handleSave = async () => {
    if (!authState.isAuthenticated) {
      localStorage.setItem('pendingEntry', entry);
      login();
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/entries', {
        userId: authState.user.sub,
        entryText: entry,
        createdAt: new Date(),
      });
      console.log('Entry saved:', response.data);
      setEntry(''); 
    } catch (error) {
      console.error('Error saving journal entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (content) => {
    if (audio) {
      audio.pause();
      audio.currentTime = 0; 
      audio.play().catch((error) => {
        console.error('Error playing audio:', error);
      });
    }
    console.log(content);
    setEntry(content);
  };

  return (
    <div className='journal-editor'>
      <AmbienceMixer />
      <TypingSound onSoundChange={setTypingSound} /> 
      <QuillContainer 
        entry={entry}
        handleChange={handleChange}
      />
      <button onClick={handleSave} disabled={loading}>
        {loading ? 'Saving...' : 'Save Entry'}
      </button>
    </div>
  );
};

export default JournalEditor;
