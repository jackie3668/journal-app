import React from 'react';
import ClockWidget from '../../Components/ClockWidget/ClockWidget';
import PresetWidget from '../../Components/PresetWidget/PresetWidget';
import PromptWidget from '../../Components/PromptWidget/PromptWidget';
import AchievementsWidget from '../../Components/AchievementsWidget/AchievementsWidget';
import CTAWidget from '../../Components/CTAWidget/CTAWidget';
import './Home.css'; 

const Home = () => {
  return (
    <div className="widget-container">
      <div class="widget widget1 glass"><ClockWidget /></div>
      <div class="widget widget2 glass"><CTAWidget /></div>
      <div class="widget widget3 glass"><AchievementsWidget /></div>
      <div class="widget widget4 glass"><PresetWidget /></div>
      <div class="widget widget5 glass"><PromptWidget /></div>
    </div>
  );
}

export default Home;
