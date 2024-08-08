import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '../../Context/AuthContext';
import './Journal.css';
import TypingSound from '../../Components/TypingSound/TypingSound';
import QuillContainer from '../../Components/QuillContainer/QuillContainer';
import AmbienceMixer from '../../Components/AmbienceMixer/AmbienceMixer';
import Drawer from '../../Components/Drawer/Drawer';
import BackgroundSelector from '../../Components/BackgroundSelector/BackgroundSelector';
import JournalSideMenu from '../../Components/JournalSideMenu/JournalSideMenu'
import { Scrollbar } from 'react-scrollbars-custom';


const Journal = () => {
  const { authState } = useAuth();
  const { user } = authState;
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [entries, setEntries] = useState([]);
  const [refreshEntries, setRefreshEntries] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('Default');
  const [typingSound, setTypingSound] = useState({ url: '', volume: 1 });
  const [audio, setAudio] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(null); 

  useEffect(() => {
    if (user) {
      fetchEntries(selectedFolder, user.sub);
    }
  }, [refreshEntries, selectedFolder, user]);

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

  const handleSelectEntry = (entry) => {
    setSelectedEntry(entry);
  };

  const fetchEntries = async (folderName, userId) => {
    try {
      const response = await axios.get('http://localhost:5000/api/entries', {
        params: { folderName, userId }
      });
      setEntries(response.data);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  const handleEntrySaved = () => {
    setRefreshEntries(prev => !prev);
  };

  const handleFolderChange = (folderName) => {
    setSelectedFolder(folderName);
  };

  const handleMenuSelect = (menu) => {
    setSelectedMenu(menu);
  };

  return (
    <Scrollbar>
      <div className='journal-container'>
        <div className="editor">
          <QuillContainer 
            handleKeyDown={handleKeyDown} 
            setSelectedEntry={setSelectedEntry} 
            selectedEntry={selectedEntry} 
            onEntrySaved={handleEntrySaved} 
          />
        </div>
        <div className="menu">
          <JournalSideMenu onSelect={handleMenuSelect} />
        </div>
        {selectedMenu === 'drawer' && (
          <Drawer 
            onEntrySelect={handleSelectEntry} 
            onEntrySaved={handleEntrySaved} 
            selectedFolder={selectedFolder}
            onFolderChange={handleFolderChange} 
          />
        )}
        {selectedMenu === 'background' && <BackgroundSelector />}
        {selectedMenu === 'ambience' && <AmbienceMixer />}
        {selectedMenu === 'typingSound' && <TypingSound onSoundChange={setTypingSound} />}
      </div>
    </Scrollbar>
  );
};

export default Journal;
