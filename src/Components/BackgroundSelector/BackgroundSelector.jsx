import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTheme } from '../../Context/ThemeContext';

const BackgroundSelector = () => {
  const { setBackgroundName, setBackgroundUrl, backgroundUrl } = useTheme(); 
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState('');

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/assets');
        const videoAssets = response.data.filter(asset => asset.type === 'video');
        setAssets(videoAssets);
        console.log('Fetched video assets:', videoAssets);
      } catch (error) {
        console.error('Error fetching assets:', error);
      }
    };

    fetchAssets();
  }, []);

  useEffect(() => {
    setSelectedAsset(backgroundUrl);
  }, [backgroundUrl]);

  const handleAssetChange = (event) => {
    const selectedUrl = event.target.value;
    setSelectedAsset(selectedUrl);

    if (selectedUrl) {
      const selectedAssetName = assets.find(asset => asset.url === selectedUrl)?.name || '';
      if (selectedAssetName) {
        setBackgroundName(selectedAssetName);
        setBackgroundUrl(selectedUrl);
        console.log('Selected asset name and URL set:', selectedAssetName, selectedUrl);
      }
    } else {
      setBackgroundName('');
      setBackgroundUrl('');
      console.log('No asset selected, background reset');
    }
  };

  return (
    <div className="background-selector">
      <label htmlFor="background-select">Select Background:</label>
      <select 
        id="background-select" 
        value={selectedAsset} 
        onChange={handleAssetChange}
      >
        <option value="">None</option>
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
