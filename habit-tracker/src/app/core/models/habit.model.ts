/**
 * Habit Model - Defines the structure of a habit
 * 
 * Why interfaces?
 * - They provide type safety (TypeScript will warn us if we use wrong data types)
 * - They act as documentation (you can see exactly what properties a habit has)
 * - They help with autocomplete in your code editor
 */

// Mood options for daily tracking
export type Mood = 'Happy' | 'Sad' | 'Stressed' | 'Neutral';

// Time window for habit reminders
export interface TimeWindow {
  start: string;  // Format: "HH:mm" (e.g., "18:00")
  end: string;    // Format: "HH:mm" (e.g., "22:00")
}

// Daily status - tracks what happened each day
export interface DailyStatus {
  date: string;           // Format: "YYYY-MM-DD" (e.g., "2026-01-23")
  done: boolean;          // Was the target met?
  value: number;          // Actual value achieved (e.g., smoked 2 cigarettes)
  mood: Mood;             // User's mood that day
  pointsEarned: number;   // Points earned that day
  replacementDone: boolean; // Did user do the replacement action?
  streakFrozen?: boolean; // Was streak freeze used?
}

// Preset target options for habits
export interface TargetOption {
  label: string;  // Display text (e.g., "5 per day")
  value: number;  // Numeric value (e.g., 5)
}

// Main Habit interface
export interface Habit {
  id: number;                     // Unique identifier
  name: string;                   // Habit name (e.g., "Quit Smoking")
  description?: string;           // Optional description
  targetOptions: TargetOption[];  // Preset options for daily target
  targetValue: number;            // Current selected target
  targetUnit: string;             // Unit of measurement (e.g., "cigarettes", "glasses")
  isReduceHabit: boolean;         // true = reduce (smoking), false = increase (exercise)
  replacement: string;            // Replacement action (e.g., "Drink water")
  timeWindow?: TimeWindow;        // Optional time window
  currentStreak: number;          // Current consecutive days
  bestStreak: number;             // Best streak ever achieved
  totalPoints: number;            // Lifetime points for this habit
  dailyStatus: DailyStatus[];     // History of daily tracking
  createdAt: string;              // When habit was created
  lastStreakFreezeDate?: string;  // Last time streak freeze was used
  isActive: boolean;              // Is the habit currently being tracked?
  category: HabitCategory;        // Category for organization
  icon: string;                   // Emoji icon for the habit
}

// Habit categories for organization
export type HabitCategory = 
  | 'health' 
  | 'fitness' 
  | 'mindfulness' 
  | 'productivity' 
  | 'social' 
  | 'learning' 
  | 'finance' 
  | 'other';

// Smart habit suggestions - predefined habits users can choose
export interface HabitSuggestion {
  name: string;
  description: string;
  category: HabitCategory;
  icon: string;
  isReduceHabit: boolean;
  targetOptions: TargetOption[];
  defaultTarget: number;
  targetUnit: string;
  suggestedReplacements: string[];
}

// User profile for leaderboard
export interface UserProfile {
  id: number;
  name: string;
  avatar: string;           // Emoji avatar
  totalPoints: number;
  totalHabits: number;
  longestStreak: number;
  badges: Badge[];
  createdAt: string;
  color: string;            // User's theme color
}

// Full User with their own habits (for multi-user support)
export interface User {
  id: number;
  profile: UserProfile;
  habits: Habit[];
  challenges: MiniChallenge[];
}

// Daily Habit Battle between two users
export interface HabitBattle {
  id: string;
  date: string;                 // Battle date (YYYY-MM-DD)
  habitName: string;            // The habit being competed on
  habitCategory: HabitCategory;
  targetValue: number;
  targetUnit: string;
  isReduceHabit: boolean;
  participants: BattleParticipant[];
  winnerId?: number;            // User ID of winner
  bonusPoints: number;          // Points awarded to winner
  status: 'active' | 'completed' | 'draw';
}

// Battle participant data
export interface BattleParticipant {
  userId: number;
  userName: string;
  userAvatar: string;
  value: number;                // Their achievement value
  completed: boolean;           // Did they complete the battle?
  pointsEarned: number;
}

// Comparison result between two users
export interface UserComparison {
  user1: UserComparisonData;
  user2: UserComparisonData;
  todayWinner: number | null;   // User ID or null for draw
  overallWinner: number | null;
  streakWinner: number | null;
}

export interface UserComparisonData {
  userId: number;
  userName: string;
  userAvatar: string;
  userColor: string;
  totalPoints: number;
  pointsToday: number;
  totalStreaks: number;
  longestStreak: number;
  habitsCompleted: number;
  habitsTotal: number;
  completionRate: number;       // Percentage
}

// Badge/Achievement model
export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
  type: BadgeType;
  requirement: number;  // e.g., 7 for "7-day streak"
}

export type BadgeType = 
  | 'streak'       // Streak milestones (3, 7, 14, 30, 60, 100 days)
  | 'points'       // Points milestones (100, 500, 1000 points)
  | 'habits'       // Number of habits (1, 3, 5 habits)
  | 'perfect-week' // Perfect week completion
  | 'early-bird'   // Completing habit before time window
  | 'comeback'     // Returning after missed days
  | 'challenger';  // Completing mini challenges

// Mini challenge model
export interface MiniChallenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  targetValue: number;
  currentValue: number;
  reward: number;        // Bonus points
  startDate: string;
  endDate: string;
  isCompleted: boolean;
  habitId?: number;      // Optional: specific habit
}

export type ChallengeType = 
  | 'streak'      // Maintain streak for X days
  | 'points'      // Earn X points
  | 'perfect-day' // Complete all habits in a day
  | 'early'       // Complete before time window
  | 'replacement'; // Do replacement action X times

// App state stored in localStorage
export interface AppState {
  habits: Habit[];
  userProfile: UserProfile;
  challenges: MiniChallenge[];
  settings: AppSettings;
}

// Multi-user app state
export interface MultiUserAppState {
  users: User[];
  currentUserId: number;        // Active user ID
  battles: HabitBattle[];       // All battles
  activeBattle?: HabitBattle;   // Today's battle
  settings: AppSettings;
}

// App settings
export interface AppSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  reminderTime: string;
}

