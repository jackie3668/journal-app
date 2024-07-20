import React from 'react'
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const QuillContainer = ({ entry, handleChange }) => {
  const modules = {
    toolbar: [
      [{ 'font': [] },{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
      ['bold', 'italic', 'underline']
    ],
  };

  return (
    <div>
      <ReactQuill
      theme="snow"
      className='quill'
      value={entry}
      onChange={handleChange}
      modules={modules}
      placeholder="Start writing here..."
      />
    </div>
  )
}

export default QuillContainer