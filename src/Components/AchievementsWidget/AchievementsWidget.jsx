import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../Context/AuthContext';
import { getAchievements } from '../../Utils/achievementUtil';
import './AchievementsWidget.css';

const AchievementsWidget = ({ setLoading }) => {
  const { authState } = useAuth();
  const { user } = authState;
  const [achievements, setAchievements] = useState(null);
  const [closestAchievements, setClosestAchievements] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      setLoading(true);
      try {
        const userId = user.sub;
        const response = await axios.get(`http://localhost:5000/api/achievements/${userId}`);
        setAchievements(response.data);
      } catch (err) {
        setError('Error fetching achievements: ' + (err.response?.data?.message || err.message));
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [user]);

  useEffect(() => {
    const fetchClosestAchievements = async () => {
      if (achievements) {
        const { closestAchievements } = await getAchievements(achievements, user.sub);
        setClosestAchievements(closestAchievements);
      }
    };

    fetchClosestAchievements();
  }, [achievements, user]);

  if (!achievements) return <p>No achievements data available.</p>;

  return (
    <div className="achievements-container">
      <h2 className="achievements-title">Achievements</h2>
      {Array.isArray(closestAchievements) && closestAchievements.length === 0 ? (
        <p>No achievements to display.</p>
      ) : (
        <ul className="achievements-list">
          {Array.isArray(closestAchievements) && closestAchievements.map((achievement, index) => (
            <li key={index} className="achievement-item">
              <div className="achievement-icon-placeholder"></div>
              <div className="achievement-details">
                <p className="achievement-name">
                  {achievement.name}
                </p>
                <p className="achievement-progress">{achievement.userProgress} / {achievement.target} {achievement.unit}  {achievement.additionalInfo && `${achievement.additionalInfo}`}</p>
              </div>
              <div className="achievement-progress-bar">
                <div 
                  className="achievement-progress-fill" 
                  style={{ width: `${achievement.progressPercentage}%` }}>
                </div>
              </div>
              <p className="achievement-percentage">{Math.round(achievement.progressPercentage)}%</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AchievementsWidget;
