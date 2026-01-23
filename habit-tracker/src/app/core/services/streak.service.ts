/**
 * Streak Service - Handles streak tracking and management
 * 
 * Streak Rules:
 * - Streak increases when target is met AND replacement action is done
 * - Streak resets if target is missed (unless streak freeze is used)
 * - Streak freeze can be used once per week
 * - Best streak is tracked for each habit
 */

import { Injectable } from '@angular/core';
import { Habit, Badge, UserProfile } from '../models/habit.model';
import { StorageService } from './storage.service';
import { BADGE_DEFINITIONS } from '../models/constants';

@Injectable({
  providedIn: 'root'
})
export class StreakService {
  constructor(private storageService: StorageService) {}

  /**
   * Update streak for a habit after daily completion
   */
  updateStreak(habit: Habit, targetMet: boolean, replacementDone: boolean): Habit {
    const today = this.getTodayDate();

    if (targetMet && replacementDone) {
      // Increment streak
      habit.currentStreak += 1;

      // Update best streak if current exceeds it
      if (habit.currentStreak > habit.bestStreak) {
        habit.bestStreak = habit.currentStreak;
      }
    } else if (!this.isStreakFrozenToday(habit)) {
      // Reset streak if not frozen
      habit.currentStreak = 0;
    }

    return habit;
  }

  /**
   * Check if streak freeze was used today
   */
  isStreakFrozenToday(habit: Habit): boolean {
    const today = this.getTodayDate();
    const todayStatus = habit.dailyStatus.find(s => s.date === today);
    return todayStatus?.streakFrozen || false;
  }

  /**
   * Check if streak freeze is available (not used in last 7 days)
   */
  isStreakFreezeAvailable(habit: Habit): boolean {
    if (!habit.lastStreakFreezeDate) return true;

    const lastFreeze = new Date(habit.lastStreakFreezeDate);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - lastFreeze.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysDiff >= 7;
  }

  /**
   * Get days until streak freeze is available again
   */
  getDaysUntilFreezeAvailable(habit: Habit): number {
    if (!habit.lastStreakFreezeDate) return 0;

    const lastFreeze = new Date(habit.lastStreakFreezeDate);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - lastFreeze.getTime()) / (1000 * 60 * 60 * 24));
    
    return Math.max(0, 7 - daysDiff);
  }

  /**
   * Check all habits for streak resets (for missed days)
   * Should be called when app loads
   */
  checkMissedDays(habits: Habit[]): Habit[] {
    const yesterday = this.getYesterdayDate();

    return habits.map(habit => {
      // Check if yesterday was completed
      const yesterdayStatus = habit.dailyStatus.find(s => s.date === yesterday);
      
      // If yesterday wasn't completed or frozen, reset streak
      if (!yesterdayStatus?.done && !yesterdayStatus?.streakFrozen) {
        if (habit.currentStreak > 0) {
          habit.currentStreak = 0;
        }
      }

      return habit;
    });
  }

  /**
   * Check if habit earned any streak badges
   */
  checkStreakBadges(habit: Habit): Badge[] {
    const profile = this.storageService.getUserProfile();
    const newBadges: Badge[] = [];

    // Filter streak-type badges
    const streakBadges = BADGE_DEFINITIONS.filter(b => b.type === 'streak');

    streakBadges.forEach(badge => {
      // Check if streak meets requirement and user doesn't have this badge
      const hasBadge = profile.badges.some(b => b.id === badge.id);
      
      if (!hasBadge && habit.currentStreak >= badge.requirement) {
        const earnedBadge: Badge = {
          ...badge,
          earnedAt: new Date().toISOString()
        };
        profile.badges.push(earnedBadge);
        newBadges.push(earnedBadge);
      }
    });

    if (newBadges.length > 0) {
      this.storageService.updateUserProfile(profile);
      
      // Update user's longest streak
      if (habit.currentStreak > profile.longestStreak) {
        profile.longestStreak = habit.currentStreak;
        this.storageService.updateUserProfile(profile);
      }
    }

    return newBadges;
  }

  /**
   * Get the longest current streak across all habits
   */
  getLongestCurrentStreak(habits: Habit[]): number {
    if (habits.length === 0) return 0;
    return Math.max(...habits.map(h => h.currentStreak));
  }

  /**
   * Get the best streak ever across all habits
   */
  getBestStreakEver(habits: Habit[]): number {
    if (habits.length === 0) return 0;
    return Math.max(...habits.map(h => h.bestStreak));
  }

  /**
   * Get streak summary for dashboard
   */
  getStreakSummary(habits: Habit[]): {
    longestCurrent: number;
    bestEver: number;
    totalActiveStreaks: number;
    habitsWithStreaks: number;
  } {
    return {
      longestCurrent: this.getLongestCurrentStreak(habits),
      bestEver: this.getBestStreakEver(habits),
      totalActiveStreaks: habits.reduce((sum, h) => sum + h.currentStreak, 0),
      habitsWithStreaks: habits.filter(h => h.currentStreak > 0).length
    };
  }

  // ============ UTILITY METHODS ============

  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  private getYesterdayDate(): string {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split('T')[0];
  }
}

