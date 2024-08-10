import React from 'react';
import drawerIcon from '../../Assets/UI/Journal/radix-icons_pin-left.png';
import backgroundIcon from '../../Assets/UI/Journal/image.png';
import typingSoundIcon from '../../Assets/UI/Journal/keyboard.png';
import ambienceIcon from '../../Assets/UI/Journal/sound-waves.png';
import presetIcon from '../../Assets/UI/Journal/desert.png';
import './JournalSideMenu.css'

const JournalSideMenu = ({ onSelect, selectedMenu }) => {
  return (
    <div className='side-menu'>
      <img 
        src={presetIcon} 
        alt="Preset Selector" 
        onClick={() => onSelect('preset')}
        className={`menu-icon clickable ${selectedMenu === 'preset' ? 'active' : ''}`}
      />
      <img 
        src={backgroundIcon} 
        alt="Background Selector" 
        onClick={() => onSelect('background')}
        className={`menu-icon clickable ${selectedMenu === 'background' ? 'active' : ''}`}
      />
      <img 
        src={ambienceIcon} 
        alt="Ambience Mixer" 
        onClick={() => onSelect('ambience')}
        className={`menu-icon clickable ${selectedMenu === 'ambience' ? 'active' : ''}`}
      />
      <img 
        src={typingSoundIcon} 
        alt="Typing Sound" 
        onClick={() => onSelect('typingSound')}
        className={`menu-icon clickable ${selectedMenu === 'typingSound' ? 'active' : ''}`}
      />
      <img 
        src={drawerIcon} 
        alt="Drawer" 
        onClick={() => onSelect('drawer')}
        className={`menu-icon clickable ${selectedMenu === 'drawer' ? 'active' : ''}`}
      />
    </div>
  );
};

export default JournalSideMenu;
