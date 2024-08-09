import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../Context/AuthContext';
import { extractPlainText } from '../../Utils/utils';
import { Scrollbar } from 'react-scrollbars-custom';
import './Drawer.css';

const Drawer = ({ onEntrySelect, onEntrySaved, selectedFolder, onFolderChange, isOpen, onClose }) => {
  const { authState } = useAuth();
  const { user, isAuthenticated, isLoading } = authState;
  const [folders, setFolders] = useState([]);
  const [entries, setEntries] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [filterTags, setFilterTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState({}); // Track expanded folders

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
  }, [isAuthenticated, isLoading, user, onEntrySaved]);

  useEffect(() => {
    const fetchTags = async () => {
      if (!isAuthenticated || isLoading) {
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/tags', {
          params: { userId: user.sub }
        });
        const tags = response.data;
        console.log('Fetched tags:', tags); // Log the fetched tags
        setAvailableTags(tags);
      } catch (error) {
        console.error('Error fetching tags:', error.response ? error.response.data : error.message);
        setError('Failed to fetch tags');
      }
    };

    fetchTags();
  }, [isAuthenticated, isLoading, user]);

  const fetchEntriesForFolder = async (folderName, selectedTags = []) => {
    if (!isAuthenticated || isLoading) {
      setError('User not authenticated or loading');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get('http://localhost:5000/api/entries', {
        params: {
          folderName,
          userId: user.sub,
          tags: selectedTags.join(','),
          searchQuery
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching entries:', error);
      setError('Failed to fetch entries');
      return [];
    }
  };

  const handleTagChange = async (event) => {
    const selectedTags = Array.from(event.target.selectedOptions, option => option.value);
    setFilterTags(selectedTags);

    const newEntries = {};
    const newExpandedFolders = {};

    for (const folder of folders) {
      const folderEntries = await fetchEntriesForFolder(folder.name, selectedTags);
      if (folderEntries.length > 0) {
        newEntries[folder.name] = folderEntries;
        newExpandedFolders[folder.name] = true; 
      }
    }

    setEntries(newEntries);
    setExpandedFolders(newExpandedFolders); 
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const clearFilters = () => {
    setFilterTags([]);
    setSearchQuery('');
    setExpandedFolders({}); 
  };

  const handleAddNewFolder = async () => {
    if (!newFolderName.trim() || !isAuthenticated || isLoading) {
      return;
    }
    try {
      await axios.post('http://localhost:5000/api/folders', {
        name: newFolderName,
        userId: user.sub
      });
      setNewFolderName('');
      setShowNewFolderInput(false);

      const response = await axios.get('http://localhost:5000/api/folders', {
        params: { userId: user.sub }
      });
      setFolders(response.data);

      if (typeof onFolderChange === 'function') {
        onFolderChange(selectedFolder);
      }
    } catch (error) {
      console.error('Error adding new folder:', error.response ? error.response.data : error.message);
    }
  };

  const handleFolderClick = (folder) => {
    const isExpanded = !!expandedFolders[folder.name];
    if (isExpanded) {
      setExpandedFolders((prev) => ({ ...prev, [folder.name]: false }));
    } else {
      setExpandedFolders((prev) => ({ ...prev, [folder.name]: true }));
      if (!entries[folder.name]) {
        fetchEntriesForFolder(folder.name).then((folderEntries) => {
          setEntries((prevEntries) => ({
            ...prevEntries,
            [folder.name]: folderEntries
          }));
        });
      }
    }
  };

  const handleEntryClick = (entry) => {
    if (typeof onEntrySelect === 'function') {
      onEntrySelect(entry);
    } else {
      console.error('onEntrySelect is not a function');
    }
  };

  const handleAddEntryClick = () => {
    if (typeof onEntrySelect === 'function') {
      onEntrySelect(null);  // Deselect any selected entry, indicating a new entry
    }
  };

  return (
    <div className={`drawer ${isOpen ? 'open' : ''}`}>
      <button onClick={onClose} className="close-button">X</button>

      <h2>Search and Filter</h2>
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search by title, text, or tags"
        className="search-input"
      />

      <h2>Filter Entries by Tags</h2>
      <select
        multiple
        value={filterTags}
        onChange={handleTagChange}
        className="tags-select"
      >
        {availableTags.map((tag) => (
          <option key={tag} value={tag}>{tag}</option>
        ))}
      </select>

      <button onClick={clearFilters} className="clear-filters-button">Clear Filters</button>

      <h2>Folders</h2>
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
      <Scrollbar style={{ height: '300px' }}>
        <ul>
          {folders.map((folder) => (
            <li key={folder._id} className="folder-item">
             
              <div
                className={`folder-header ${expandedFolders[folder.name] ? 'active' : ''}`}
              >
                <span onClick={() => handleFolderClick(folder)}>Open</span>
                {folder.name}
                <span className="add-entry" onClick={handleAddEntryClick}>Add Entry</span>
              </div>
              {expandedFolders[folder.name] && (
                <ul className="entries-list">
                  {entries[folder.name] && entries[folder.name].length > 0 ? (
                    entries[folder.name].map((entry) => {
                      const plainText = extractPlainText(entry.entryText);
                      const preview = plainText.length > 30 ? plainText.slice(0, 30) + '...' : plainText;
                      return (
                        <li key={entry._id} className="entry-item" onClick={() => handleEntryClick(entry)}>
                          <h3>{entry.entryTitle}</h3>
                          <p>{preview}</p>
                          <small>{new Date(entry.createdAt).toLocaleDateString()}</small>
                        </li>
                      );
                    })
                  ) : (
                    <li>No entries found</li>
                  )}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </Scrollbar>
    </div>
  );
};

export default Drawer;
