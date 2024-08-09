import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../Context/AuthContext';
import { extractPlainText } from '../../Utils/utils';
import { Scrollbar } from 'react-scrollbars-custom';
import './Drawer.css';
import folderIcon from '../../Assets/UI/Journal/folder (1).png'
import arrow from '../../Assets/UI/Journal/down-arrow (3).png'
import collapse from '../../Assets/UI/Journal/radix-icons_pin-left.png'
import add from '../../Assets/UI/Journal/more.png'
import file from '../../Assets/UI/Journal/file.png'
import filter from '../../Assets/UI/Journal/filter.png'
import search from '../../Assets/UI/Journal/search-interface-symbol (1).png'

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
  const [expandedFolders, setExpandedFolders] = useState({}); 
  const [hoveredFolder, setHoveredFolder] = useState(null);  
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

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

  const toggleFilterDropdown = () => {
    setShowFilterDropdown(prev => !prev);
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
      onEntrySelect(null);  
    }
  };

  const handleFolderHover = (folderName) => {
    setHoveredFolder(folderName);
  };

  const handleFolderLeave = () => {
    setHoveredFolder(null);
  };

  

  return (
    <div className={`drawer glass ${isOpen ? 'open' : ''}`}>
      <button onClick={onClose} className="close-button">X</button>

      <div className="search-bar">
        <img src={search} alt="Search Icon" className="search-icon" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Search by title, text, or tags"
          className="search-input"
        />
      </div>


      <img
        src={filter}
        alt="Filter"
        className="filter-icon"
        onClick={toggleFilterDropdown}
      />

      {showFilterDropdown && (
        <div className="filter-dropdown">
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
        </div>
      )}


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
        <div onClick={() => setShowNewFolderInput(true)}>
          <img src={folderIcon} alt="" />
          <p>Add New Folder</p>
        </div>
      )}
      <Scrollbar style={{ height: '300px' }}>
        <ul>
          {folders.map((folder) => (
            <li key={folder._id} className="folder-item">
              <div
                  className={`folder-header ${expandedFolders[folder.name] ? 'active' : ''}`}
                >
                <img 
                  onMouseEnter={() => handleFolderHover(folder.name)}
                  onMouseLeave={handleFolderLeave}
                  src={hoveredFolder === folder.name ? arrow : folderIcon} 
                  alt="" 
                  onClick={() => handleFolderClick(folder)}
                />
                <p onClick={() => handleFolderClick(folder)}>{folder.name}</p>
                <img className="add-entry" onClick={handleAddEntryClick} src={add} alt="" />
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
