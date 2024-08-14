import React, { useState, useEffect } from 'react';
import { useAuth } from '../../Context/AuthContext'
import LoadingScreen from '../../Components/LoadingScreen/LoadingScreen';
import './Settings.css';
import { Scrollbar } from 'react-scrollbars-custom';

const Settings = () => {
  const { authState, resetPassword } = useAuth();
  const [profilePic, setProfilePic] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (authState.user) {
      setProfilePic(authState.user.picture || 'https://via.placeholder.com/150');
      setName(authState.user.name || '');
      setEmail(authState.user.email || '');
    }
  }, [authState.user]);

  if (!authState.user) {
    return <LoadingScreen />;
  }

  const handleProfilePicChange = (e) => {
    setProfilePic(URL.createObjectURL(e.target.files[0]));
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();
    console.log({ name, email });
  };

  return (
    <div className="account-subcontainer">
      <h2>Settings</h2>
      <Scrollbar>
        
        <div className="profile-section">
          <div className="profile-pic-container">
            <img src={profilePic} alt="Profile" className="profile-pic" />
            {/* <label htmlFor="profile-pic-upload" className="edit-profile-pic">Edit</label>
            <input id="profile-pic-upload" type="file" accept="image/*" onChange={handleProfilePicChange} /> */}
          </div>
        </div>

        <form className="settings-form" onSubmit={handleSaveChanges}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <button type="submit" className="white-button save-button">Save Changes</button>
        </form>
    
      </Scrollbar>
    </div>
  );
};

export default Settings;
