import React from 'react';
import { Scrollbar } from 'react-scrollbars-custom';
import ClockWidget from '../../Components/ClockWidget/ClockWidget';
import PresetWidget from '../../Components/PresetWidget/PresetWidget';
import PromptWidget from '../../Components/PromptWidget/PromptWidget';
import AchievementsWidget from '../../Components/AchievementsWidget/AchievementsWidget';
import CTAWidget from '../../Components/CTAWidget/CTAWidget';
import './Home.css'; 

const Home = () => {
  return (
    <Scrollbar>
      <div className="widget-container">
        <div className="widget widget1 glass"><ClockWidget /></div>
        <div className="widget widget2 glass"><CTAWidget /></div>
        <div className="widget widget3 glass"><AchievementsWidget /></div>
        <div className="widget widget4 glass"><PresetWidget /></div>
        <div className="widget widget5 glass"><PromptWidget /></div>
    </div>
    </Scrollbar>
  );
}

export default Home;
