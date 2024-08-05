import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../Context/AuthContext';

const AchievementsWidget = () => {
  const { authState } = useAuth();
  const { user } = authState;
  const [achievements, setAchievements] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAchievements = async () => {
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
  

  if (loading) return <p>Loading...</p>;
  if (!achievements) return <p>No achievements data available.</p>;

  return (
    <div className="achievements-container">
      <h2>Your Achievements</h2>
      {Object.keys(achievements).length === 0 ? (
        <p>No achievements to display.</p>
      ) : (
        <ul className="achievements-list">
          <li className="achievement-item">
            <p>{achievements.totalWordCount}</p>
          </li>
          <li className="achievement-item">
            <p>{achievements.entryCount}</p>
          </li>
          <li className="achievement-item">
            <p>{achievements.folderCount}</p>
          </li>
          <li className="achievement-item">
            <p>{achievements.promptUsage}</p>
          </li>
          <li className="achievement-item">
            <p>{Math.floor(achievements.timeSpentWriting / 60)}m {achievements.timeSpentWriting % 60}s</p>
          </li>
        </ul>
      )}
    </div>
  );
};

export default AchievementsWidget;
