import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '../../Context/AuthContext';
import Export from '../Export/Export';
import { useTheme } from '../../Context/ThemeContext';
import { fetchFolders, saveEntry, addNewFolder, extractPlainText, calculateWordCount } from '../../Utils/utils';
import { useAchievements } from '../../Context/AchievementContext';
import './QuillContainer.css';
import exportIcon from  '../../Assets/UI/Journal/export.png'
import remove from '../../Assets/UI/Journal/cancel.png'
import tagIcon from '../../Assets/UI/Journal/tag (1).png'
import date from '../../Assets/UI/Journal/calendar.png'
import folder from '../../Assets/UI/Journal/folder (1).png'
import check from '../../Assets/UI/Journal/tick.png'

import { Scrollbar } from 'react-scrollbars-custom';
const QuillContainer = ({ handleKeyDown, onEntrySaved, setSelectedEntry, selectedEntry, selectedEntryId, setSelectedEntryId }) => {
  const { authState, login } = useAuth();
  const { selectedPrompt } = useTheme();
  const { updateAchievements } = useAchievements();
  const [entryTitle, setEntryTitle] = useState('');
  const [entryText, setEntryText] = useState(selectedPrompt ? selectedPrompt.replace(/['"]+/g, '') : '');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('Default');
  const [folders, setFolders] = useState([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [initialWordCount, setInitialWordCount] = useState(0);
  const [isToolbarVisible, setIsToolbarVisible] = useState(true);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [activeSetting, setActiveSetting] = useState(null); 

  const lastSaveTime = useRef(0);
  const quillRef = useRef(null);
  const loggedTagsRef = useRef([]);
  const folderSettingRef = useRef(null);
  const settingsRef = useRef(null);
  const tagMenuRef = useRef(null);
  
  useEffect(() => {
    if (authState.isAuthenticated) {
      localStorage.removeItem('pendingEntry');
    }
  }, [authState.isAuthenticated]);

  useEffect(() => {
    const fetchAndSetFolders = async () => {
      if (!authState.user) return;

      try {
        const folders = await fetchFolders(authState.user.sub);
        setFolders(folders);
      } catch (error) {
        console.error('Error fetching folders:', error);
      }
    };
    fetchAndSetFolders();
  }, [authState.user]);

  useEffect(() => {
    if (selectedEntry) {
      setEntryTitle(selectedEntry.entryTitle || '');
      setEntryText(selectedEntry.entryText || '');
      setTags(selectedEntry.tags || []);
      setSelectedFolder(selectedEntry.folderName || 'Default');
      setInitialWordCount(calculateWordCount(extractPlainText(selectedEntry.entryText || '')));
    } else {
      setEntryTitle('');
      setEntryText('');
      setTags([]);
      setSelectedFolder('Default'); 
    }
  }, [selectedEntry, selectedPrompt]);

  useEffect(() => {
    if (isTyping) {
      const timerId = setInterval(() => {
        setElapsedTime(prev => prev + 1000);
      }, 1000);
      return () => clearInterval(timerId);
    }
  }, [isTyping]);

  const handleSave = async () => {
    const now = Date.now();
    if (!selectedEntryId && now - lastSaveTime.current < 5000) { 
      return;
    } else if (selectedEntryId && now - lastSaveTime.current < 1000) { 
      return;
    }
  
    lastSaveTime.current = now; 
    if (!entryText) {
      return;
    }
    
    if (!authState.isAuthenticated) {
      localStorage.setItem('pendingEntry', entryText);
      login();
      return;
    }
  
    try {
      const url = selectedEntryId
        ? (`https://journal-app-backend-8szt.onrender.com/api/entries/${selectedEntryId}` || `http://localhost:5000/api/entries/${selectedEntryId}`)
        : (`https://journal-app-backend-8szt.onrender.com/api/entries` || 'http://localhost:5000/api/entries');
      
      const method = selectedEntryId ? 'PUT' : 'POST';
  
      const savedEntry = await saveEntry({
        userId: authState.user.sub,
        entryTitle: entryTitle || '',
        entryText,
        folderName: selectedFolder,
        tags,
        createdAt: new Date(),
      }, url, method);
      setSelectedEntry(savedEntry);
      if (method === 'POST') {
        setSelectedEntryId(savedEntry._id);
        updateAchievements('incrementEntryCount', 1);
      }
  
      const wordDelta = selectedEntry ? wordCount - initialWordCount : wordCount;
      if (wordDelta > 0) {
        updateAchievements('incrementWordCount', wordDelta);
      }
      updateAchievements('incrementTimeSpentWriting', elapsedTime / 1000);
  
      const newTags = tags.filter(tag => !loggedTagsRef.current.includes(tag));
      const removedTags = loggedTagsRef.current.filter(tag => !tags.includes(tag));

      if (newTags.length > 0) {
        updateAchievements('updateTagUsage', newTags);
        loggedTagsRef.current = [...loggedTagsRef.current, ...newTags].filter(tag => !removedTags.includes(tag));
      }
  
      setInitialWordCount(wordCount);
      setIsTyping(false);
      if (onEntrySaved) {
        onEntrySaved();
      }
  
    } catch (error) {
      console.error('Error saving journal entry:', error);
    }
    console.log('saved');
  };

  
  useEffect(() => {
    handleSave()
  }, [entryText, entryTitle, tags, selectedFolder]);

  const handleTextChange = (content) => {
    setEntryText(content);
    const newWordCount = calculateWordCount(extractPlainText(content));
    setWordCount(newWordCount);

    if (!isTyping) {
      setIsTyping(true);
    }
    setIsToolbarVisible(false);
  };

  const handleMouseMove = () => {
    setIsToolbarVisible(true);
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  const handleTitleChange = (e) => {
    setEntryTitle(e.target.value);
  };

  const handleAddTag = () => {
    const tagList = newTag.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
  
    const newTagsToAdd = tagList.filter(tag => !tags.includes(tag));
  
    if (newTagsToAdd.length > 0) {
      setTags([...tags, ...newTagsToAdd]);
      setNewTag(''); 
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddNewFolder = async () => {
    if (!newFolderName.trim()) {
      return;
    }
    try {
      const updatedFolders = await addNewFolder(authState.user.sub, newFolderName);
      setFolders(updatedFolders);
      setNewFolderName('');
      setShowNewFolderInput(false);
      updateAchievements('incrementFolderCount', 1);
      
    } catch (error) {
      console.error('Error adding new folder:', error);
    }
  };

  function formatDate() {
    const options = { year: 'numeric', month: 'long', day: '2-digit' };
    const today = new Date();
    return today.toLocaleDateString('en-US', options);
  }
  const handleMouseEnter = () => {
    setIsDropdownVisible(true);
  };

  const handleMouseLeave = () => {
    setIsDropdownVisible(false);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setActiveSetting(null); 
      }
    }
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTagClick = () => {
    if (activeSetting === 'tags') {
      setActiveSetting(null); 
    } else {
      setActiveSetting('tags'); 
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        folderSettingRef.current && !folderSettingRef.current.contains(event.target) &&
        tagMenuRef.current && !tagMenuRef.current.contains(event.target)
      ) {
        setActiveSetting(null); 
        setShowNewFolderInput(false);  
      }
    }
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setActiveSetting(null);
        setShowNewFolderInput(false);  
      }
    }
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleFolderClick = () => {
    if (activeSetting === 'folder') {
      setActiveSetting(null);
      setShowNewFolderInput(false);  
    } else {
      setActiveSetting('folder');
    }
  };
  return (
    <div className='quill-container glass'>

      <div className="editor-top">
        <div className="entry-setting-wrapper">
          <div className={!isToolbarVisible ? 'editing settings' : 'settings'}>
            <div className="date">
              <img src={date} alt="" />
              {formatDate()}
            </div>

            <div className="tags-setting" ref={tagMenuRef}>
              <p onClick={handleTagClick}>
                <img src={tagIcon} alt="" />Add Tag
              </p>
              
              {activeSetting === 'tags' && (
                <div className='add-tag-wrapper'>
                  <div className='tag-wrapper'>
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault(); 
                          handleAddTag();
                        }
                      }}
                      placeholder="Add tags here. Use comma to separate."
                    />
                  </div>
                  
                  <div className='tags-display'>
                    {tags.length > 0 && (
                      <ul>
                        {tags.map((tag, index) => (
                          <li onClick={() => handleRemoveTag(tag)} key={index}>
                            <img src={tagIcon} alt="" />
                            <p>{tag}</p>
                            <img src={remove} alt="" />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="folder-setting" ref={folderSettingRef}>
              <p onClick={handleFolderClick}><img src={folder} alt="" />Add to folder</p>

              {activeSetting === 'folder' && (
                <ul>
                  <Scrollbar style={{height : '40vh'}}>
                  {folders.length ? (
                    folders.map((folder) => (
                      <li 
                        key={folder._id} 
                        onClick={() => {
                          setSelectedFolder(folder.name);
                          setActiveSetting(null);
                        }} 
                        className={selectedFolder === folder.name ? 'selected' : ''}
                      >
                        {folder.name}
                        {selectedFolder === folder.name && <img src={check} alt="Selected" className="check-icon" />}
                      </li>
                    ))
                  ) : (
                    <li 
                      onClick={() => {
                        setSelectedFolder("Default")
                        setActiveSetting(null);
                      }} 
                      className={selectedFolder === "Default" ? 'selected' : ''}
                    >
                      Default
                      {selectedFolder === "Default" && <img src={check} alt="Selected" className="check-icon" />}
                    </li>
                  )}
                  <li onClick={() => setShowNewFolderInput(true)} className="add-folder">
                    + Add Folder
                  </li>
                  {showNewFolderInput && (
                    <li className='add-folder-input'>
                      <input
                        type="text"
                        value={newFolderName}
                        onChange={(e) => setNewFolderName(e.target.value)}
                        placeholder="Folder Name"
                      />
                      <button onClick={handleAddNewFolder}>Add</button>
                    </li>
                  )}
                  </Scrollbar>
                </ul>
              )}

            </div>
          </div>

          <input 
            type="text" 
            placeholder="Enter title here" 
            value={entryTitle} 
            onChange={handleTitleChange}
            onKeyDown={handleKeyDown}
            className='title-input'
          />

        </div>

        <div 
          className={!isToolbarVisible ? 'editing export-container' : 'export-container'}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >          
          {isDropdownVisible && (
            <Export entryTitle={entryTitle} entryText={entryText} />
          )}
          <button className="export-button">
            <img src={exportIcon} alt="Export" />
          </button>
        </div>
      </div>
      

      <Scrollbar>
        <ReactQuill
          className={!isToolbarVisible ? 'editing ql clickable' : 'ql clickable'}
          theme="snow"
          value={entryText}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          modules={modules}
          placeholder={selectedPrompt ? selectedPrompt.text : ""} 
          ref={quillRef}
        />
      </Scrollbar>
      <div className='count-time'>
        <p>{wordCount} Words</p>
        <p>{Math.floor(elapsedTime / 60000)}m {Math.floor((elapsedTime % 60000) / 1000)}s</p>
      </div>
    </div>
  );
};

const modules = {
  toolbar: [
    [{ 'font': [] }, { 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
    ['bold', 'italic', 'underline']
  ],
};

export default QuillContainer;
