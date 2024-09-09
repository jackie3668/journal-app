import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../Context/AuthContext';
import { extractPlainText } from '../../Utils/utils';
import { Scrollbar } from 'react-scrollbars-custom';
import { useAchievements } from '../../Context/AchievementContext';
import './Drawer.css';
import folderIcon from '../../Assets/UI/Journal/folder (1).png'
import arrow from '../../Assets/UI/Journal/down-arrow (3).png'
import collapse from '../../Assets/UI/Journal/radix-icons_pin-left.png'
import add from '../../Assets/UI/Journal/more.png'
import filter from '../../Assets/UI/Journal/filter.png'
import search from '../../Assets/UI/Journal/search-interface-symbol (1).png'
import page from '../../Assets/Sounds/turnpage-99756.mp3'
import deleteIcon from '../../Assets/UI/Journal/delete.png';

const Drawer = ({ onEntrySelect, onEntrySaved, selectedFolder, onFolderChange, isOpen, onClose }) => {
  const { authState } = useAuth();
  const { updateAchievements } = useAchievements();
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
  const [showModal, setShowModal] = useState(false);
  const [folderToDelete, setFolderToDelete] = useState(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState(null);

  const addFolderRef = useRef(null);

  const Modal = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <h2>{title}</h2>
          <p>{message}</p>
          <div className="modal-actions">
            <button onClick={onConfirm} className="confirm-button clickable">Yes</button>
            <button onClick={onClose} className="cancel-button clickable">No</button>
          </div>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const fetchFolders = async () => {
      if (!isAuthenticated || isLoading) {
        return;
      }

      try {
        const response = await axios.get('https://journal-app-backend-8szt.onrender.com/api/folders' || 'https://journal-app-backend-8szt.onrender.com/api/folders', {
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
        const response = await axios.get('https://journal-app-backend-8szt.onrender.com/api/tags' || 'https://journal-app-backend-8szt.onrender.com/api/tags', {
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
      const response = await axios.get('https://journal-app-backend-8szt.onrender.com/api/entries' || 'https://journal-app-backend-8szt.onrender.com/api/entries', {
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
      await axios.post('https://journal-app-backend-8szt.onrender.com/api/folders' || 'https://journal-app-backend-8szt.onrender.com/api/folders', {
        name: newFolderName,
        userId: user.sub
      });
      setNewFolderName('');
      setShowNewFolderInput(false);
      updateAchievements('incrementFolderCount', 1);
      const response = await axios.get('https://journal-app-backend-8szt.onrender.com/api/folders' || 'https://journal-app-backend-8szt.onrender.com/api/folders', {
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

  const handleFolderDeleteClick = (folderId) => {
    setFolderToDelete(folderId);
    setShowModal(true);
  };

  const deleteFolder = async (folderId) => {
    try {
      await axios.delete(`https://journal-app-backend-8szt.onrender.com/api/folders/${folderId}`, {
        params: { userId: user.sub } 
      });
      const updatedFolders = folders.filter(folder => folder._id !== folderId);
      setFolders(updatedFolders);
      updateAchievements('decrementFolderCount', 1);
    } catch (error) {
      console.error('Error deleting folder:', error.response ? error.response.data : error.message);
    }
  };  
  
  const confirmDelete = () => {
    if (folderToDelete) {
      deleteFolder(folderToDelete);
      setFolderToDelete(null);
    }
    setShowModal(false);
  };

  const closeModal = () => {
    setFolderToDelete(null);
    setShowModal(false);
  };

  const handleEntryDeleteClick = (entryId) => {
    setEntryToDelete(entryId);
    setShowEntryModal(true);
  };

  const confirmEntryDelete = async () => {
    if (entryToDelete) {
      try {
        await axios.delete(`https://journal-app-backend-8szt.onrender.com/api/entries/${entryToDelete}`, {
          params: { userId: user.sub } 
        });
  
        const updatedEntries = entries[selectedFolder].filter(entry => entry._id !== entryToDelete);
        setEntries({ ...entries, [selectedFolder]: updatedEntries });
      } catch (error) {
        console.error('Error deleting entry:', error.response ? error.response.data : error.message);
      }
    }
    setEntryToDelete(null);
    setShowEntryModal(false);
  };
  
  const closeEntryModal = () => {
    setShowEntryModal(false);
    setEntryToDelete(null);
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

        <Scrollbar style={{ height: '60vh' }}>
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

                  {folder.name !== 'Default' && (
                    <img
                      src={deleteIcon}
                      className='del clickable'
                      alt="Delete folder"
                      onClick={() => handleFolderDeleteClick(folder._id)} 
                    />
                  )}
                </div>

                {expandedFolders[folder.name] && (
                  <ul className="entries-list">
                    {entries[folder.name] && entries[folder.name].length > 0 ? (
                      entries[folder.name].map((entry) => {
                        const plainText = extractPlainText(entry.entryText);
                        const preview = plainText.length > 25 ? plainText.slice(0, 25) + '...' : plainText;
                        return (
                          <li key={entry._id} className="entry-item" onClick={() => handleEntryClick(entry)}>
                            <div className="entry-content">
                              <img
                                src={deleteIcon}
                                className='del clickable'
                                alt="Delete entry"
                                onClick={() => handleEntryDeleteClick(entry._id)}
                              />

                              <h3 className="entry-title">
                                {entry.entryTitle ? `${entry.entryTitle}` : 'No Title'}
                              </h3>
                              
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
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        onConfirm={confirmDelete}
        title="Delete Folder"
        message="Are you sure you want to delete this folder? This action cannot be undone."
      />

      <Modal
        isOpen={showEntryModal}
        onClose={closeEntryModal}
        onConfirm={confirmEntryDelete}
        title="Delete Entry"
        message="Are you sure you want to delete this entry? This action cannot be undone."
      />

    </div>
  );
};

export default Drawer;
