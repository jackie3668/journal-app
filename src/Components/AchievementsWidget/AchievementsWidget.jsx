import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../Context/AuthContext';
import { getAchievements } from '../../Utils/achievementUtil';
import { useAchievements } from '../../Context/AchievementContext';
import achievementUnitMap from '../../Data/achievementUnitMap';
import word from '../../Assets/UI/Achievements/font.png';
import entry from '../../Assets/UI/Achievements/paper.png';
import time from '../../Assets/UI/Achievements/timing.png';
import folder from '../../Assets/UI/Achievements/folder.png';
import tag from '../../Assets/UI/Achievements/tag.png';
import lock from '../../Assets/UI/Achievements/padlock.png'
import './AchievementsWidget.css';

const AchievementsWidget = ({ setLoading }) => {
  const { authState } = useAuth();
  const { user } = authState;
  const { achievements, fetchAchievements, setAchievements } = useAchievements();
  const [closestAchievements, setClosestAchievements] = useState([]);
  const [error, setError] = useState(null);

  const achievementIcons = {
    wordCount: word,
    entryCount: entry,
    folderCount: folder,
    tagUsage: tag,
    specificTagUsage: tag,
    entriesInFolder: folder,
    timeSpentWriting: time,
    promptUsage: entry,
  };

  useEffect(() => {
    if (user && user.sub) {
      const fetchOrCreateAchievements = async () => {
        try {
          const response = await fetchAchievements(); 
          
          if (response?.status === 210) {  
            const initialAchievements = {
              userId: user.sub,
              totalWordCount: 0,
              entryCount: 0,
              tagUsage: {},
              folderCount: 0,
              promptUsage: 0,
              timeSpentWriting: 0,
            };

            await axios.post('http://localhost:5000/api/achievements', initialAchievements);
            setAchievements(initialAchievements);
          } else if (response?.status === 200) {
            setAchievements(response.data);
          }
        } catch (err) {
          setError('Error fetching or creating achievements: ' + err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchOrCreateAchievements();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const fetchClosestAchievements = async () => {
      if (!user) {
        return
      }
      if (achievements && user && user.sub) {
        const { closestAchievements } = await getAchievements(achievements, user.sub);
        setClosestAchievements(closestAchievements);
      }
    };

    if (user && user.sub) {
      fetchClosestAchievements();
    }
  }, [achievements, user]);

  return (
    <div className="achievements-container">
      <h2 className="achievements-title">Achievements</h2>
        {!authState.isAuthenticated ? (
        <div className='achievement-auth glass'>
            <img src={lock} alt="lock" />
            <p>Please log in</p>
        </div>
        ):(
        <ul className="achievements-list">
          {Array.isArray(closestAchievements) && closestAchievements.map((achievement, index) => (
            <li key={index} className="achievement-item">
              <div 
                  className="achievement-progress-fill" 
                  style={{ width: `${achievement.progressPercentage}%` }}>
              </div>
              <div className="achievement-icon">
                <img src={achievementIcons[achievement.category]} alt={`${achievement.category} icon`} />
              </div>
              <div className="achievement-details">
                <p className="achievement-name">
                  {achievement.name}
                </p>
                <p className="achievement-progress">
                  {achievement.userProgress} / {achievement.target} {achievementUnitMap[achievement.category]}
                  {/* {achievement.additionalInfo && `${achievement.additionalInfo}`} */}
                </p>
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
