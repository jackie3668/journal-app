import React, { useState, useEffect } from 'react';
import './BackgroundSelector.css';
import { Scrollbar } from 'react-scrollbars-custom';
import axios from 'axios';
import { useTheme } from '../../Context/ThemeContext';
import LoadingScreen from '../LoadingScreen/LoadingScreen';

const BackgroundSelector = ({ setSelectedMenu }) => {  
  const { setBackgroundUrl } = useTheme(); 
  const [assets, setAssets] = useState([]);
  const [categories, setCategories] = useState({});
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true); 
  const [imagesLoadedCount, setImagesLoadedCount] = useState(0);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/assets');
        const videoAssets = response.data.filter(asset => asset.type === 'video');
        
        const categorizedData = videoAssets.reduce((acc, asset) => {
          const category = asset.category || 'All';
          if (!acc[category]) acc[category] = [];
          acc[category].push(asset);
          return acc;
        }, { All: videoAssets });

        setAssets(videoAssets);
        setCategories(categorizedData);
      } catch (error) {
        console.error('Error fetching assets:', error);
      }
    };

    fetchAssets();
  }, []);

  const handleAssetClick = (asset) => {
    setBackgroundUrl(asset.url); 
    setSelectedMenu('')
  };

  const handleImageLoad = () => {
    setImagesLoadedCount(prevCount => {
      const newCount = prevCount + 1;
      if (newCount === 2) { 
        console.log('finished');
        setLoading(false); 
      }
      return newCount;
    });
  };

  return (
    <div className='background menu-container dark-glass'>
      <button className='close-gallery' onClick={() => setSelectedMenu('')}>close</button>
      {loading && (<LoadingScreen />)}
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
        <div className='gallery'>
          {categories[activeCategory]?.map((asset, index) => (
            <div 
              key={index} 
              className='item'
              onClick={() => handleAssetClick(asset)} 
            >
              <img 
                src={asset.imageUrl} 
                alt={asset.name} 
                onLoad={handleImageLoad} 
              />
              <div className='item-title'>{asset.name}</div> 
            </div>
          ))}
        </div>
      </Scrollbar>
    </div>
  );
}

export default BackgroundSelector;
