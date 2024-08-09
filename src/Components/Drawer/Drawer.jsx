import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../Context/AuthContext'; 
import { extractPlainText } from '../../Utils/utils'; 
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
  const [filterTags, setFilterTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

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
    const fetchEntries = async () => {
      if (!isAuthenticated || isLoading) {
        setError('User not authenticated or loading');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/entries', {
          params: {
            folderName: selectedFolder,
            userId: user.sub,
            tags: filterTags.join(','), 
            searchQuery
          }
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
  }, [selectedFolder, isAuthenticated, isLoading, user, onEntrySaved, filterTags, searchQuery]); // Add filterTags and searchQuery to dependency array


  useEffect(() => {
    const fetchTags = async () => {
      if (!isAuthenticated || isLoading) {
        return;
      }
    
      try {
        const response = await axios.get('http://localhost:5000/api/tags', {
          params: { userId: user.sub }
        });
        setAvailableTags(response.data);
        
      } catch (error) {
        console.error('Error fetching tags:', error.response ? error.response.data : error.message);
        setError('Failed to fetch tags');
      }
    };
    
    fetchTags();
  }, [isAuthenticated, isLoading, user]);
  
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

  const handleTagChange = (event) => {
    const selectedTags = Array.from(event.target.selectedOptions, option => option.value);
    setFilterTags(selectedTags);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const clearFilters = () => {
    setFilterTags([]);
    setSearchQuery('');
  };

  if (loading) return <div>Loading...</div>;

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

      <h2>Filter Entries by Tags</h2>
      <select 
        multiple 
        value={filterTags} 
        onChange={handleTagChange}
      >
        {availableTags.map((tag) => (
          <option key={tag} value={tag}>{tag}</option>
        ))}
      </select>

      <h2>Search Entries</h2>
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search by title, text, or tags"
      />

      <button onClick={clearFilters}>Clear Filters</button>

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
