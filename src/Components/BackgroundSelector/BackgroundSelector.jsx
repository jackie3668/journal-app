import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTheme } from '../../Context/ThemeContext'; // Adjust the import path as necessary

const BackgroundSelector = () => {
  const { setBackgroundUrl } = useTheme(); // Destructure the context value
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState('');

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/assets');
        // Filter assets to include only those of type 'video'
        const videoAssets = response.data.filter(asset => asset.type === 'video');
        setAssets(videoAssets);
        if (videoAssets.length > 0) {
          setSelectedAsset(videoAssets[0].url);
        }
      } catch (error) {
        console.error('Error fetching assets:', error);
      }
    };

    fetchAssets();
  }, []);

  useEffect(() => {
    setBackgroundUrl(selectedAsset);
  }, [selectedAsset, setBackgroundUrl]);

  const handleAssetChange = (event) => {
    setSelectedAsset(event.target.value);
  };

  return (
    <div className="background-selector">
      <label htmlFor="background-select">Select Background:</label>
      <select 
        id="background-select" 
        value={selectedAsset} 
        onChange={handleAssetChange}
      >
        {assets.map((asset) => (
          <option key={asset._id} value={asset.url}>
            {asset.name || asset.url}
          </option>
        ))}
      </select>
    </div>
  );
};

export default BackgroundSelector;
