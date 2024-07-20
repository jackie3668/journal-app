import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { extractPlainText } from '../../Utils/utils'; // Import the utility function
import './Drawer.css';

const Drawer = ({ onSelectEntry }) => { // Accept onSelectEntry as a prop
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/entries');
        setEntries(response.data);
      } catch (error) {
        setError('Failed to fetch entries');
        console.error('Error fetching entries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  const handleEntryClick = (entry) => {
    onSelectEntry(entry); // Call the onSelectEntry function with the selected entry
  };

  return (
    <div className='drawer'>
      <h2>Past Entries</h2>
      <ul>
        {entries.map((entry) => {
          const plainText = extractPlainText(entry.entryText);
          const preview = plainText.length > 30 ? plainText.slice(0, 30) + '...' : plainText;
          return (
            <li key={entry._id} className='entry-item' onClick={() => handleEntryClick(entry)}>
              <h3>{entry.title}</h3>
              <p>{preview}</p>
              <small>{new Date(entry.createdAt).toLocaleDateString()}</small>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default Drawer;
