import React, { useState, useEffect, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useAuth } from '../../Context/AuthContext';
import Export from '../Export/Export';
import { useTheme } from '../../Context/ThemeContext';
import { fetchFolders, saveEntry, addNewFolder, extractPlainText, calculateWordCount } from '../../Utils/utils';
import { useAchievements } from '../../Context/AchievementContext';
import { debounce } from 'lodash';
import './QuillContainer.css';

const QuillContainer = ({ handleKeyDown, onEntrySaved, setSelectedEntry, selectedEntry, selectedEntryId, setSelectedEntryId }) => {
  const { authState, login, userData } = useAuth();
  const { selectedPrompt } = useTheme();
  const { achievements, updateAchievements } = useAchievements();
  const [entryTitle, setEntryTitle] = useState('');
  const [entryText, setEntryText] = useState(selectedPrompt ? selectedPrompt.replace(/['"]+/g, '') : '');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('Default');
  const [folders, setFolders] = useState([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [initialWordCount, setInitialWordCount] = useState(0);
  const lastSaveTime = useRef(0);
  const quillRef = useRef(null);
  const loggedTagsRef = useRef([]);

 
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
    } else if (selectedPrompt) {
      setEntryText(selectedPrompt.replace(/['"]+/g, ''));
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
      console.log('returned');
      return;
    }
    
    if (!authState.isAuthenticated) {
      localStorage.setItem('pendingEntry', entryText);
      login();
      return;
    }
  
    try {
      const url = selectedEntryId ? `http://localhost:5000/api/entries/${selectedEntryId}` : 'http://localhost:5000/api/entries';
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
  }, [entryText, entryTitle, tags]);

  const handleTextChange = (content) => {
    setEntryText(content);
    const newWordCount = calculateWordCount(extractPlainText(content));
    setWordCount(newWordCount);

    if (!isTyping) {
      setStartTime(Date.now());
      setIsTyping(true);
    }
  };

  const handleTitleChange = (e) => {
    setEntryTitle(e.target.value);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
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
  

  return (
    <div className='quill-container'>
      <div>
        <Export entryTitle={entryTitle} entryText={entryText} />
      </div>
      <div>
        <label htmlFor="folder-select">Select Folder:</label>
        <select
          id="folder-select"
          value={selectedFolder}
          onChange={(e) => setSelectedFolder(e.target.value)}
        >
          {folders.length ? (
            folders.map((folder) => (
              <option key={folder._id} value={folder.name}>
                {folder.name}
              </option>
            ))
          ) : (
            <option value="Default">Default</option>
          )}
        </select>
      </div>
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
      <input 
        type="text" 
        placeholder="Title" 
        value={entryTitle} 
        onChange={handleTitleChange}
        onKeyDown={handleKeyDown}
        className='title-input'
      />
      <ReactQuill
        theme="snow"
        value={entryText}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        modules={modules}
        placeholder={selectedPrompt ? selectedPrompt.text : "Start writing here..."} 
        ref={quillRef}
      />
      <div className='tag-wrapper'>
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Add a tag"
        />
        <button onClick={handleAddTag}>Add Tag</button>
      </div>
      <div>
        {tags.length > 0 && (
          <ul>
            {tags.map((tag, index) => (
              <li key={index} style={{ display: 'inline', marginRight: '5px' }}>
                <span>{tag}</span>
                <button onClick={() => handleRemoveTag(tag)} style={{ marginLeft: '5px' }}>Remove</button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div>
        <p>Word Count: {wordCount}</p>
        <p>Time Spent: {Math.floor(elapsedTime / 60000)}m {Math.floor((elapsedTime % 60000) / 1000)}s</p>
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
