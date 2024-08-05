import React from 'react';
import ClockWidget from '../../Components/ClockWidget/ClockWidget';
import PresetWidget from '../../Components/PresetWidget/PresetWidget';
import PromptWidget from '../../Components/PromptWidget/PromptWidget';
import AchievementsWidget from '../../Components/AchievementsWidget/AchievementsWidget';
import CTAWidget from '../../Components/CTAWidget/CTAWidget';
import './Home.css'; 

const Home = () => {
  return (
    <div className="home-container">
      <div className="widget-container">
        <div className="widget"><ClockWidget /></div>
        <div className="widget"><CTAWidget /></div>
        <div className="widget"><AchievementsWidget /></div>
        <div className="widget"><PresetWidget /></div>
        <div className="widget"><PromptWidget /></div>
      </div>
    </div>
  );
}

export default Home;
