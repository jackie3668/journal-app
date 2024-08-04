import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTheme } from '../../Context/ThemeContext';

const BackgroundSelector = () => {
  const { backgroundName, setBackgroundName, backgroundUrl, setBackgroundUrl } = useTheme(); 
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState('');

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/assets');
        const videoAssets = response.data.filter(asset => asset.type === 'video');
        setAssets(videoAssets);

        if (videoAssets.length > 0) {
          if (backgroundName) {
            const matchingAsset = videoAssets.find(asset => asset.name === backgroundName);
            if (matchingAsset) {
              setSelectedAsset(matchingAsset.url);
              setBackgroundUrl(matchingAsset.url); 
            } else {
              setSelectedAsset(videoAssets[0].url); 
              setBackgroundUrl(videoAssets[0].url); 
              setBackgroundName(videoAssets[0].name); 
            }
          } else {
            setSelectedAsset(videoAssets[0].url);
            setBackgroundUrl(videoAssets[0].url); 
            setBackgroundName(videoAssets[0].name); 
          }
        }
      } catch (error) {
        console.error('Error fetching assets:', error);
      }
    };

    fetchAssets();
  }, [backgroundName, setBackgroundName, setBackgroundUrl]);

  useEffect(() => {
    if (selectedAsset) {
      const selectedAssetName = assets.find(asset => asset.url === selectedAsset)?.name || '';
      if (selectedAssetName) {
        setBackgroundName(selectedAssetName);
        setBackgroundUrl(selectedAsset); 
      }
    }
  }, [selectedAsset, assets, setBackgroundName, setBackgroundUrl]);

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
            {asset.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default BackgroundSelector;
