import React, { useState, useEffect } from 'react';
import './PresetMenu.css';
import { Scrollbar } from 'react-scrollbars-custom';
import axios from 'axios';
import { useTheme } from '../../Context/ThemeContext'
import LoadingScreen from '../LoadingScreen/LoadingScreen';

const PresetMenu = ({ onClose, setSelectedMenu }) => {  
  const { selectPreset } = useTheme();
  const [categories, setCategories] = useState({});
  const [activeCategory, setActiveCategory] = useState('All');
  const [imagesLoadedCount, setImagesLoadedCount] = useState(0);
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const fetchPresets = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/presets');
        const fetchedData = response.data;

        const categorizedData = fetchedData.reduce((acc, preset) => {
          const category = preset.category || 'All';
          if (!acc[category]) acc[category] = [];
          acc[category].push({
            title: preset.name,
            description: preset.description,
            image: preset.imageUrl,
            presetData: preset, 
          });
          return acc;
        }, { All: fetchedData.map(preset => ({
            title: preset.name,
            description: preset.description,
            image: preset.imageUrl,
            presetData: preset,
          }))
        });
        setCategories(categorizedData);
      } catch (error) {
        console.error('Error fetching presets:', error);
      }
    };

    fetchPresets();
  }, []);

  const handlePresetClick = (preset) => {
    selectPreset(preset.presetData); 
    onClose();  
  };

  const handleImageLoad = () => {
    setImagesLoadedCount(prevCount => {
      const newCount = prevCount + 1;
      if (newCount === 5) {
        console.log('finished');
        setLoading(false); 
      }
      return newCount;
    });
  };


  return (
    <div className='preset menu-container dark-glass'>
      {loading && (<LoadingScreen />)}
      <button className='close-gallery' onClick={() => setSelectedMenu('')}>close</button>
      <div className="tab-nav-bar">
        {Object.keys(categories).map((category) => (
          <div
            key={category}
            className={`tab-nav-item ${category === activeCategory ? 'active' : ''}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </div>
        ))}
      </div>
      <Scrollbar>
        <div className='gallery preset'>
          {categories[activeCategory]?.map((preset, index) => (
            <div 
              key={index} 
              className='item'
              onClick={() => handlePresetClick(preset)} 
            >
              <img 
                src={preset.image} 
                alt={preset.title} 
                onLoad={handleImageLoad} 
              />
              <div className='item-title'>{preset.title}</div>
              <div className='item-description'>{preset.description}</div>
            </div>
          ))}
        </div>
      </Scrollbar>
    </div>
  );
}

export default PresetMenu;
