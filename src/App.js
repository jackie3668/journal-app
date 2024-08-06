import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { useLoading } from './Context/LoadingContext';
import './App.css';
import Background from './Components/Background/Background';
import Home from './Pages/Home/Home';
import Journal from './Pages/Journal/Journal';
import NavBar from './Components/NavBar/NavBar';
import LoadingScreen from './Components/LoadingScreen/LoadingScreen';


const App = () => {
  const location = useLocation();
  const isJournalRoute = location.pathname === '/journal';
  const { isLoading } = useLoading();

  return (
    <div className="container">
      {isLoading && <LoadingScreen />}
      <Background />
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
