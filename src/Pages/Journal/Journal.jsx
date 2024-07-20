import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../Context/AuthContext'; // Adjust the import path as necessary

import JournalEditor from '../../Components/JournalEditor/JournalEditor';
import Background from '../../Components/Background/Background';
import Drawer from '../../Components/Drawer/Drawer';
import './Journal.css';

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
    console.log('Fetching entries with:', { folderName, userId }); // Debugging line
    try {
      const response = await axios.get('http://localhost:5000/api/entries', {
        params: { folderName, userId }
      });
      console.log('Entries fetched:', response.data); // Debugging line
      setEntries(response.data);
    } catch (error) {
      console.error('Error fetching entries:', error);
    }
  };

  const handleEntrySaved = () => {
    console.log('Entry saved in journal');
    setRefreshEntries(prev => !prev); // Toggle refresh flag
  };

  const handleFolderChange = (folderName) => {
    setSelectedFolder(folderName);
  };

  useEffect(() => {
    console.log('Refresh Entries:', refreshEntries); // Debugging line
    if (user) {
      fetchEntries(selectedFolder, user.sub); // Fetch entries based on folder and user ID
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
        <Background />
        <JournalEditor 
          selectedEntry={selectedEntry} 
          onEntrySaved={handleEntrySaved} 
        />
      </div>
    </div>
  );
};

export default Journal;
