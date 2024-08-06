import React, { useState } from 'react';
import { Scrollbar } from 'react-scrollbars-custom';
import ClockWidget from '../../Components/ClockWidget/ClockWidget';
import PresetWidget from '../../Components/PresetWidget/PresetWidget';
import PromptWidget from '../../Components/PromptWidget/PromptWidget';
import AchievementsWidget from '../../Components/AchievementsWidget/AchievementsWidget';
import CTAWidget from '../../Components/CTAWidget/CTAWidget';
import { useLoading } from '../../Context/LoadingContext';
import './Home.css';

const Home = () => {
  const { showLoading, hideLoading } = useLoading();
  const [widgetsLoading, setWidgetsLoading] = useState({
    clock: true,
    achievements: true,
  });

  const handleWidgetLoading = (widget, isLoading) => {
    setWidgetsLoading((prevState) => ({
      ...prevState,
      [widget]: isLoading,
    }));
  };

  const allWidgetsLoaded = !widgetsLoading.clock && !widgetsLoading.achievements;

  React.useEffect(() => {
    if (allWidgetsLoaded) {
      hideLoading();
    } else {
      showLoading();
    }
  }, [allWidgetsLoaded, showLoading, hideLoading]);

  return (
    <Scrollbar>
      <div className="widget-container">
        <div className="widget widget1 glass">
          <ClockWidget setLoading={(isLoading) => handleWidgetLoading('clock', isLoading)} />
        </div>
        <div className="widget widget2 glass"><CTAWidget /></div>
        <div className="widget widget3 glass">
          <AchievementsWidget setLoading={(isLoading) => handleWidgetLoading('achievements', isLoading)} />
        </div>
        <div className="widget widget4 glass"><PresetWidget /></div>
        <div className="widget widget5 glass"><PromptWidget /></div>
      </div>
    </Scrollbar>
  );
}

export default Home;
