// src/components/Profile.js
import React from 'react';
import { useAuth } from '../../Context/AuthContext'; // Adjust the path as needed

const Profile = () => {
  const { authState, userData, logout, login } = useAuth();

  if (authState.isLoading) {
    return <div>Loading...</div>;
  }

  if (!authState.isAuthenticated) {
    return (
      <div>
        <p>You are not logged in. Please log in to view this page.</p>
        <button onClick={() => login()}>Log in</button>
      </div>
    );
  }

  if (!userData) {
    return <div>Loading user information...</div>;
  }

  return (
    <div>
      <img src={userData.picture || 'default-image-url.png'} alt={userData.name} />
      <h2>{userData.name}</h2>
      <p>{userData.email}</p>
      <button onClick={() => logout({ returnTo: window.location.origin })}>
        Log out
      </button>
    </div>
  );
};

export default Profile;
