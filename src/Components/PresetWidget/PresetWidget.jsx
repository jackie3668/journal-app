import React, { useState, useEffect } from 'react';
import { useTheme } from '../../Context/ThemeContext';
import axios from 'axios';
import './PresetWidget.css';
import page from '../../Assets/Sounds/turnpage-99756.mp3'
import { Link } from 'react-router-dom';

const PresetWidget = () => {
  const { selectPreset } = useTheme();
  const [presets, setPresets] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const response = await axios.get('https://journal-app-backend-8szt.onrender.com/api/presets' || 'https://journal-app-backend-8szt.onrender.com/api/presets' );
        setPresets(response.data);
        response.data.slice(0, 5).forEach(preset => {
          const img = new Image();
          img.src = preset.imageUrl;
        });
        
      } catch (error) {
        console.error('Error fetching presets:', error);
      }
    };

    fetchPresets();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        setCurrentSlide(prevSlide => (prevSlide + 1) % presets.length);
      }, 3000);
      return () => clearInterval(interval);
    }, 5000);

    return () => clearTimeout(timeout);
  }, [presets]);

  const handlePresetClick = (preset) => {
    selectPreset(preset);
    const audio = new Audio(page);
    audio.play();
  };

  const handleDotClick = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="preset-widget clickable">
      <div className="slider">
        {presets.slice(0, 5).map((preset, index) => (
          <Link to='./journal'>
            <div
              key={preset._id}
              className={`preset-item ${index === currentSlide ? 'active' : ''}`}
              onClick={() => handlePresetClick(preset)}
              style={{ display: index === currentSlide ? 'block' : 'none' }}
            >
              <div
                className="preset-image"
                style={{ backgroundImage: `url(${preset.imageUrl})` }}
              />
              <span>Preset</span>
              <h3 className="preset-name light-shadow">{preset.name}</h3>
              <p className='preset-description light-shadow'>{preset.description}</p>
            </div>
          </Link>
        ))}
        <div className="dots">
          {presets.slice(0, 5).map((_, index) => (
            <div
              key={index}
              className={`custom-dot clickable ${index === currentSlide ? 'active' : ''}`}
              onClick={() => handleDotClick(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PresetWidget;
