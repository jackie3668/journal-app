// src/components/ClockWidget.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ClockWidget = () => {
  const [time, setTime] = useState('');
  const [day, setDay] = useState('');
  const [weather, setWeather] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeather = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://wttr.in/?format=%C+%t');
      setWeather(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch weather');
      setLoading(false);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString());
      setDay(now.toLocaleDateString('en-US', { weekday: 'long' }));
    }, 1000);

    fetchWeather(); // Fetch weather on component mount

    return () => clearInterval(intervalId); // Clean up interval on unmount
  }, []);

  return (
    <div className="clock-widget">
      <h2>Current Time and Weather</h2>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <>
          <p className="time">{time}</p>
          <p className="day">{day}</p>
          <p className="weather">{weather}</p>
        </>
      )}
    </div>
  );
};

export default ClockWidget;
