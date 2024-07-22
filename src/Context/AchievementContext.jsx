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

  const updateAchievements = async (type, payload) => {
    // Update local state
    setAchievements(prev => {
      const updatedAchievements = { ...prev };
      switch (type) {
        case 'incrementWordCount':
          updatedAchievements.totalWordCount += payload;
          break;
        case 'incrementEntryCount':
          updatedAchievements.entryCount += 1;
          break;
        case 'updateTagUsage':
          payload.forEach(tag => {
            updatedAchievements.tagUsage[tag] = (updatedAchievements.tagUsage[tag] || 0) + 1;
          });
          break;
        case 'incrementFolderCount':
          updatedAchievements.folderCount += 1;
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
  
    // Send update to the backend
    try {
      if (!user || !user.sub) {
        throw new Error('User information is missing.');
      }
  
      await fetch('http://localhost:5000/api/achievements', {
        method: 'POST',
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
      console.error('Error posting achievements:', error.message);
    }
  };
  
  
  return (
    <AchievementContext.Provider value={{ achievements, updateAchievements }}>
      {children}
    </AchievementContext.Provider>
  );
};

export const useAchievements = () => useContext(AchievementContext);
