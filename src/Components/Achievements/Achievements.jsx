import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../Context/AuthContext';
import { getAchievements } from '../../Utils/achievementUtil';
import { useAchievements } from '../../Context/AchievementContext';
import achievementUnitMap from '../../Data/achievementUnitMap';
import { Scrollbar } from 'react-scrollbars-custom';
import word from '../../Assets/UI/Achievements/font.png';
import entry from '../../Assets/UI/Achievements/paper.png';
import time from '../../Assets/UI/Achievements/timing.png';
import folder from '../../Assets/UI/Achievements/folder.png';
import tag from '../../Assets/UI/Achievements/tag.png';
import lock from '../../Assets/UI/Achievements/padlock.png';
import './Achievements.css'

const Achievements = () => {
  const { authState } = useAuth();
  const { user } = authState;
  const { achievements, fetchAchievements, setAchievements } = useAchievements();
  const [inProgressAchievements, setInProgressAchievements] = useState([]);
  const [completedAchievements, setCompletedAchievements] = useState([]);
  const [notStartedAchievements, setNotStartedAchievements] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false)

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
    const fetchAchievementsData = async () => {
      if (!user) {
        return;
      }
      if (achievements && user && user.sub) {
        const { allAchievements } = await getAchievements(user.sub);
        
        const inProgress = allAchievements.filter(ach => ach.progressPercentage > 0 && ach.progressPercentage < 100);
        const completed = allAchievements.filter(ach => ach.progressPercentage === 100);
        const notStarted = allAchievements.filter(ach => ach.progressPercentage === 0);

        setInProgressAchievements(inProgress);
        setCompletedAchievements(completed);
        setNotStartedAchievements(notStarted);
      }
    };

    if (user && user.sub) {
      fetchAchievementsData();
    }
  }, [achievements, user]);

  return (
    <div className="account-subcontainer">
      <h2 className="achievements-title">Achievements</h2>
      {!authState.isAuthenticated ? (
        <div className="achievement-auth glass">
          <img src={lock} alt="lock" />
          <p>Please log in</p>
        </div>
      ) : (
        <>
          <Scrollbar>
            <div className="achievements-section">
              <h4>In Progress Achievements</h4>
              <ul className="achievements-list">
                {Array.isArray(inProgressAchievements) &&
                  Object.values(
                    inProgressAchievements.reduce((acc, achievement) => {
                      const category = achievement.category;
                      if (
                        !acc[category] ||
                        acc[category].progressPercentage < achievement.progressPercentage
                      ) {
                        acc[category] = achievement;
                      }
                      return acc;
                    }, {})
                  ).map((achievement, index) => (
                    <li key={index} className="achievement-item">
                      <div
                        className="achievement-progress-fill"
                        style={{ width: `${achievement.progressPercentage}%` }}
                      ></div>
                      <div className="achievement-icon">
                        <img
                          src={achievementIcons[achievement.category]}
                          alt={`${achievement.category} icon`}
                        />
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
            </div>


            <div className="achievements-section">
              <h4>Completed Achievements</h4>
              <ul className="achievements-list">
                {Array.isArray(completedAchievements) && completedAchievements.map((achievement, index) => (
                  <li key={index} className="achievement-item">
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
            </div>
          </Scrollbar>
 
        </>
      )}
    </div>
  );
};

export default Achievements;
