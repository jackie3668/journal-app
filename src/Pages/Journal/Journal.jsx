import React, { useState } from 'react';
import JournalEditor from '../../Components/JournalEditor/JournalEditor';
import Background from '../../Components/Background/Background';
import Drawer from '../../Components/Drawer/Drawer';
import './Journal.css';

const Journal = () => {
  const [selectedEntry, setSelectedEntry] = useState(null);

  const handleSelectEntry = (entry) => {
    setSelectedEntry(entry);
  };

  return (
    <div className='journal-page'>
      <div className="left">
        <Drawer onSelectEntry={handleSelectEntry} />
      </div>
      <div className="right">
        <Background />
        <JournalEditor selectedEntry={selectedEntry} />
      </div>
    </div>
  );
};

export default Journal;
