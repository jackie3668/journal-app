import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '../../Context/AuthContext';
import './Journal.css';
import TypingSound from '../../Components/TypingSound/TypingSound';
import QuillContainer from '../../Components/QuillContainer/QuillContainer';
import AmbienceMixer from '../../Components/AmbienceMixer/AmbienceMixer';
import PresetMenu from '../../Components/PresetMenu/PresetMenu';
import Drawer from '../../Components/Drawer/Drawer';
import BackgroundSelector from '../../Components/BackgroundSelector/BackgroundSelector';
import JournalSideMenu from '../../Components/JournalSideMenu/JournalSideMenu'
import { Scrollbar } from 'react-scrollbars-custom';

const Journal = () => {
  const { authState } = useAuth();
  const { user } = authState;
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [entries, setEntries] = useState({});
  const [folders, setFolders] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(false); 
  const [refreshEntries, setRefreshEntries] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('Default');
  const [typingSound, setTypingSound] = useState({ url: '', volume: 1 });
  const [audio, setAudio] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState('drawer'); 
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const drawerRef = useRef(null);

  useEffect(() => {
    fetchEntries();
    fetchFolders();
  }, [refreshTrigger, user]);
  
  const triggerRefresh = () => setRefreshTrigger(prev => !prev);
  const forceRefresh = () => setRefreshTrigger(prev => prev + 1);
  useEffect(() => {
    fetchEntries();  
  }, [refreshTrigger]);
  
  useEffect(() => {
    if (user) {
      fetchFolders(user.sub); 
    }
  }, [user]);
  

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
    if (entry === null) {      
      setSelectedEntry(null);
      setSelectedEntryId(null);
    } else {
      setSelectedEntry(entry);
      setSelectedEntryId(entry._id);
    }
  };

  const fetchEntries = async () => {
    if (!user) return;
    try {
      const response = await axios.get('https://journal-app-backend-8szt.onrender.com/api/entries', {
        params: { userId: user.sub }
      });
      const groupedEntries = response.data.reduce((acc, entry) => {
        acc[entry.folderName] = acc[entry.folderName] || [];
        acc[entry.folderName].push(entry);
        return acc;
      }, {});
      setEntries(groupedEntries);
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
    if (menu === 'drawer') {
      setIsDrawerOpen(!isDrawerOpen); 
    } else {
      setIsDrawerOpen(false); 
    }
  };

  const handleClosePresetMenu = () => {
    setSelectedMenu(''); 
  };

  const fetchFolders = async () => {
    if (!user) return;
    try {
      const response = await axios.get('https://journal-app-backend-8szt.onrender.com/api/folders', {
        params: { userId: user.sub }
      });
      setFolders(response.data);
    } catch (error) {
      console.error('Error fetching folders:', error);
    }
  };
  
  
  const handleFolderAddedOrDeleted = () => {
    fetchFolders(user.sub);
  };

  return (
    <Scrollbar>
      <div className='journal-container'>
        <div className="editor">
          <QuillContainer
            handleKeyDown={handleKeyDown}
            selectedEntry={selectedEntry}
            setSelectedEntry={setSelectedEntry}
            selectedEntryId={selectedEntryId}
            setSelectedEntryId={setSelectedEntryId}
            folders={folders}
            entries={entries}
            refreshData={triggerRefresh}
            forceRefresh={forceRefresh} 
          />
        </div>
        <div className="menu">
          <JournalSideMenu onSelect={handleMenuSelect} />
        </div>
        {selectedMenu === 'drawer' && (
          <div ref={drawerRef}>
            <Drawer
              isOpen={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
              onEntrySelect={handleSelectEntry}
              selectedFolder={selectedFolder}
              entries={entries}
              folders={folders}
              refreshData={triggerRefresh}
              refreshTrigger={refreshTrigger} 
            />
          </div>
        )}
        {selectedMenu === 'background' && <BackgroundSelector setSelectedMenu={setSelectedMenu} />}
        {selectedMenu === 'ambience' && <AmbienceMixer setSelectedMenu={setSelectedMenu} />}
        {selectedMenu === 'typingSound' && <TypingSound onSoundChange={setTypingSound} setSelectedMenu={setSelectedMenu} />}
        {selectedMenu === 'preset' && (
          <PresetMenu setSelectedMenu={setSelectedMenu} onClose={handleClosePresetMenu} /> 
        )}
      </div>
    </Scrollbar>
  );
};

export default Journal;
