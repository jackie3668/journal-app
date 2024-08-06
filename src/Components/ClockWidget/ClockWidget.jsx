import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useLoading } from '../../Context/LoadingContext';
import './ClockWidget.css';
import logo from '../../Assets/Brand/writing.png';
import clearIcon from '../../Assets/UI/Weather/sunny.png';
import partlyCloudyIcon from '../../Assets/UI/Weather/cloud.png';
import cloudyIcon from '../../Assets/UI/Weather/cloud.png';
import rainIcon from '../../Assets/UI/Weather/rainy-day.png';
import snowIcon from '../../Assets/UI/Weather/snowflake.png';
import thunderstormIcon from '../../Assets/UI/Weather/rainy-day.png';
import mistIcon from '../../Assets/UI/Weather/windy.png';

const ClockWidget = () => {
  const { showLoading, hideLoading } = useLoading();
  const [time, setTime] = useState('');
  const [day, setDay] = useState('');
  const [date, setDate] = useState('');
  const [weather, setWeather] = useState('');
  const [weatherIcon, setWeatherIcon] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWeather = async () => {
    showLoading();
    setLoading(true);
    try {
      const response = await axios.get('https://wttr.in/YOUR_CITY?format=%C+%t');
      const [weatherDescription, temperature] = response.data.split('+');
      setWeather(temperature);
      setWeatherIcon(getWeatherIcon(weatherDescription));
      setLoading(false);
      hideLoading();
    } catch (err) {
      setError('Oops, something went wrong.');
      setLoading(false);
      hideLoading();
    }
  };

  const getWeatherIcon = (description) => {
    const iconMap = {
      'Clear': clearIcon,
      'Sunny': clearIcon,
      'Partly': partlyCloudyIcon,
      'Partly cloudy': partlyCloudyIcon,
      'Cloudy': cloudyIcon,
      'Overcast': cloudyIcon,
      'Mist': mistIcon,
      'Patchy rain possible': rainIcon,
      'Patchy snow possible': snowIcon,
      'Patchy sleet possible': rainIcon,
      'Patchy freezing drizzle possible': rainIcon,
      'Thundery outbreaks possible': thunderstormIcon,
      'Blowing snow': snowIcon,
      'Blizzard': snowIcon,
      'Fog': mistIcon,
      'Freezing fog': mistIcon,
      'Patchy light drizzle': rainIcon,
      'Light drizzle': rainIcon,
      'Freezing drizzle': rainIcon,
      'Heavy freezing drizzle': rainIcon,
      'Patchy light rain': rainIcon,
      'Light rain': rainIcon,
      'Moderate rain at times': rainIcon,
      'Moderate rain': rainIcon,
      'Heavy rain at times': rainIcon,
      'Heavy rain': rainIcon,
      'Light freezing rain': rainIcon,
      'Moderate or heavy freezing rain': rainIcon,
      'Light sleet': rainIcon,
      'Moderate or heavy sleet': rainIcon,
      'Patchy light snow': snowIcon,
      'Light snow': snowIcon,
      'Patchy moderate snow': snowIcon,
      'Moderate snow': snowIcon,
      'Patchy heavy snow': snowIcon,
      'Heavy snow': snowIcon,
      'Ice pellets': snowIcon,
      'Light rain shower': rainIcon,
      'Moderate or heavy rain shower': rainIcon,
      'Torrential rain shower': rainIcon,
      'Light sleet showers': rainIcon,
      'Moderate or heavy sleet showers': rainIcon,
      'Light snow showers': snowIcon,
      'Moderate or heavy snow showers': snowIcon,
      'Light showers of ice pellets': snowIcon,
      'Moderate or heavy showers of ice pellets': snowIcon,
      'Patchy light rain with thunder': thunderstormIcon,
      'Moderate or heavy rain with thunder': thunderstormIcon,
      'Patchy light snow with thunder': thunderstormIcon,
      'Moderate or heavy snow with thunder': thunderstormIcon,
    };
    return iconMap[description] || mistIcon;
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      const now = new Date();
      setTime(now.toLocaleTimeString());
      setDay(now.toLocaleDateString('en-US', { weekday: 'long' }));
      setDate(now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
    }, 1000);

    fetchWeather();

    return () => clearInterval(intervalId); 
  }, []);

  return (
    <div className="clock-widget">
      <div className="date-section">
        <p>{date}</p>
        <div className="logo-icon">
          <Link to='./journal'><img src={logo} alt="logo Icon" /></Link>
        </div>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <div className="lower-section">
          <div className="weather-section">
            <p className="weather">{weather}</p>
            {weatherIcon && <img src={weatherIcon} alt="Weather Icon" />}
          </div>
          <div className="time-section">
            <p className="day">{day}</p>
            <p className="time">{time}</p>
          </div>
          <div className="welcome-section">
            <p>Welcome back to Soul Serenity</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClockWidget;
