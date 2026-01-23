/**
 * Constants - Predefined data for the app
 * 
 * Why separate constants?
 * - Easy to modify without touching logic
 * - Reusable across the app
 * - Acts as a single source of truth
 */

import { Badge, HabitSuggestion, MiniChallenge } from './habit.model';

// Smart Habit Suggestions - Users can quickly add these
export const HABIT_SUGGESTIONS: HabitSuggestion[] = [
  {
    name: 'Quit Smoking',
    description: 'Reduce cigarette consumption gradually',
    category: 'health',
    icon: '🚭',
    isReduceHabit: true,
    targetOptions: [
      { label: '10 per day', value: 10 },
      { label: '5 per day', value: 5 },
      { label: '3 per day', value: 3 },
      { label: '1 per day', value: 1 },
      { label: 'No smoking', value: 0 }
    ],
    defaultTarget: 5,
    targetUnit: 'cigarettes',
    suggestedReplacements: ['Drink water', 'Chew gum', 'Take deep breaths', 'Go for a walk', 'Eat a healthy snack']
  },
  {
    name: 'Drink Water',
    description: 'Stay hydrated throughout the day',
    category: 'health',
    icon: '💧',
    isReduceHabit: false,
    targetOptions: [
      { label: '4 glasses', value: 4 },
      { label: '6 glasses', value: 6 },
      { label: '8 glasses', value: 8 },
      { label: '10 glasses', value: 10 }
    ],
    defaultTarget: 8,
    targetUnit: 'glasses',
    suggestedReplacements: ['Set hourly reminders', 'Keep water bottle nearby', 'Add lemon for taste']
  },
  {
    name: 'Exercise',
    description: 'Stay active and healthy',
    category: 'fitness',
    icon: '🏃',
    isReduceHabit: false,
    targetOptions: [
      { label: '15 minutes', value: 15 },
      { label: '30 minutes', value: 30 },
      { label: '45 minutes', value: 45 },
      { label: '60 minutes', value: 60 }
    ],
    defaultTarget: 30,
    targetUnit: 'minutes',
    suggestedReplacements: ['Do stretching', 'Take stairs', 'Walk during calls']
  },
  {
    name: 'Read Books',
    description: 'Expand your knowledge daily',
    category: 'learning',
    icon: '📚',
    isReduceHabit: false,
    targetOptions: [
      { label: '10 pages', value: 10 },
      { label: '20 pages', value: 20 },
      { label: '30 pages', value: 30 },
      { label: '1 chapter', value: 25 }
    ],
    defaultTarget: 20,
    targetUnit: 'pages',
    suggestedReplacements: ['Listen to audiobook', 'Read article', 'Watch educational video']
  },
  {
    name: 'Meditate',
    description: 'Practice mindfulness and calm',
    category: 'mindfulness',
    icon: '🧘',
    isReduceHabit: false,
    targetOptions: [
      { label: '5 minutes', value: 5 },
      { label: '10 minutes', value: 10 },
      { label: '15 minutes', value: 15 },
      { label: '20 minutes', value: 20 }
    ],
    defaultTarget: 10,
    targetUnit: 'minutes',
    suggestedReplacements: ['Deep breathing', 'Mindful walking', 'Body scan']
  },
  {
    name: 'Reduce Screen Time',
    description: 'Limit phone and computer usage',
    category: 'productivity',
    icon: '📱',
    isReduceHabit: true,
    targetOptions: [
      { label: '4 hours max', value: 4 },
      { label: '3 hours max', value: 3 },
      { label: '2 hours max', value: 2 },
      { label: '1 hour max', value: 1 }
    ],
    defaultTarget: 3,
    targetUnit: 'hours',
    suggestedReplacements: ['Read a book', 'Go outside', 'Talk to someone', 'Do a hobby']
  },
  {
    name: 'Sleep Early',
    description: 'Get better sleep by going to bed on time',
    category: 'health',
    icon: '😴',
    isReduceHabit: false,
    targetOptions: [
      { label: 'By 11 PM', value: 23 },
      { label: 'By 10 PM', value: 22 },
      { label: 'By 10:30 PM', value: 22.5 },
      { label: 'By 9:30 PM', value: 21.5 }
    ],
    defaultTarget: 22,
    targetUnit: 'PM',
    suggestedReplacements: ['No screens 1hr before', 'Read instead', 'Warm shower']
  },
  {
    name: 'Save Money',
    description: 'Build financial discipline',
    category: 'finance',
    icon: '💰',
    isReduceHabit: false,
    targetOptions: [
      { label: '$5 per day', value: 5 },
      { label: '$10 per day', value: 10 },
      { label: '$20 per day', value: 20 },
      { label: '$50 per day', value: 50 }
    ],
    defaultTarget: 10,
    targetUnit: 'dollars',
    suggestedReplacements: ['Skip coffee out', 'Bring lunch', 'Use coupons']
  },
  {
    name: 'Practice Gratitude',
    description: 'Write things you are grateful for',
    category: 'mindfulness',
    icon: '🙏',
    isReduceHabit: false,
    targetOptions: [
      { label: '1 thing', value: 1 },
      { label: '3 things', value: 3 },
      { label: '5 things', value: 5 }
    ],
    defaultTarget: 3,
    targetUnit: 'things',
    suggestedReplacements: ['Think about positives', 'Call someone you appreciate']
  },
  {
    name: 'Reduce Junk Food',
    description: 'Eat healthier by limiting junk food',
    category: 'health',
    icon: '🍔',
    isReduceHabit: true,
    targetOptions: [
      { label: '2 times max', value: 2 },
      { label: '1 time max', value: 1 },
      { label: 'No junk food', value: 0 }
    ],
    defaultTarget: 1,
    targetUnit: 'times',
    suggestedReplacements: ['Eat fruits', 'Drink smoothie', 'Healthy snack']
  }
];

