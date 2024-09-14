import { predefinedAchievements } from '../Data/predefinedAchievements';
import axios from 'axios';
import achievementUnitMap from '../Data/achievementUnitMap';

export const getAchievements = async (userId) => {
  const categoryProgress = {};

  let userAchievements = {};
  
  try {
    const response = await fetch(`https://journal-app-backend-8szt.onrender.com/api/achievements/${userId}` || `https://journal-app-backend-8szt.onrender.com/api/achievements/${userId}`);
    if (response.status === 200) {
      userAchievements = await response.json();
    } else if (response.status === 210) {
      userAchievements = await response.json();
    } else {
      console.error('Failed to fetch achievements, status:', response.status);
      return {
        allAchievements: [],
        closestAchievements: [],
        mostUsedTag: '',
        mostUsedFolder: ''
      };
    }
  } catch (err) {
    console.error('Error fetching achievements:', err.message);
    return {
      allAchievements: [],
      closestAchievements: [],
      mostUsedTag: '',
      mostUsedFolder: ''
    };
  }

  let allEntries = [];
  try {
    const response = await axios.get('https://journal-app-backend-8szt.onrender.com/api/entries/all' || 'https://journal-app-backend-8szt.onrender.com/api/entries/all', {
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
        userProgress = Object.keys(userAchievements.tagUsage || {}).length;
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
        userProgress = Math.floor(userAchievements.timeSpentWriting / 60); 
        unit = 'minutes';
        break;
      default:
        userProgress = 0;
    }

    let progressPercentage = Math.min((userProgress || 0 / achievement.target) * 100, 100);
    
    if (progressPercentage >= 99 && progressPercentage < 100) {
      progressPercentage = 99;
    }

    if (progressPercentage >= 100) {
      return null;
    }

    return { 
      ...achievement, 
      userProgress, 
      progressPercentage,
      additionalInfo,
      unit
    };
  }).filter(Boolean);

  allAchievements.forEach(achievement => {
    if (!categoryProgress[achievement.category]) {
      categoryProgress[achievement.category] = [];
    }

    categoryProgress[achievement.category].push(achievement);
  });

  const closestAchievements = Object.values(categoryProgress)
    .map(achievements => 
      achievements.sort((a, b) => b.progressPercentage - a.progressPercentage)[0]
    )
    .filter(Boolean) 
    .sort((a, b) => b.progressPercentage - a.progressPercentage) 
    .slice(0, 3); 
    
  return {
    allAchievements,
    closestAchievements,
    mostUsedTag,
    mostUsedFolder
  };
};
