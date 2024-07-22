import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../Context/AuthContext'; // Adjust the import path as necessary
import JournalEditor from '../../Components/JournalEditor/JournalEditor';
import Background from '../../Components/Background/Background';
import Drawer from '../../Components/Drawer/Drawer';
import './Journal.css';
import BackgroundSelector from '../../Components/BackgroundSelector/BackgroundSelector';

const Journal = () => {
  const { authState } = useAuth();
  const { user } = authState;
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [entries, setEntries] = useState([]);
  const [refreshEntries, setRefreshEntries] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState('Default'); // Default folder

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

  useEffect(() => {
    if (user) {
      fetchEntries(selectedFolder, user.sub); 
    }
  }, [refreshEntries, selectedFolder, user]);

  return (
    <div className='journal-page'>
      <div className="left">
        <Drawer 
          onEntrySelect={handleSelectEntry} 
          onEntrySaved={handleEntrySaved} 
          selectedFolder={selectedFolder}
          onFolderChange={handleFolderChange} // Pass the handler for folder changes
        />
      </div>
      <div className="right">
        <BackgroundSelector />
        <JournalEditor 
          selectedEntry={selectedEntry} 
          onEntrySaved={handleEntrySaved} 
          setSelectedEntry={setSelectedEntry}
        />
      </div>
    </div>
  );
};

export default Journal;
