import React from 'react';
import { Navigate, BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { useLoading } from './Context/LoadingContext';
import { useAuth } from './Context/AuthContext';
import './App.css';
import Background from './Components/Background/Background';
import Home from './Pages/Home/Home';
import Journal from './Pages/Journal/Journal';
import NavBar from './Components/NavBar/NavBar';
import LoadingScreen from './Components/LoadingScreen/LoadingScreen';
import AnimatedCursor from "react-animated-cursor"
import Player from './Components/Player/Player';
import Account from './Pages/Account/Account';
import Upload from './Pages/Upload/Upload';

const App = () => {
  const location = useLocation();
  const isJournalRoute = location.pathname === '/journal';
  const { isLoading } = useLoading();
  const { authState, login } = useAuth();

  return (
    <div className="container">
      {isLoading && <LoadingScreen />}
      <Background />
      <Player />
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
          <Route path="/journal" element={<Journal />} />
          <Route
            path="/account"
            element={
              authState.isAuthenticated ? (
                <Account />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route path="/upload" element={<Upload />} />
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
