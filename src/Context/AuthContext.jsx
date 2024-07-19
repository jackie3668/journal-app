// src/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { user, isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();
  const [authState, setAuthState] = useState({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (!isLoading) {
      setAuthState({
        user,
        isAuthenticated,
        isLoading,
      });
    }
  }, [user, isAuthenticated, isLoading]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (authState.isAuthenticated && authState.user) {
        try {
          const response = await axios.post('http://localhost:5000/api/user', {
            userId: authState.user.sub,
            name: authState.user.name,
            email: authState.user.email,
            picture: authState.user.picture 
          });
          setUserData(response.data);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [authState]);

  const contextValue = {
    authState,
    userData, 
    login: loginWithRedirect,
    logout: logout,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};
