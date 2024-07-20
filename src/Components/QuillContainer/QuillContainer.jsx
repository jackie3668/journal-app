import React, { useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const QuillContainer = ({
  entryText,
  entryTitle,
  folders, 
  selectedFolder,
  setSelectedFolder,
  setEntryTitle,
  fetchFolders,
  handleKeyDown,
  handleAddNewFolder,
  handleChange,
  newFolderName,
  setNewFolderName,
  showNewFolderInput,
  setShowNewFolderInput
}) => {


  useEffect(() => {
    fetchFolders();
  }, []);

  return (
    <div>
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
        onChange={(e) => setEntryTitle(e.target.value)} 
        onKeyDown={handleKeyDown}
        className='title-input'
      />
      <ReactQuill
        theme="snow"
        value={entryText}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        modules={modules}
        placeholder="Start writing here..."
      />
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
