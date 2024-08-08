import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTheme } from '../../Context/ThemeContext';
import './PromptWidget.css';
import image1 from '../../Assets/Images/prompt (1).jpg'
import image2 from '../../Assets/Images/prompt (2).jpg'
import image3 from '../../Assets/Images/prompt (3).jpg'
import image4 from '../../Assets/Images/prompt (4).jpg'
import image5 from '../../Assets/Images/prompt (5).jpg'

const PromptWidget = () => {
  const { setSelectedPrompt } = useTheme();
  const [prompts, setPrompts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/prompts');
      const randomPrompts = response.data.sort(() => 0.5 - Math.random()).slice(0, 5);
      setPrompts(randomPrompts);
    } catch (err) {
      setError('Error fetching prompts.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrompts();
  }, []);

  const handleDotClick = (index) => {
    setCurrentSlide(index);
  };

  const handleSelect = (prompt) => {
    setSelectedPrompt(prompt.text);
  };

  const images = [image1, image2, image3, image4, image5];

  return (
    <div className="prompt-widget">
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <div className="slider">
          {prompts.map((prompt, index) => (
            <div
              key={prompt._id}
              className={`prompt-item ${index === currentSlide ? 'active' : ''}`}
              style={{ display: index === currentSlide ? 'block' : 'none' }}
            >
              <h4>Get started with a prompt</h4>
              <div onClick={() => handleSelect(prompt)} className="image-wrapper">
                <img src={images[index]} alt={`Prompt ${index}`} className="prompt-image" />
                <p>{prompt.category}</p>
              </div>
            </div>
          ))}
          <div className="dots">
            {prompts.map((_, index) => (
              <div
                key={index}
                className={`custom-dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => handleDotClick(index)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptWidget;
