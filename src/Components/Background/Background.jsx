import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import './Background.css'; // Optional: for custom styling

const Background = () => {
  const [selectedAsset, setSelectedAsset] = useState('');
  const videoRef = useRef(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/assets');
        console.log('Fetched asset URL:', response.data[2].url);
        setSelectedAsset(response.data[2].url); // Set default background
      } catch (error) {
        console.error('Error fetching assets:', error);
      }
    };

    fetchAssets();
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load(); // Trigger load event to reload the video
    }
  }, [selectedAsset]);

  return (
    <div className="background-container">
      <video ref={videoRef} className="background-video" autoPlay loop muted>
        <source src={selectedAsset} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default Background;
