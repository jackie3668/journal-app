import { predefinedAchievements } from '../Data/predefinedAchievements';
import axios from 'axios';

export const getClosestAchievements = async (userAchievements, userId) => {
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
  const folderCount = distinctFolders.size;

  console.log('Tag Usage Map:', tagUsageMap);
  console.log('Folder Entry Count Map:', folderEntryCountMap);
  console.log('Highest Tag Usage:', highestTagUsage);
  console.log('Highest Folder Entry Count:', highestFolderEntryCount);
  console.log('Distinct Folder Count:', folderCount);

  for (const achievement of predefinedAchievements) {
    let userProgress = 0;
    switch (achievement.category) {
      case 'wordCount':
        userProgress = userAchievements.totalWordCount;
        break;
      case 'entryCount':
        userProgress = userAchievements.entryCount;
        break;
      case 'folderCount':
        userProgress = folderCount;
        console.log(`Folder Count - User Progress: ${userProgress}`);
        break;
      case 'tagUsage':
        userProgress = Object.keys(userAchievements.tagUsage).length;
        break;
      case 'specificTagUsage':
        userProgress = highestTagUsage;
        console.log(`Specific Tag Usage - User Progress: ${userProgress}`);
        break;
      case 'entriesInFolder':
        userProgress = highestFolderEntryCount;
        console.log(`Entries in Folder - User Progress: ${userProgress}`);
        break;
      case 'timeSpentWriting':
        userProgress = userAchievements.timeSpentWriting;
        break;
      default:
        userProgress = 0;
    }
    const remaining = achievement.target - userProgress;

    if (!categoryProgress[achievement.category]) {
      categoryProgress[achievement.category] = [];
    }

    categoryProgress[achievement.category].push({ ...achievement, userProgress, remaining });

    console.log(`Achievement added: ${achievement.name}, User Progress: ${userProgress}, Remaining: ${remaining}`);
  }

  Object.keys(categoryProgress).forEach((category) => {
    console.log(`Processing category: ${category}`);
    console.log('Before filter:', categoryProgress[category]);

    categoryProgress[category] = categoryProgress[category]
      .filter(a => {
        console.log(`Filtering achievement: ${a.name}, Remaining: ${a.remaining}`);
        return a.remaining > 0;
      })
      .sort((a, b) => a.remaining - b.remaining)[0];

    console.log('After filter and sort:', categoryProgress[category]);
  });

  console.log('Category Progress:', categoryProgress);

  return Object.values(categoryProgress).filter(Boolean);
};
