import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '../../Context/AuthContext';
import Export from '../Export/Export';
import { useTheme } from '../../Context/ThemeContext';
import { saveEntry, addNewFolder, extractPlainText, calculateWordCount } from '../../Utils/utils';
import { useAchievements } from '../../Context/AchievementContext';
import './QuillContainer.css';
import exportIcon from '../../Assets/UI/Journal/export.png';
import remove from '../../Assets/UI/Journal/cancel.png';
import tagIcon from '../../Assets/UI/Journal/tag (1).png';
import date from '../../Assets/UI/Journal/calendar.png';
import folder from '../../Assets/UI/Journal/folder (1).png';
import check from '../../Assets/UI/Journal/tick.png';
import { Scrollbar } from 'react-scrollbars-custom';
import { encryptEntryData, decryptEntryData } from '../../Utils/encryption';

const QuillContainer = ({ handleKeyDown, onEntrySaved, setSelectedEntry, selectedEntry, selectedEntryId, setSelectedEntryId, folders, refreshData, forceRefresh }) => {
  const { authState } = useAuth();
  const { selectedPrompt, setSelectedPrompt } = useTheme();
  const { updateAchievements } = useAchievements();
  const [entryTitle, setEntryTitle] = useState('');
  const [draftText, setDraftText] = useState('');
  const [lastSavedTitle, setLastSavedTitle] = useState('');
  const [lastSavedText, setLastSavedText] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('Default');
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
  const typingTimeoutRef = useRef(null);
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
    if (selectedEntry) {
      const { decryptedTitle, decryptedText } = decryptEntryData(
        selectedEntry.entryTitle,
        selectedEntry.entryText
      );
  
      setEntryTitle(decryptedTitle || '');
      setDraftText(decryptedText || '');
      setTags(selectedEntry.tags || []);
      setSelectedFolder(selectedEntry.folderName || 'Default');
      setInitialWordCount(calculateWordCount(extractPlainText(decryptedText || '')));
      setLastSavedTitle(decryptedTitle || '');
      setLastSavedText(decryptedText || '');
    } else if (selectedPrompt) {
      const strippedPrompt = selectedPrompt.replace(/^\"(.*)\"$/, '$1');
      setDraftText(strippedPrompt);
      setLastSavedText(strippedPrompt);
      setInitialWordCount(calculateWordCount(extractPlainText(strippedPrompt || '')));
    } else {
      setEntryTitle('');
      setDraftText('');
      setTags([]);
      setSelectedFolder('Default');
    }
  }, [selectedEntry]);
  
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
    if (now - lastSaveTime.current < 3000) return;
    lastSaveTime.current = now;
  
    if (draftText === lastSavedText && entryTitle === lastSavedTitle && selectedFolder === (selectedEntry?.folderName || 'Default')) return;
  
    if (!authState.isAuthenticated) {
      localStorage.setItem('pendingEntry', draftText);
      return;
    }
    const isFolderChanged = selectedEntry && selectedFolder !== (selectedEntry.folderName || 'Default');
    const isTitleChanged = entryTitle !== (selectedEntry?.decryptedTitle || '');
    const isTextChanged = draftText !== lastSavedText;
    const areTagsChanged = JSON.stringify(tags) !== JSON.stringify(selectedEntry?.tags || []);
    
    if (!isFolderChanged && !isTitleChanged && !isTextChanged && !areTagsChanged) return;
    
    try {
  
      const url = selectedEntryId
        ? `https://journal-app-backend-8szt.onrender.com/api/entries/${selectedEntryId}`
        : 'https://journal-app-backend-8szt.onrender.com/api/entries';
  
      const method = selectedEntryId ? 'PUT' : 'POST';
      const { encryptedTitle, encryptedText } = encryptEntryData(entryTitle, draftText);
  
      const isFolderChanged = selectedEntry && selectedFolder !== (selectedEntry.folderName || 'Default');
  
      const savedEntry = await saveEntry({
        userId: authState.user.sub,
        entryTitle: encryptedTitle,
        entryText: encryptedText,
        folderName: selectedFolder, 
        tags,
        createdAt: new Date(),
      }, url, method);
  
      setLastSavedTitle(entryTitle);
      setLastSavedText(draftText);
  
      setSelectedEntry((prevEntry) => (prevEntry && prevEntry._id === savedEntry._id ? savedEntry : prevEntry));
  
      if (method === 'POST') {
        setSelectedEntryId(savedEntry._id);
        updateAchievements('incrementEntryCount', 1);
      }
  
      if (isFolderChanged) {
        if (refreshData) refreshData();  
      }
  
      const wordDelta = selectedEntry ? wordCount - initialWordCount : wordCount;
      if (wordDelta > 0) updateAchievements('incrementWordCount', wordDelta);
      updateAchievements('incrementTimeSpentWriting', elapsedTime / 1000);
  
      const newTags = tags.filter(tag => !loggedTagsRef.current.includes(tag));
      const removedTags = loggedTagsRef.current.filter(tag => !tags.includes(tag));
      if (newTags.length > 0) {
        updateAchievements('updateTagUsage', newTags);
        loggedTagsRef.current = [...loggedTagsRef.current, ...newTags].filter(tag => !removedTags.includes(tag));
      }
  
      if (onEntrySaved) onEntrySaved();
      setInitialWordCount(wordCount);
      setIsTyping(false);
      if (refreshData) refreshData();
      if (forceRefresh) forceRefresh();
      if (selectedPrompt) setSelectedPrompt(null);
  
    } catch (error) {
      console.error('Error saving journal entry:', error);
    }
  };

  const stopTyping = () => {
    setIsTyping(false); 
    handleSave(); 
  };

  const handleTextChange = (content) => {
    setDraftText(content);
    const newWordCount = calculateWordCount(extractPlainText(content));
    setWordCount(newWordCount);

    if (!isTyping) {
      setIsTyping(true);
    }
    setIsToolbarVisible(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(stopTyping, 1000);
  };

  const handleTitleChange = (e) => {
    setEntryTitle(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(stopTyping, 1000); 
  };

  const handleUnload = () => {
    if (!authState.isAuthenticated || (!draftText && !entryTitle && tags.length === 0)) {
      return;
    }

    handleSave(); 
  };

  useEffect(() => {
    window.addEventListener('beforeunload', handleUnload);

    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [draftText, entryTitle, selectedFolder, tags]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [draftText, entryTitle, selectedFolder, tags]);

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
      console.error('Folder name cannot be empty');
      return;
    }
  
    try {
      const updatedFolders = await addNewFolder(authState.user.sub, newFolderName);
      setNewFolderName('');
      setShowNewFolderInput(false);
      updateAchievements('incrementFolderCount', 1);
      if (refreshData) refreshData(); 
    } catch (error) {
      console.error('Error adding new folder:', error);
    }
    handleSave()
  };
  
  

  function formatDate() {
    const options = { year: 'numeric', month: 'long', day: '2-digit' };
    const today = new Date();
    return today.toLocaleDateString('en-US', options);
  }

  const handleMouseClick = () => {
    setIsDropdownVisible(!isDropdownVisible);   
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

  const handleFolderClick = () => {
    if (activeSetting === 'folder') {
      setActiveSetting(null);
      setShowNewFolderInput(false);
    } else {
      setActiveSetting('folder');
    }
    handleSave()
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
                  <Scrollbar style={{ height: '40vh' }}>
                    {folders.length ? (
                      folders.map((folder) => (
                        <li
                          key={folder._id}
                          onClick={() => {
                            setSelectedFolder(folder.name);
                            setActiveSetting(null);
                            handleSave();
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
                          setSelectedFolder("Default");
                          setActiveSetting(null);
                        }}
                        className={selectedFolder === "Default" ? 'selected' : ''}
                      >
                        Default
                        {selectedFolder === "Default" && <img src={check} alt="Selected" className="check-icon" />}
                      </li>
                    )}
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
                    <li onClick={() => setShowNewFolderInput(true)} className="add-folder">
                      + Add Folder
                    </li>
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
          onClick={handleMouseClick}
        >
          {isDropdownVisible && (
            <Export entryTitle={entryTitle} entryText={draftText} setIsDropdownVisible={setIsDropdownVisible} />
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
          value={draftText}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          modules={modules}
          placeholder={selectedPrompt ? selectedPrompt.text : ""}
          ref={quillRef}
        />
      </Scrollbar>
      <div className='count-time shadow'>
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
