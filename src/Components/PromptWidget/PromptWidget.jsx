import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../../Context/ThemeContext';

const PromptWidget = () => {
  const { selectedPrompt, setSelectedPrompt } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [fetchedPrompt, setFetchedPrompt] = useState(null); 

  const fetchRandomPrompt = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/prompts/random');
      setFetchedPrompt(response.data); 
    } catch (err) {
      setError('Error fetching random prompt.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRandomPrompt();
  }, []);

  const handleRefresh = () => {
    fetchRandomPrompt();
  };

  const handleSelect = () => {
    setSelectedPrompt(fetchedPrompt); 
  };

  return (
    <div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <div>
          <div>
            <strong>{fetchedPrompt?.category}</strong>: {fetchedPrompt?.text}
          </div>
          <button onClick={handleRefresh}>Get New Prompt</button>
          <button onClick={handleSelect}>Select</button>
        </div>
      )}
    </div>
  );
};

export default PromptWidget;
