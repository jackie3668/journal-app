// src/components/AffirmationWidget.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const QuotesWidget = () => {
  const [affirmation, setAffirmation] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAffirmation();
  }, []);

  const fetchAffirmation = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://cors.bridged.cc/https://zenquotes.io/api/random');
      setAffirmation(response.data[0].q); 
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch affirmation');
      setLoading(false);
    }
  };
  
  

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <>
          <p>"{affirmation}"</p>
          <button onClick={fetchAffirmation}>Get New Affirmation</button>
        </>
      )}
    </div>
  );
};

export default QuotesWidget;
