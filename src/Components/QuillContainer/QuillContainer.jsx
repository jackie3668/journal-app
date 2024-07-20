import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const QuillContainer = ({ entryText, entryTitle, setEntryTitle, handleKeyDown, handleChange }) => {
  const modules = {
    toolbar: [
      [{ 'font': [] }, { 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
      ['bold', 'italic', 'underline']
    ],
  };

  return (
    <div>
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

export default QuillContainer;
