import React, { useState, useEffect } from 'react';
import { useTheme } from '../../Context/ThemeContext';
import axios from 'axios';
import './PresetWidget.css';

const PresetWidget = () => {
  const { selectPreset } = useTheme();
  const [presets, setPresets] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/presets');
        setPresets(response.data);
        // Preload images
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
    const interval = setInterval(() => {
      setCurrentSlide(prevSlide => (prevSlide + 1) % presets.slice(0, 5).length);
    }, 3000);

    return () => clearInterval(interval);
  }, [presets]);

  const handlePresetClick = (preset) => {
    selectPreset(preset);
  };

  const handleDotClick = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="preset-widget">
      <div className="slider">
        {presets.slice(0, 5).map((preset, index) => (
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
            <h3 className="preset-name">{preset.name}</h3>
            <p className='preset-description'>{preset.description}</p>
          </div>
        ))}
        <div className="dots">
          {presets.slice(0, 5).map((_, index) => (
            <div
              key={index}
              className={`custom-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => handleDotClick(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PresetWidget;
