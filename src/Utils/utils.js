import axios from 'axios';
import { debounce } from 'lodash';

/**
 * Fetch folders from the server.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<Array>} - A promise that resolves to the list of folders.
 */
export const fetchFolders = async (userId) => {
  try {
    const response = await axios.get('http://localhost:5000/api/folders', {
      params: { userId },
    });

    if (response.data.length === 0) {
      await axios.post('http://localhost:5000/api/folders', { 
        name: 'Default',
        userId 
      });

      const updatedResponse = await axios.get('http://localhost:5000/api/folders', {
        params: { userId },
      });

      return updatedResponse.data;
    } else {
      return response.data;
    }
  } catch (error) {
    console.error('Error fetching folders:', error);
    throw error;
  }
};

/**
 * Save a journal entry to the server.
 * @param {Object} data - The data to save.
 * @param {string} url - The URL to send the request to.
 * @param {string} method - The HTTP method to use.
 * @returns {Promise<Object>} - The saved entry response.
 */
export const saveEntry = async (data, url, method) => {
  try {
    const response = await axios({
      method,
      url,
      data,
    });
    return response.data;
  } catch (error) {
    console.error('Error saving journal entry:', error);
    throw error;
  }
};


// Create a debounced version of saveEntry
export const debouncedSaveEntry = debounce(saveEntry, 3000);

/**
 * Add a new folder.
 * @param {string} userId - The ID of the user.
 * @param {string} newFolderName - The name of the new folder.
 * @returns {Promise<Array>} - A promise that resolves to the updated list of folders.
 */
export const addNewFolder = async (userId, newFolderName) => {
  try {
    await axios.post('http://localhost:5000/api/folders', {
      name: newFolderName,
      userId,
    });
    
    const response = await axios.get('http://localhost:5000/api/folders', {
      params: { userId },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error adding new folder:', error.response ? error.response.data : error.message);
    throw error;
  }
};

/**
 * Calculate the word count from text.
 * @param {string} text - The text to calculate the word count from.
 * @returns {number} - The word count.
 */
export const calculateWordCount = (text) => {
  return text.trim().split(/\s+/).filter(Boolean).length;
};

/**
 * Calculate the time spent writing.
 * @param {number} startTime - The start time in milliseconds.
 * @returns {number} - The time spent in seconds.
 */
export const calculateTimeSpentWriting = (startTime) => {
  return (Date.now() - startTime) / 1000; // Time in seconds
};

/**
 * Extract plain text from HTML.
 * @param {string} html - The HTML string to extract text from.
 * @returns {string} - The plain text extracted from the HTML.
 */
export const extractPlainText = (html) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};
