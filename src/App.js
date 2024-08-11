import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { useLoading } from './Context/LoadingContext';
import './App.css';
import Background from './Components/Background/Background';
import Home from './Pages/Home/Home';
import Journal from './Pages/Journal/Journal';
import NavBar from './Components/NavBar/NavBar';
import LoadingScreen from './Components/LoadingScreen/LoadingScreen';
import AnimatedCursor from "react-animated-cursor"
import Player from './Components/Player/Player';
import GlobalVolume from './Components/GlobalVolume/GlobalVolume';

const App = () => {
  const location = useLocation();
  const isJournalRoute = location.pathname === '/journal';
  const { isLoading } = useLoading();

  return (
    <div className="container">
      {isLoading && <LoadingScreen />}
      <Background />
      <Player />
      <GlobalVolume />
      <AnimatedCursor
        innerSize={10}
        outerSize={12}
        color='255,255,255'
        outerAlpha={0.3}
        innerScale={0.7}
        outerScale={3}
        clickables={[
          'a',
          'input[type="text"]',
          'input[type="email"]',
          'input[type="number"]',
          'input[type="submit"]',
          'input[type="image"]',
          'label[for]',
          'select',
          'textarea',
          'button',
          '.link',
          '.clickable'
        ]}
        outerStyle={{
          mixBlendMode: 'exclusion'
        }}
      />
      <div className={`container-border ${isJournalRoute ? 'hidden' : ''}`}>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/account" element={<Home />} />
          <Route path="/journal" element={<Journal />} />
        </Routes>
      </div>
    </div>
  );
};

const AppWithRouter = () => (
  <Router>
    <App />
  </Router>
);

export default AppWithRouter;