// Badge Definitions
export const BADGE_DEFINITIONS: Badge[] = [
  // Streak Badges
  { id: 'streak-3', name: 'Getting Started', description: '3-day streak', icon: '🌱', type: 'streak', requirement: 3 },
  { id: 'streak-7', name: 'One Week Strong', description: '7-day streak', icon: '🔥', type: 'streak', requirement: 7 },
  { id: 'streak-14', name: 'Two Week Warrior', description: '14-day streak', icon: '⚡', type: 'streak', requirement: 14 },
  { id: 'streak-30', name: 'Monthly Master', description: '30-day streak', icon: '🏆', type: 'streak', requirement: 30 },
  { id: 'streak-60', name: 'Habit Hero', description: '60-day streak', icon: '👑', type: 'streak', requirement: 60 },
  { id: 'streak-100', name: 'Century Champion', description: '100-day streak', icon: '💎', type: 'streak', requirement: 100 },
  
  // Points Badges
  { id: 'points-100', name: 'Point Collector', description: 'Earn 100 points', icon: '⭐', type: 'points', requirement: 100 },
  { id: 'points-500', name: 'Point Hunter', description: 'Earn 500 points', icon: '🌟', type: 'points', requirement: 500 },
  { id: 'points-1000', name: 'Point Master', description: 'Earn 1000 points', icon: '✨', type: 'points', requirement: 1000 },
  { id: 'points-5000', name: 'Point Legend', description: 'Earn 5000 points', icon: '💫', type: 'points', requirement: 5000 },
  
  // Habit Badges
  { id: 'habits-1', name: 'First Step', description: 'Create first habit', icon: '🎯', type: 'habits', requirement: 1 },
  { id: 'habits-3', name: 'Triple Threat', description: 'Track 3 habits', icon: '🎪', type: 'habits', requirement: 3 },
  { id: 'habits-5', name: 'Habit Collector', description: 'Track 5 habits', icon: '🎨', type: 'habits', requirement: 5 },
  
  // Special Badges
  { id: 'perfect-week', name: 'Perfect Week', description: 'Complete all habits for 7 days', icon: '🌈', type: 'perfect-week', requirement: 7 },
  { id: 'early-bird', name: 'Early Bird', description: 'Complete habit before time window', icon: '🐦', type: 'early-bird', requirement: 1 },
  { id: 'comeback', name: 'Comeback Kid', description: 'Return after 3+ days break', icon: '💪', type: 'comeback', requirement: 1 },
  { id: 'challenger', name: 'Challenge Accepted', description: 'Complete a mini challenge', icon: '🎖️', type: 'challenger', requirement: 1 }
];

