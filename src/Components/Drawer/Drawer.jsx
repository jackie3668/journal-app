import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { extractPlainText } from '../../Utils/utils'; // Ensure this utility function exists
import './Drawer.css';

const Drawer = ({ onEntrySelect }) => {
  const [folders, setFolders] = useState([]);
  const [entries, setEntries] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState('Default');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);

  // Fetch folders on component mount
  useEffect(() => {
    const fetchFolders = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/folders');
        setFolders(response.data);
      } catch (error) {
        console.error('Error fetching folders:', error);
        setError('Failed to fetch folders');
      }
    };

    fetchFolders();
  }, []);

  // Fetch entries whenever the selected folder changes
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/entries', {
          params: { folderName: selectedFolder }
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
  }, [selectedFolder]);

  // Handle adding a new folder
  const handleAddNewFolder = async () => {
    if (!newFolderName.trim()) {
      return; // Avoid adding empty folder names
    }
    try {
      await axios.post('http://localhost:5000/api/folders', { name: newFolderName });
      setNewFolderName('');
      setShowNewFolderInput(false);

      // Refresh the folder list
      const response = await axios.get('http://localhost:5000/api/folders');
      setFolders(response.data);
    } catch (error) {
      console.error('Error adding new folder:', error.response ? error.response.data : error.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className='drawer'>
      <h2>Folders</h2>
      <select value={selectedFolder} onChange={(e) => setSelectedFolder(e.target.value)}>
        {folders.map((folder) => (
          <option key={folder._id} value={folder.name}>{folder.name}</option>
        ))}
        <option value="Default">Default</option>
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
            <li key={entry._id} className='entry-item' onClick={() => onEntrySelect(entry)}>
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
