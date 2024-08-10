import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../Context/AuthContext';
import { extractPlainText } from '../../Utils/utils';
import { Scrollbar } from 'react-scrollbars-custom';
import './Drawer.css';
import folderIcon from '../../Assets/UI/Journal/folder (1).png'
import arrow from '../../Assets/UI/Journal/down-arrow (3).png'
import collapse from '../../Assets/UI/Journal/radix-icons_pin-left.png'
import add from '../../Assets/UI/Journal/more.png'
import filter from '../../Assets/UI/Journal/filter.png'
import search from '../../Assets/UI/Journal/search-interface-symbol (1).png'
import page from '../../Assets/Sounds/turnpage-99756.mp3'

const Drawer = ({ onEntrySelect, onEntrySaved, selectedFolder, onFolderChange, isOpen, onClose }) => {
  const { authState } = useAuth();
  const { user, isAuthenticated, isLoading } = authState;
  const [folders, setFolders] = useState([]);
  const [entries, setEntries] = useState({});
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [filterTags, setFilterTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState({}); 
  const [hoveredFolder, setHoveredFolder] = useState(null);  
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [isFolderListVisible, setIsFolderListVisible] = useState(false);
  const addFolderRef = useRef(null);

  useEffect(() => {
    const fetchFolders = async () => {
      if (!isAuthenticated || isLoading) {
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/folders', {
          params: { userId: user.sub }
        });
        setFolders(response.data);
      } catch (error) {
        console.error('Error fetching folders:', error);
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
      }
    };

    fetchTags();
  }, [isAuthenticated, isLoading, user]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (addFolderRef.current && !addFolderRef.current.contains(event.target)) {
        setShowNewFolderInput(false); 
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [addFolderRef]);


  const fetchEntriesForFolder = async (folderName, selectedTags = []) => {
    if (!isAuthenticated || isLoading) {
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
      return [];
    }
  };

  const handleTagChange = async (event) => {
    const selectedTag = event.target.value;
    const isChecked = event.target.checked;
  
    setFilterTags((prevTags) =>
      isChecked ? [...prevTags, selectedTag] : prevTags.filter((tag) => tag !== selectedTag)
    );

    const updatedTags = isChecked ? [...filterTags, selectedTag] : filterTags.filter((tag) => tag !== selectedTag);
    const newEntries = {};
    const newExpandedFolders = {};
  
    for (const folder of folders) {
      const folderEntries = await fetchEntriesForFolder(folder.name, updatedTags);
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
    const audio = new Audio(page);
    audio.play();
    
    if (typeof onEntrySelect === 'function') {
      onEntrySelect(entry);
    } else {
      console.error('onEntrySelect is not a function');
    }
  };

  const handleAddEntryClick = () => {
    const audio = new Audio(page);
    audio.play();
    
    if (typeof onEntrySelect === 'function') {
      onEntrySelect(null); 
    }
    if (typeof onClose === 'function') {
      onClose();  
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
      <div className='drawer-top'>
        <img src={collapse} onClick={onClose} className="close-button clickable"alt="" />
        <h3>Entries</h3>
      </div>

      <div className="drawer-content">
        <div className="search-and-filter">
          <div className="filter-wrapper">
            <img
              src={filter}
              alt="Filter"
              className={`filter-icon clickable ${showFilterDropdown ? 'active' : ''}`}
              onClick={toggleFilterDropdown}
            />
          </div>
          <div className="search-bar">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by title, text, or tags"
              className="search-input"
            />
            <img src={search} alt="Search Icon" className="search-icon clickable" />
          </div>
        </div>
        
        {showFilterDropdown && (
          <div className="filter-dropdown">
            <Scrollbar style={{ height: '10vh'}}>
              <ul className="tags-list">
                {availableTags.map((tag) => (
                  <li key={tag} className={`tag-item ${filterTags.includes(tag) ? 'selected' : ''}`}>
                    <input
                      type="checkbox"
                      id={`tag-${tag}`}
                      value={tag}
                      checked={filterTags.includes(tag)}
                      onChange={handleTagChange}
                    />
                    <label htmlFor={`tag-${tag}`}>{tag}</label>
                  </li>
                ))}
                <li className="clear-filters-item">
                  <button onClick={clearFilters} className="clear-filters-button">X Clear Filters</button>
                </li>
              </ul>
            </Scrollbar>
          </div>
        )}

        <div ref={addFolderRef} className={`add-folder clickable ${showNewFolderInput ? 'active' : ''}`} onClick={() => setShowNewFolderInput(true)}>
          {showNewFolderInput ? (         
          <div className='add-folder-input'>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="New Folder Name"
            />
            <button onClick={handleAddNewFolder}>Add</button>
          </div>
          ) : (
          <div className="add-folder-button">
            <img src={add} alt="" />
            <p>Add New Folder</p>
          </div>
          )}
        </div>
      
        <div onClick={handleAddEntryClick} className="add-entry-button">
          <img src={add} alt="" />
          <p>Add New Entry</p>
        </div>

        <div className="divider"></div>

        <Scrollbar style={{ height: '75vh' }}>
          <ul className='folder-list'>
            {folders.map((folder) => (
              <li key={folder._id} className="folder-item">
                <div
                    onMouseEnter={() => handleFolderHover(folder.name)}
                    onMouseLeave={() => handleFolderLeave(folder.name)}
                    className={`folder-header clickable ${expandedFolders[folder.name] ? 'active' : ''}`}
                  >
                  <img 
                    src={(hoveredFolder === folder.name || expandedFolders[folder.name]) ? arrow : folderIcon}
                    className='folder-icon'
                    alt="" 
                    onClick={() => handleFolderClick(folder)}
                  />
                  <p onClick={() => handleFolderClick(folder)}>{folder.name}</p>
                </div>
                {expandedFolders[folder.name] && (
                  <ul className="entries-list">
                    {entries[folder.name] && entries[folder.name].length > 0 ? (
                      entries[folder.name].map((entry) => {
                        const plainText = extractPlainText(entry.entryText);
                        const preview = plainText.length > 30 ? plainText.slice(0, 30) + '...' : plainText;
                        return (
                          <li key={entry._id} className="entry-item" onClick={() => handleEntryClick(entry)}>
                            <div className="entry-content">
                              <h3 className="entry-title">{entry.entryTitle ? `${entry.entryTitle}` : 'No Title'}</h3>
                              <small className="entry-date">
                                {new Date(entry.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: '2-digit'
                                })}
                              </small>
                              <p className="entry-preview">{preview}</p>
                            </div>
                          </li>
                        );
                      })
                    ) : (
                      <></>
                    )}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </Scrollbar>
      </div>
   
    </div>
  );
};

export default Drawer;
