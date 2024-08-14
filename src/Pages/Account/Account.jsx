import React, { useState } from 'react';
import Settings from '../../Components/Settings/Settings';
import Achievements from '../../Components/Achievements/Achievements';
import './Account.css';

const Account = () => {
  const [selectedComponent, setSelectedComponent] = useState('Settings');

  return (
      <div className="account-container glass">
        <div className="account-nav">
          <ul>
            <li>
              <button onClick={() => setSelectedComponent('Settings')}>Settings</button>
            </li>
            <li>
              <button onClick={() => setSelectedComponent('Achievements')}>Achievements</button>
            </li>
          </ul>
        </div>
        <main className="account-main">
          {selectedComponent === 'Settings' && <Settings />}
          {selectedComponent === 'Achievements' && <Achievements />}
        </main>
      </div>
  );
};

export default Account;
