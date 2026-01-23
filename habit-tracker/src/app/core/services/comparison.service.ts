/**
 * Comparison Service - User vs User Comparison & Battles
 * 
 * Handles:
 * - Comparing two users' stats
 * - Daily habit battles
 * - Determining winners
 * - Awarding bonus points
 */

import { Injectable } from '@angular/core';
import { 
  User, 
  UserComparison, 
  UserComparisonData,
  HabitBattle,
  BattleParticipant,
  Habit,
  HabitCategory
} from '../models/habit.model';
import { UserService } from './user.service';
import { HABIT_SUGGESTIONS } from '../models/constants';

// Battle configuration
const BATTLE_BONUS_POINTS = 25;

@Injectable({
  providedIn: 'root'
})
export class ComparisonService {

  constructor(private userService: UserService) {}

  // ============ USER COMPARISON ============

  /**
   * Compare two users and return detailed comparison
   */
  compareUsers(user1Id: number, user2Id: number): UserComparison | null {
    const user1 = this.userService.getUserById(user1Id);
    const user2 = this.userService.getUserById(user2Id);

    if (!user1 || !user2) return null;

    const user1Data = this.getUserComparisonData(user1);
    const user2Data = this.getUserComparisonData(user2);

    return {
      user1: user1Data,
      user2: user2Data,
      todayWinner: this.determineTodayWinner(user1Data, user2Data),
      overallWinner: this.determineOverallWinner(user1Data, user2Data),
      streakWinner: this.determineStreakWinner(user1Data, user2Data)
    };
  }

  /**
   * Get comparison data for a single user
   */
  private getUserComparisonData(user: User): UserComparisonData {
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate today's stats
    let pointsToday = 0;
    let habitsCompletedToday = 0;
    let totalStreaks = 0;
    
    user.habits.forEach(habit => {
      const todayStatus = habit.dailyStatus.find(s => s.date === today);
      if (todayStatus) {
        pointsToday += todayStatus.pointsEarned;
        if (todayStatus.done) {
          habitsCompletedToday++;
        }
      }
      totalStreaks += habit.currentStreak;
    });

    const habitsTotal = user.habits.length;
    const completionRate = habitsTotal > 0 
      ? Math.round((habitsCompletedToday / habitsTotal) * 100) 
      : 0;

    return {
      userId: user.id,
      userName: user.profile.name,
      userAvatar: user.profile.avatar,
      userColor: user.profile.color,
      totalPoints: user.profile.totalPoints,
      pointsToday,
      totalStreaks,
      longestStreak: user.profile.longestStreak,
      habitsCompleted: habitsCompletedToday,
      habitsTotal,
      completionRate
    };
  }

  /**
   * Determine who won today
   */
  private determineTodayWinner(user1: UserComparisonData, user2: UserComparisonData): number | null {
    if (user1.pointsToday > user2.pointsToday) return user1.userId;
    if (user2.pointsToday > user1.pointsToday) return user2.userId;
    
    // Tie-breaker: completion rate
    if (user1.completionRate > user2.completionRate) return user1.userId;
    if (user2.completionRate > user1.completionRate) return user2.userId;
    
    return null; // Draw
  }

  /**
   * Determine overall winner (total points)
   */
  private determineOverallWinner(user1: UserComparisonData, user2: UserComparisonData): number | null {
    if (user1.totalPoints > user2.totalPoints) return user1.userId;
    if (user2.totalPoints > user1.totalPoints) return user2.userId;
    return null;
  }

  /**
   * Determine streak winner
   */
  private determineStreakWinner(user1: UserComparisonData, user2: UserComparisonData): number | null {
    if (user1.longestStreak > user2.longestStreak) return user1.userId;
    if (user2.longestStreak > user1.longestStreak) return user2.userId;
    return null;
  }

  /**
   * Get habit-by-habit comparison between two users
   */
  getHabitComparison(user1Id: number, user2Id: number): HabitComparisonItem[] {
    const user1 = this.userService.getUserById(user1Id);
    const user2 = this.userService.getUserById(user2Id);

    if (!user1 || !user2) return [];

    const today = new Date().toISOString().split('T')[0];
    const comparisons: HabitComparisonItem[] = [];

    // Get all unique habit names from both users
    const allHabitNames = new Set([
      ...user1.habits.map(h => h.name),
      ...user2.habits.map(h => h.name)
    ]);

    allHabitNames.forEach(habitName => {
      const h1 = user1.habits.find(h => h.name === habitName);
      const h2 = user2.habits.find(h => h.name === habitName);

      const status1 = h1?.dailyStatus.find(s => s.date === today);
      const status2 = h2?.dailyStatus.find(s => s.date === today);

      comparisons.push({
        habitName,
        icon: h1?.icon || h2?.icon || '🎯',
        user1: {
          hasHabit: !!h1,
          streak: h1?.currentStreak || 0,
          points: h1?.totalPoints || 0,
          completedToday: status1?.done || false,
          todayValue: status1?.value || 0
        },
        user2: {
          hasHabit: !!h2,
          streak: h2?.currentStreak || 0,
          points: h2?.totalPoints || 0,
          completedToday: status2?.done || false,
          todayValue: status2?.value || 0
        },
        winner: this.getHabitWinner(h1, h2, status1, status2)
      });
    });

    return comparisons;
  }

  /**
   * Determine winner for a specific habit
   */
  private getHabitWinner(
    h1: Habit | undefined, 
    h2: Habit | undefined,
    status1: any,
    status2: any
  ): number | null {
    if (!h1 && !h2) return null;
    if (!h1) return 2;
    if (!h2) return 1;

    // Compare based on today's completion
    const completed1 = status1?.done || false;
    const completed2 = status2?.done || false;

    if (completed1 && !completed2) return 1;
    if (completed2 && !completed1) return 2;

    // Both completed or both not - compare streaks
    if (h1.currentStreak > h2.currentStreak) return 1;
    if (h2.currentStreak > h1.currentStreak) return 2;

    return null; // Draw
  }

