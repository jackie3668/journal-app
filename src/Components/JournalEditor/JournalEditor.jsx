import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext';
import axios from 'axios';
import TypingSound from '../TypingSound/TypingSound';
import s1 from '../../Assets/Typing Sounds/01.mp3'
import s2 from '../../Assets/Typing Sounds/02.mp3'

const JournalEditor = () => {
  const { authState, login, userData } = useAuth(); // Get auth state, login function, and user data
  const [entryText, setEntryText] = useState(''); // State for journal entry
  const [loading, setLoading] = useState(false); // Loading state for save operation
  const [typingSound, setTypingSound] = useState(null); // Default typing sound
  const [audio, setAudio] = useState(null); // State for current audio object

  useEffect(() => {
    // Cleanup the previous audio if exists
    if (audio) {
      audio.pause();
      audio.src = ''; // Reset source
    }

    if (typingSound) {
      // Create a new Audio object and set its source when typingSound changes
      const newAudio = new Audio(typingSound);
      setAudio(newAudio);
    }
  }, [typingSound]);

  useEffect(() => {
    if (authState.isAuthenticated && userData) {
      // Load the entry from local storage if user is authenticated
      const savedEntry = localStorage.getItem('pendingEntry');
      if (savedEntry) {
        setEntryText(savedEntry);
        localStorage.removeItem('pendingEntry'); // Remove entry from local storage after loading
      }
    }
  }, [authState.isAuthenticated, userData]);

  const handleSave = async () => {
    if (!authState.isAuthenticated) {
      // Save entry to local storage if not authenticated
      localStorage.setItem('pendingEntry', entryText);
      login(); // Prompt user to login if not authenticated
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/entries', {
        userId: authState.user.sub,
        entryText,
        createdAt: new Date(),
      });
      console.log('Entry saved:', response.data);
      setEntryText(''); // Clear text area after saving
    } catch (error) {
      console.error('Error saving journal entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTextChange = (event) => {
    setEntryText(event.target.value);
    if (audio) {
      audio.pause(); // Stop the current audio
      audio.currentTime = 0; // Reset the audio to the beginning
      audio.play().catch((error) => {
        console.error('Error playing audio:', error);
      });
    }
  };

  const handlePlaySound = () => {
    if (audio) {
      audio.play().catch((error) => {
        console.error('Error playing audio:', error);
      });
    }
  };

  return (
    <div>
      <TypingSound onSoundChange={setTypingSound} /> {/* TypingSound component */}
      <h2>Journal Entry</h2>
      <textarea
        rows="10"
        cols="50"
        value={entryText}
        onChange={handleTextChange} // Update entryText and play sound on change
        placeholder="Write your journal entry here..."
      />
      <br />
      <button onClick={handleSave} disabled={loading}>
        {loading ? 'Saving...' : 'Save Entry'}
      </button>
      <audio controls id="beep">
        <source src={s1} type="audio/mp3" />
        Your browser does not support the audio tag.
      </audio>
    </div>
  );
};

export default JournalEditor;
