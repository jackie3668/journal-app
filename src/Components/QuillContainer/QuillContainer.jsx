import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';
import { useAuth } from '../../Context/AuthContext';

const QuillContainer = ({ handleKeyDown, onEntrySaved }) => {
  const { authState, login, userData } = useAuth();
  const [entryTitle, setEntryTitle] = useState('');
  const [entryText, setEntryText] = useState('');
  const [tags, setTags] = useState([]);
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

  const handleSave = async () => {
    if (!authState.isAuthenticated) {
      localStorage.setItem('pendingEntry', entryText);
      login();
      return;
    }

    setLoading(true);
    try {
      console.log("Saving Entry with Folder:", selectedFolder); // Debugging line
      await axios.post('http://localhost:5000/api/entries', {
        userId: authState.user.sub,
        entryTitle,
        entryText,
        folderName: selectedFolder,
        tags,
        createdAt: new Date(),
      });
      setEntryTitle('');
      setEntryText('');
      setTags([]);
      if (onEntrySaved) {
        console.log('save');
        onEntrySaved(); // Notify parent component that entry is saved
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
        <label htmlFor="folder-select">Select Folder:</label>
        <select
          id="folder-select"
          value={selectedFolder}
          onChange={(e) => {
            console.log('Folder Selected:', e.target.value); // Debugging line
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
