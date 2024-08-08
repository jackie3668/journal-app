import { predefinedAchievements } from '../Data/predefinedAchievements';
import axios from 'axios';
import achievementUnitMap from '../Data/achievementUnitMap';

export const getAchievements = async (userAchievements, userId) => {
  const categoryProgress = {};

  let allEntries = [];
  try {
    const response = await axios.get(`http://localhost:5000/api/entries/all`, {
      params: { userId: userId }
    });
    allEntries = response.data || [];
  } catch (err) {
    console.error('Error fetching all entries:', err);
  }

  const tagUsageMap = {};
  const folderEntryCountMap = {};
  const distinctFolders = new Set();

  allEntries.forEach(entry => {
    entry.tags.forEach(tag => {
      if (!tagUsageMap[tag]) {
        tagUsageMap[tag] = 0;
      }
      tagUsageMap[tag]++;
    });

    const folderName = entry.folderName || 'Default';
    if (folderName !== 'Default') {
      if (!folderEntryCountMap[folderName]) {
        folderEntryCountMap[folderName] = 0;
      }
      folderEntryCountMap[folderName]++;
      distinctFolders.add(folderName);
    }
  });

  const highestTagUsage = Math.max(...Object.values(tagUsageMap), 0);
  const highestFolderEntryCount = Math.max(...Object.values(folderEntryCountMap), 0);
  const mostUsedTag = Object.keys(tagUsageMap).reduce((a, b) => tagUsageMap[a] > tagUsageMap[b] ? a : b, '');
  const mostUsedFolder = Object.keys(folderEntryCountMap).reduce((a, b) => folderEntryCountMap[a] > folderEntryCountMap[b] ? a : b, '');
  const folderCount = distinctFolders.size;

  const allAchievements = predefinedAchievements.map(achievement => {
    let userProgress = 0;
    let additionalInfo = '';
    let unit = achievementUnitMap[achievement.category] || ''; 

    switch (achievement.category) {
      case 'wordCount':
        userProgress = userAchievements.totalWordCount;
        break;
      case 'entryCount':
        userProgress = userAchievements.entryCount;
        break;
      case 'folderCount':
        userProgress = folderCount;
        break;
      case 'tagUsage':
        userProgress = Object.keys(userAchievements.tagUsage).length;
        break;
      case 'specificTagUsage':
        userProgress = highestTagUsage;
        additionalInfo = mostUsedTag;
        break;
      case 'entriesInFolder':
        userProgress = highestFolderEntryCount;
        additionalInfo = mostUsedFolder;
        break;
      case 'timeSpentWriting':
        userProgress = userAchievements.timeSpentWriting;
        break;
      default:
        userProgress = 0;
    }
    const progressPercentage = Math.min((userProgress / achievement.target) * 100, 100);

    return { 
      ...achievement, 
      userProgress, 
      progressPercentage,
      additionalInfo,
      unit
    };
  });

  allAchievements.forEach(achievement => {
    if (!categoryProgress[achievement.category]) {
      categoryProgress[achievement.category] = [];
    }

    categoryProgress[achievement.category].push(achievement);
  });

  const closestAchievements = allAchievements
    .filter(a => a.progressPercentage < 100)
    .sort((a, b) => b.progressPercentage - a.progressPercentage)
    .slice(0, 3);
    
  return {
    allAchievements,
    closestAchievements,
    mostUsedTag,
    mostUsedFolder
  };
};
