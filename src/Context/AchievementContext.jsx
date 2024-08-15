import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';

const AchievementContext = createContext();

export const AchievementProvider = ({ children }) => {
  const { authState } = useAuth();
  const { user } = authState;
  const [achievements, setAchievements] = useState({
    writingStreak: 0,
    totalWordCount: 0,
    entryCount: 0,
    tagUsage: {},
    folderCount: 0,
    promptUsage: 0,
    longTermEngagement: 0,
    timeSpentWriting: 0
  });

  const fetchAchievements = async () => {
    if (!user || !user.sub) {
      console.error('User information is missing.');
      return null;  
    }
  
    try {
      const response = await fetch(`http://https://journal-app-backend-8szt.onrender.com/api/achievements/${user.sub}` || `https://journal-app-backend-8szt.onrender.com/api/achievements/${user.sub}`);
      if (response.ok || response.status === 210) {
        const data = await response.json(); 
        return data;  
      } else {
        console.error('Failed to fetch achievements, status:', response.status);
        return null; 
      }
    } catch (error) {
      console.error('Error fetching achievements:', error.message);
      throw error; 
    }
  };
  

  const updateAchievements = async (type, payload) => {
    if (!user || !user.sub) {
      console.error('User information is missing.');
      return;
    }

    try {
      const response = await fetch(`http://https://journal-app-backend-8szt.onrender.com/api/achievements/${user.sub}`);
      let achievementsData = null;

      if (response.ok) {
        achievementsData = await response.json();
      }

      setAchievements(prev => {
        const updatedAchievements = { ...prev };
        switch (type) {
          case 'incrementWordCount':
            updatedAchievements.totalWordCount += payload;
            break;
          case 'incrementEntryCount':
            console.log(`Fentry updated to ${updatedAchievements.entryCount}`);
            updatedAchievements.entryCount += 1;
            console.log(`Fentry updated to ${updatedAchievements.entryCount}`); 
            break;
          case 'updateTagUsage':
            payload.forEach(tag => {
              updatedAchievements.tagUsage[tag] = (updatedAchievements.tagUsage[tag] || 0) + 1;
            });
            break;
          case 'incrementFolderCount':
            console.log(`Folder count updated to ${updatedAchievements.folderCount}`); 
            updatedAchievements.folderCount += 1;
            console.log(`Folder count updated to ${updatedAchievements.folderCount}`);
            break;
          case 'incrementPromptUsage':
            updatedAchievements.promptUsage += 1;
            break;
          case 'incrementTimeSpentWriting':
            updatedAchievements.timeSpentWriting += payload;
            break;
          default:
            break;
        }
        return updatedAchievements;
      });

      const method = achievementsData ? 'PUT' : 'POST';
      const url = achievementsData
      ? `http://https://journal-app-backend-8szt.onrender.com/api/achievements/${user.sub}` || `https://journal-app-backend-8szt.onrender.com/api/achievements/${user.sub}`
      : 'http://https://journal-app-backend-8szt.onrender.com/api/achievements' || 'https://journal-app-backend-8szt.onrender.com/api/achievements';    

      await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.sub,
          type,
          payload,
        }),
      });

    } catch (error) {
      console.error('Error updating achievements:', error.message);
    }
  };

  useEffect(() => {
    if (user && user.sub) {
      fetchAchievements();
    }
  }, [user]);

  return (
    <AchievementContext.Provider value={{ achievements, updateAchievements, fetchAchievements }}>
      {children}
    </AchievementContext.Provider>
  );
};

export const useAchievements = () => useContext(AchievementContext);
