import React, { useState, useEffect } from 'react';
import { useTheme } from '../../Context/ThemeContext';
import axios from 'axios';
import './PresetWidget.css';
import page from '../../Assets/Sounds/turnpage-99756.mp3';
import { Link } from 'react-router-dom';

const PresetWidget = () => {
  const { selectPreset } = useTheme();
  const [presets, setPresets] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true); // Added to track loading

  // Helper function to preload images using promises
  const preloadImage = (src) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = src;
      img.onload = resolve;
      img.onerror = reject;
    });
  };

  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const response = await axios.get('https://journal-app-backend-8szt.onrender.com/api/presets');
        const fetchedPresets = response.data.slice(0, 5); // Limit to 5 presets

        // Preload all preset images before setting them
        await Promise.all(fetchedPresets.map(preset => preloadImage(preset.imageUrl)));

        setPresets(fetchedPresets); // Set presets after images are loaded
        setLoading(false); // Set loading to false when images are loaded
      } catch (error) {
        console.error('Error fetching presets:', error);
      }
    };

    fetchPresets();
  }, []);

  useEffect(() => {
    // Using requestAnimationFrame for smoother transitions
    let animationFrameId;
    const changeSlide = () => {
      setCurrentSlide(prevSlide => (prevSlide + 1) % presets.length);
      animationFrameId = setTimeout(changeSlide, 3000); // Change every 3 seconds
    };

    if (presets.length > 0) {
      changeSlide();
    }

    return () => clearTimeout(animationFrameId); // Cleanup on unmount
  }, [presets]);

  const handlePresetClick = (preset) => {
    selectPreset(preset);
    const audio = new Audio(page);
    audio.play();
  };

  const handleDotClick = (index) => {
    setCurrentSlide(index);
  };

  if (loading) {
    return <div>Loading...</div>; // Show a loading indicator until presets are ready
  }

  return (
    <div className="preset-widget clickable">
      <div className="slider">
        {presets.map((preset, index) => (
          <Link to='./journal' key={preset._id}>
            <div
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
          {presets.map((_, index) => (
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
