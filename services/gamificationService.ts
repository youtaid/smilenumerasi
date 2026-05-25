
// Base XP required for Level 1 is 0. 
// This is a linear progression for simplicity: Level = Floor(XP / 500) + 1

const XP_PER_LEVEL = 500;

export const calculateLevel = (totalXP: number): number => {
  return Math.floor(totalXP / XP_PER_LEVEL) + 1;
};

export const calculateNextLevelXP = (currentLevel: number): number => {
  return currentLevel * XP_PER_LEVEL;
};

export const calculateCurrentLevelProgress = (totalXP: number): number => {
  const currentLevel = calculateLevel(totalXP);
  // Current Level Base XP = (Current Level - 1) * 500
  const currentLevelBaseXP = (currentLevel - 1) * XP_PER_LEVEL;
  
  // XP gained in this level = Total XP - Base XP
  const xpInCurrentLevel = totalXP - currentLevelBaseXP;
  
  const progress = (xpInCurrentLevel / XP_PER_LEVEL) * 100;
  return Math.min(Math.max(progress, 0), 100); // Clamp between 0 and 100
};

export const getLevelTitle = (level: number): string => {
  if (level < 5) return "Novice Explorer"; // Level 1-4 (0 - 1999 XP)
  if (level < 10) return "Active Practitioner"; // Level 5-9 (2000 - 4499 XP)
  if (level < 15) return "Creative Innovator"; // Level 10-14 (4500 - 6999 XP)
  if (level < 20) return "Master Mentor"; // Level 15-19 (7000 - 9999 XP)
  return "Legendary Guru"; // Level 20+ (10000+ XP)
};
