import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import { useAuth } from '../../Context/AuthContext';
import { saveAs } from 'file-saver';
import Export from '../Export/Export';

const QuillContainer = ({ handleKeyDown, onEntrySaved, selectedEntry }) => {
  const { authState, login, userData } = useAuth();
  const [entryTitle, setEntryTitle] = useState('');
  const [entryText, setEntryText] = useState('');
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('Default');
  const [folders, setFolders] = useState([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (authState.isAuthenticated && userData) {
      const savedEntry = localStorage.getItem('pendingEntry');
      if (savedEntry) {
        localStorage.removeItem('pendingEntry');
      }
    }
  }, [authState.isAuthenticated, userData]);

  useEffect(() => {
    const fetchFolders = async () => {
      if (!authState.isAuthenticated || !authState.user) {
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/folders', {
          params: { userId: authState.user.sub },
        });

        if (response.data.length === 0) {
          await axios.post('http://localhost:5000/api/folders', { 
            name: 'Default',
            userId: authState.user.sub 
          });

          const updatedResponse = await axios.get('http://localhost:5000/api/folders', {
            params: { userId: authState.user.sub },
          });

          setFolders(updatedResponse.data);
        } else {
          setFolders(response.data);
        }
      } catch (error) {
        console.error('Error fetching folders:', error);
      }
    };

    fetchFolders();
  }, [authState.isAuthenticated, authState.user]);

  useEffect(() => {
    if (selectedEntry) {

      setEntryTitle(selectedEntry.entryTitle || '');
      setEntryText(selectedEntry.entryText || '');
      setTags(selectedEntry.tags || []);
      setSelectedFolder(selectedEntry.folderName || 'Default');
    }
  }, [selectedEntry]);

  const handleSave = async () => {
    if (!authState.isAuthenticated) {
      localStorage.setItem('pendingEntry', entryText);
      login();
      return;
    }
  
    setLoading(true);
    try {
      const url = selectedEntry ? `http://localhost:5000/api/entries/${selectedEntry._id}` : 'http://localhost:5000/api/entries';
      const method = selectedEntry ? 'PUT' : 'POST';
  
      await axios({
        method,
        url,
        data: {
          userId: authState.user.sub,
          entryTitle,
          entryText,
          folderName: selectedFolder,
          tags,
          createdAt: new Date(),
        },
      });
  
      setEntryTitle('');
      setEntryText('');
      setTags([]);
      setNewTag('');
      if (onEntrySaved) {
        onEntrySaved();
      }
    } catch (error) {
      console.error('Error saving journal entry:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTextChange = (content) => {
    setEntryText(content);
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
      await axios.post('http://localhost:5000/api/folders', {
        name: newFolderName,
        userId: authState.user.sub
      });
      setNewFolderName('');
      setShowNewFolderInput(false);

      const response = await axios.get('http://localhost:5000/api/folders', {
        params: { userId: authState.user.sub }
      });
      setFolders(response.data);
    } catch (error) {
      console.error('Error adding new folder:', error.response ? error.response.data : error.message);
    }
  };

  return (
    <div>
      <div>
        <Export entryTitle={entryTitle} entryText={entryText} />
      </div>
      <div>
        <label htmlFor="folder-select">Select Folder:</label>
        <select
          id="folder-select"
          value={selectedFolder}
          onChange={(e) => {
            setSelectedFolder(e.target.value);
          }}
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
        placeholder="Start writing here..."
      />
      <div>
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
      <button onClick={handleSave} disabled={loading}>
        {loading ? 'Saving...' : 'Save Entry'}
      </button>
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
