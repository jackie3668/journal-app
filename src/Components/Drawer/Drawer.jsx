import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../Context/AuthContext'; // Adjust the import path as necessary
import { extractPlainText } from '../../Utils/utils'; // Ensure this utility function exists
import './Drawer.css';

const Drawer = ({ onEntrySelect, onEntrySaved, selectedFolder, onFolderChange }) => {
  const { authState } = useAuth();
  const { user, isAuthenticated, isLoading } = authState;
  const [folders, setFolders] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);

  // Fetch folders on component mount and when `onEntrySaved` triggers a refresh
  useEffect(() => {
    const fetchFolders = async () => {
      if (!isAuthenticated || isLoading) {
        setError('User not authenticated or loading');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/folders', {
          params: { userId: user.sub }
        });
        setFolders(response.data);
      } catch (error) {
        console.error('Error fetching folders:', error);
        setError('Failed to fetch folders');
      } finally {
        setLoading(false);
      }
    };

    fetchFolders();
  }, [isAuthenticated, isLoading, user, onEntrySaved]); // Add onEntrySaved to dependency array

  // Fetch entries when selectedFolder changes or when `onEntrySaved` triggers a refresh
  useEffect(() => {
    const fetchEntries = async () => {
      if (!isAuthenticated || isLoading) {
        setError('User not authenticated or loading');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/entries', {
          params: { folderName: selectedFolder, userId: user.sub }
        });
        setEntries(response.data);
      } catch (error) {
        console.error('Error fetching entries:', error);
        setError('Failed to fetch entries');
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [selectedFolder, isAuthenticated, isLoading, user, onEntrySaved]); // Add onEntrySaved to dependency array

  // Handle adding a new folder
  const handleAddNewFolder = async () => {
    if (!newFolderName.trim() || !isAuthenticated || isLoading) {
      return; // Avoid adding empty folder names or if user is not authenticated
    }

    try {
      await axios.post('http://localhost:5000/api/folders', { 
        name: newFolderName,
        userId: user.sub 
      });
      setNewFolderName('');
      setShowNewFolderInput(false);

      // Refresh the folder list
      const response = await axios.get('http://localhost:5000/api/folders', {
        params: { userId: user.sub }
      });
      setFolders(response.data);

      // Notify parent about the new folder
      if (typeof onFolderChange === 'function') {
        onFolderChange(selectedFolder); // Notify about the current folder
      }
    } catch (error) {
      console.error('Error adding new folder:', error.response ? error.response.data : error.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  // Handle entry click
  const handleEntryClick = (entry) => {
    if (typeof onEntrySelect === 'function') {
      onEntrySelect(entry);
    } else {
      console.error('onEntrySelect is not a function');
    }
  };

  return (
    <div className='drawer'>
      <h2>Folders</h2>
      <select 
        value={selectedFolder} 
        onChange={(e) => {
          const newFolder = e.target.value;
          if (typeof onFolderChange === 'function') {
            onFolderChange(newFolder);
          }
        }}
      >
        {folders.map((folder) => (
          <option key={folder._id} value={folder.name}>{folder.name}</option>
        ))}
      </select>

      <div>
        {showNewFolderInput ? (
          <div>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="New Folder Name"
            />
            <button onClick={handleAddNewFolder}>Add Folder</button>
            <button onClick={() => setShowNewFolderInput(false)}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => setShowNewFolderInput(true)}>Add New Folder</button>
        )}
      </div>

      <h2>Entries</h2>
      <ul>
        {entries.map((entry) => {
          const plainText = extractPlainText(entry.entryText);
          const preview = plainText.length > 30 ? plainText.slice(0, 30) + '...' : plainText;
          return (
            <li key={entry._id} className='entry-item' onClick={() => handleEntryClick(entry)}>
              <h3>{entry.entryTitle}</h3>
              <p>{preview}</p>
              <small>{new Date(entry.createdAt).toLocaleDateString()}</small>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Drawer;
