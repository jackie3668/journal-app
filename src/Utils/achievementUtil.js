import { predefinedAchievements } from '../Data/predefinedAchievements';

export const getClosestAchievements = (userAchievements) => {
  const categoryProgress = predefinedAchievements.reduce((acc, achievement) => {
    let userProgress = 0;
    switch (achievement.category) {
      case 'wordCount':
        userProgress = userAchievements.totalWordCount;
        break;
      case 'entryCount':
        userProgress = userAchievements.entryCount;
        break;
      case 'folderCount':
        userProgress = userAchievements.folderCount;
        break;
      case 'tagUsage':
        userProgress = Object.keys(userAchievements.tagUsage).length;
        break;
      case 'specificTagUsage':
        userProgress = userAchievements.tagUsage[achievement.name] || 0;
        break;
      case 'entriesInFolder':
        userProgress = userAchievements.entriesInFolder || 0;
        break;
      case 'timeSpentWriting':
        userProgress = userAchievements.timeSpentWriting;
        break;
      default:
        userProgress = 0;
    }
    const remaining = achievement.target - userProgress;

    // Logging for debugging
    console.log(`Processing achievement: ${achievement.name}`);
    console.log(`Category: ${achievement.category}, User Progress: ${userProgress}, Target: ${achievement.target}`);
    console.log(`Remaining: ${remaining}`);

    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }

    acc[achievement.category].push({ ...achievement, userProgress, remaining });

    return acc;
  }, {});

  // Filter out the closest achievement for each category
  Object.keys(categoryProgress).forEach((category) => {
    categoryProgress[category] = categoryProgress[category].filter(a => a.remaining > 0).sort((a, b) => a.remaining - b.remaining)[0];
  });

  console.log('Category Progress:', categoryProgress);

  return Object.values(categoryProgress).filter(Boolean);
};