  // ============ HABIT BATTLES ============

  /**
   * Create a new daily battle
   */
  createBattle(user1Id: number, user2Id: number, habitName?: string): HabitBattle | null {
    const user1 = this.userService.getUserById(user1Id);
    const user2 = this.userService.getUserById(user2Id);

    if (!user1 || !user2) return null;

    const today = new Date().toISOString().split('T')[0];

    // Choose a random habit if not specified
    const battleHabit = habitName 
      ? HABIT_SUGGESTIONS.find(s => s.name === habitName) || this.getRandomBattleHabit()
      : this.getRandomBattleHabit();

    const battle: HabitBattle = {
      id: `battle-${Date.now()}`,
      date: today,
      habitName: battleHabit.name,
      habitCategory: battleHabit.category,
      targetValue: battleHabit.defaultTarget,
      targetUnit: battleHabit.targetUnit,
      isReduceHabit: battleHabit.isReduceHabit,
      participants: [
        {
          userId: user1.id,
          userName: user1.profile.name,
          userAvatar: user1.profile.avatar,
          value: 0,
          completed: false,
          pointsEarned: 0
        },
        {
          userId: user2.id,
          userName: user2.profile.name,
          userAvatar: user2.profile.avatar,
          value: 0,
          completed: false,
          pointsEarned: 0
        }
      ],
      bonusPoints: BATTLE_BONUS_POINTS,
      status: 'active'
    };

    this.userService.saveBattle(battle);
    return battle;
  }

  /**
   * Get a random habit for battle
   */
  private getRandomBattleHabit() {
    const battleFriendlyHabits = HABIT_SUGGESTIONS.filter(h => 
      !h.isReduceHabit || h.name === 'Reduce Screen Time'
    );
    return battleFriendlyHabits[Math.floor(Math.random() * battleFriendlyHabits.length)];
  }

  /**
   * Update battle progress for a user
   */
  updateBattleProgress(battleId: string, userId: number, value: number): HabitBattle | null {
    const battle = this.userService.getActiveBattle();
    if (!battle || battle.id !== battleId) return null;

    const participant = battle.participants.find(p => p.userId === userId);
    if (!participant) return null;

    participant.value = value;
    
    // Check if target is met
    if (battle.isReduceHabit) {
      participant.completed = value <= battle.targetValue;
    } else {
      participant.completed = value >= battle.targetValue;
    }

    // Check if battle should be completed
    const allCompleted = battle.participants.every(p => p.completed);
    const isEndOfDay = new Date().getHours() >= 22; // End battle at 10 PM

    if (allCompleted || isEndOfDay) {
      this.completeBattle(battle);
    } else {
      this.userService.saveBattle(battle);
    }

    return battle;
  }

  /**
   * Complete a battle and determine winner
   */
  completeBattle(battle: HabitBattle): void {
    const p1 = battle.participants[0];
    const p2 = battle.participants[1];

    // Determine winner
    let winnerId: number | undefined;

    if (p1.completed && !p2.completed) {
      winnerId = p1.userId;
    } else if (p2.completed && !p1.completed) {
      winnerId = p2.userId;
    } else if (p1.completed && p2.completed) {
      // Both completed - winner is who did better
      if (battle.isReduceHabit) {
        // Lower is better for reduce habits
        if (p1.value < p2.value) winnerId = p1.userId;
        else if (p2.value < p1.value) winnerId = p2.userId;
      } else {
        // Higher is better for build habits
        if (p1.value > p2.value) winnerId = p1.userId;
        else if (p2.value < p1.value) winnerId = p2.userId;
      }
    }

    battle.winnerId = winnerId;
    battle.status = winnerId ? 'completed' : 'draw';

    // Award bonus points to winner
    if (winnerId) {
      const winner = battle.participants.find(p => p.userId === winnerId);
      if (winner) {
        winner.pointsEarned = battle.bonusPoints;
        this.userService.addPointsToUser(winnerId, battle.bonusPoints);
      }
    }

    this.userService.saveBattle(battle);
  }

  /**
   * Get today's battle (or null if none)
   */
  getTodaysBattle(): HabitBattle | null {
    const battle = this.userService.getActiveBattle();
    if (!battle) return null;

    const today = new Date().toISOString().split('T')[0];
    if (battle.date !== today) {
      // Battle is from a previous day - complete it
      this.completeBattle(battle);
      return null;
    }

    return battle;
  }

  /**
   * Get battle history
   */
  getBattleHistory(): HabitBattle[] {
    return this.userService.getBattles();
  }

  /**
   * Get user's battle win/loss record
   */
  getUserBattleRecord(userId: number): { wins: number; losses: number; draws: number } {
    const battles = this.getBattleHistory();
    let wins = 0;
    let losses = 0;
    let draws = 0;

    battles.forEach(battle => {
      if (battle.status === 'draw') {
        draws++;
      } else if (battle.winnerId === userId) {
        wins++;
      } else if (battle.participants.some(p => p.userId === userId)) {
        losses++;
      }
    });

    return { wins, losses, draws };
  }
}

// Interface for habit comparison items
export interface HabitComparisonItem {
  habitName: string;
  icon: string;
  user1: {
    hasHabit: boolean;
    streak: number;
    points: number;
    completedToday: boolean;
    todayValue: number;
  };
  user2: {
    hasHabit: boolean;
    streak: number;
    points: number;
    completedToday: boolean;
    todayValue: number;
  };
  winner: number | null; // 1, 2, or null for draw
}