// Default Mini Challenges - Rotate weekly
export const DEFAULT_CHALLENGES: Omit<MiniChallenge, 'id' | 'startDate' | 'endDate' | 'currentValue' | 'isCompleted'>[] = [
  {
    title: '3-Day Streak',
    description: 'Maintain any habit for 3 consecutive days',
    type: 'streak',
    targetValue: 3,
    reward: 50
  },
  {
    title: 'Perfect Day',
    description: 'Complete all your habits in a single day',
    type: 'perfect-day',
    targetValue: 1,
    reward: 30
  },
  {
    title: 'Point Rush',
    description: 'Earn 50 points today',
    type: 'points',
    targetValue: 50,
    reward: 25
  },
  {
    title: 'Early Achiever',
    description: 'Complete a habit before its time window',
    type: 'early',
    targetValue: 1,
    reward: 20
  },
  {
    title: 'Replacement Pro',
    description: 'Do replacement actions 5 times',
    type: 'replacement',
    targetValue: 5,
    reward: 40
  }
];

// Coach Tips based on situations
export interface CoachTip {
  situation: string;
  mood?: string;
  tips: string[];
}

export const COACH_TIPS: CoachTip[] = [
  {
    situation: 'streak-broken',
    tips: [
      "Don't worry! Everyone slips sometimes. The key is to start again today.",
      "One bad day doesn't erase your progress. Get back on track!",
      "Remember why you started. Your past effort still counts!"
    ]
  },
  {
    situation: 'new-habit',
    tips: [
      "Start small! It's better to do a little consistently than a lot occasionally.",
      "Focus on showing up, not being perfect.",
      "Link this habit to something you already do daily."
    ]
  },
  {
    situation: 'streak-milestone',
    tips: [
      "Amazing work! You're building real momentum.",
      "Your consistency is paying off. Keep going!",
      "You've proven you can do this. The next milestone awaits!"
    ]
  },
  {
    situation: 'mood-stressed',
    mood: 'Stressed',
    tips: [
      "Take it easy today. Even small progress counts.",
      "Consider your replacement action to destress.",
      "Remember: habits help reduce stress over time."
    ]
  },
  {
    situation: 'mood-sad',
    mood: 'Sad',
    tips: [
      "It's okay to feel this way. Be gentle with yourself.",
      "Completing a small habit might boost your mood.",
      "Your habits are there to support you, not pressure you."
    ]
  },
  {
    situation: 'mood-happy',
    mood: 'Happy',
    tips: [
      "Great mood! Perfect time to crush your habits!",
      "Use this positive energy to build momentum.",
      "Happy days are great for tackling tough habits."
    ]
  },
  {
    situation: 'time-window-active',
    tips: [
      "Your habit time window is active! Time to focus.",
      "This is your scheduled habit time. You've got this!",
      "Use this dedicated time wisely."
    ]
  },
  {
    situation: 'almost-there',
    tips: [
      "You're so close to your target! Just a little more.",
      "Almost done for today. Finish strong!",
      "One more push and you'll hit your goal."
    ]
  }
];

// Points configuration
export const POINTS_CONFIG = {
  baseComplete: 10,        // Points for completing daily target
  replacementBonus: 5,     // Bonus for doing replacement action
  streakMultiplier: 0.5,   // Additional points per streak day (e.g., 5-day streak = +2.5 bonus)
  moodBonus: {
    Happy: 2,
    Neutral: 0,
    Sad: 3,      // Extra points for pushing through
    Stressed: 3  // Extra points for pushing through
  },
  earlyBonus: 5,           // Bonus for completing before time window
  perfectDayBonus: 20      // Bonus for completing all habits
};

// Category colors for UI
export const CATEGORY_COLORS: Record<string, string> = {
  health: '#4CAF50',
  fitness: '#FF5722',
  mindfulness: '#9C27B0',
  productivity: '#2196F3',
  social: '#E91E63',
  learning: '#FF9800',
  finance: '#009688',
  other: '#607D8B'
};

// Category icons
export const CATEGORY_ICONS: Record<string, string> = {
  health: '❤️',
  fitness: '💪',
  mindfulness: '🧠',
  productivity: '⚡',
  social: '👥',
  learning: '📖',
  finance: '💵',
  other: '📌'
};

