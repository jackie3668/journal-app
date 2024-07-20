import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../Context/AuthContext';
import 'react-quill/dist/quill.snow.css';
import ReactQuill from 'react-quill';
import './JournalEditor.css';
import TypingSound from '../TypingSound/TypingSound';
import QuillContainer from '../QuillContainer/QuillContainer';
import AmbienceMixer from '../AmbienceMixer/AmbienceMixer';

const JournalEditor = () => {
  const { authState, login, userData } = useAuth();
  const [entryTitle, setEntryTitle] = useState('');
  const [entryText, setEntryText] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('Default');
  const [folders, setFolders] = useState([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
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

  useEffect(() => {
    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/folders');
      setFolders(response.data);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };

  const handleSave = async () => {
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
  };


  const handleChange = (content) => {
    setEntryText(content);
  };

  const handleAddNewFolder = async () => {
    try {
      await axios.post('http://localhost:5000/api/folders', { name: newFolderName });
      setNewFolderName('');
      setShowNewFolderInput(false);

      const response = await axios.get('http://localhost:5000/api/folders');
      setFolders(response.data);
    } catch (error) {
      console.error('Error adding new folder:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div className='journal-editor'>
      <AmbienceMixer />
      <TypingSound onSoundChange={setTypingSound} />
      <QuillContainer 
        entryText={entryText}
        entryTitle={entryTitle}
        setEntryTitle={setEntryTitle}
        handleKeyDown={handleKeyDown}
        handleChange={handleChange}
        handleAddNewFolder={handleAddNewFolder}
        selectedFolder={selectedFolder}
        setSelectedFolder={setSelectedFolder}
        newFolderName={newFolderName}
        setNewFolderName={setNewFolderName}
        folders={folders}
        fetchFolders={fetchFolders}
        showNewFolderInput={showNewFolderInput}
        setShowNewFolderInput={setShowNewFolderInput}

      />
      <button className='save' onClick={handleSave} disabled={loading}>
        {loading ? 'Saving...' : 'Save Entry'}
      </button>
    </div>
  );
};

export default JournalEditor;
