import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../Context/AuthContext';
import './NavBar.css';

const NavBar = () => {
  const { authState, login, logout } = useAuth();
  const { isAuthenticated, user } = authState;
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const pathToIndex = {
      '/': 0,
      '/journal': 1,
      '/account': 2,
    };
    setActiveIndex(pathToIndex[location.pathname] || 0);
  }, [location]);

  const formatTime = (date) => {
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDay = (date) => {
    return date.toLocaleDateString(undefined, { weekday: 'long' });
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat(undefined, { month: 'long', day: '2-digit' }).format(date);
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav>
      <div className="clock">
        <div>{formatTime(currentTime)}</div>
        <div>
          <div>{formatDay(currentTime)}</div>
          <div>{formatDate(currentTime)}</div>
        </div>
      </div>
      <ul className="toggle-nav glass">
        <div className="slider" style={{ transform: `translateX(${activeIndex * 100}%)` }} />
        <li className={isActive('/')}>
          <Link to="/" className={isActive('/')}>Home</Link>
        </li>
        <li className={isActive('/journal')}>
          <Link to="/journal" className={isActive('/journal')}>Journal</Link>
        </li>
        <li className={isActive('/account')}>
          <Link to="/account" className={isActive('/account')}>Account</Link>
        </li>
      </ul>
      <div className="auth">
        {isAuthenticated ? (
          <p onClick={() => logout({ returnTo: window.location.origin })}>Log out</p>
        ) : (
          <p onClick={login}>Login</p>
        )}
      </div>
    </nav>
  );
};

export default NavBar;