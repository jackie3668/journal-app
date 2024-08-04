import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PromptUploader = () => {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');


  useEffect(() => {
    const fetchPrompts = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/prompts');
        setPrompts(response.data);
        const uniqueCategories = [...new Set(response.data.map(prompt => prompt.category))];
        setCategories(uniqueCategories);
      } catch (err) {
        setError('Error fetching prompts.');
      }
    };

    fetchPrompts();
  }, []);


  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const promptEntries = inputText.split('///').filter(entry => entry.trim() !== '');
    const parsedPrompts = [];

    for (let entry of promptEntries) {
      const [category, ...promptParts] = entry.split('+');
      if (category && promptParts.length > 0) {
        parsedPrompts.push({
          category: category.trim(),
          text: promptParts.join('+').trim()
        });
      }
    }

    try {
      await axios.post('http://localhost:5000/api/prompts', {
        prompts: parsedPrompts
      });
      setSuccess('Prompts uploaded successfully!');
      setInputText('');
      const response = await axios.get('http://localhost:5000/api/prompts');
      setPrompts(response.data);
    } catch (err) {
      setError('Error uploading prompts.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/prompts/${id}`);
      setSuccess('Prompt deleted successfully!');
      const response = await axios.get('http://localhost:5000/api/prompts');
      setPrompts(response.data);
    } catch (err) {
      setError('Error deleting prompt.');
    }
  };

  const filteredPrompts = selectedCategory
    ? prompts.filter(prompt => prompt.category === selectedCategory)
    : prompts;

  return (
    <div>
      <h2>Upload Journal Prompts</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="prompts">Prompts (format: category+prompt separated by ///):</label>
          <textarea
            id="prompts"
            rows="10"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Uploading...' : 'Upload Prompts'}
        </button>
        {success && <p style={{ color: 'green' }}>{success}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>

      <h3>Available Prompts</h3>
      <div>
        <label htmlFor="categoryFilter">Filter by category:</label>
        <select
          id="categoryFilter"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <ul>
        {filteredPrompts.map(prompt => (
          <li key={prompt._id}>
            <strong>{prompt.category}</strong>: {prompt.text}
            <button onClick={() => handleDelete(prompt._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PromptUploader;
