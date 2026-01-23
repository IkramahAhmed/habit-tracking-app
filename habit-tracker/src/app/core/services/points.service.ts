/**
 * Points Service - Handles all points calculation and tracking
 * 
 * Points System:
 * - Base points for completing target: 10
 * - Replacement action bonus: 5
 * - Streak multiplier: 0.5 per day
 * - Mood bonus: 2-3 extra points
 * - Early completion bonus: 5
 * - Perfect day bonus: 20
 */

import { Injectable } from '@angular/core';
import { Habit, Mood, UserProfile, Badge } from '../models/habit.model';
import { StorageService } from './storage.service';
import { POINTS_CONFIG, BADGE_DEFINITIONS } from '../models/constants';

@Injectable({
  providedIn: 'root'
})
export class PointsService {
  constructor(private storageService: StorageService) {}

  /**
   * Calculate points for a habit completion
   */
  calculatePoints(
    habit: Habit,
    targetMet: boolean,
    replacementDone: boolean,
    mood: Mood,
    isEarlyCompletion: boolean = false
  ): number {
    if (!targetMet) return 0;

    let points = POINTS_CONFIG.baseComplete;

    // Replacement bonus
    if (replacementDone) {
      points += POINTS_CONFIG.replacementBonus;
    }

    // Streak multiplier (more points for longer streaks)
    const streakBonus = Math.floor(habit.currentStreak * POINTS_CONFIG.streakMultiplier);
    points += streakBonus;

    // Mood bonus (extra points for pushing through on hard days)
    points += POINTS_CONFIG.moodBonus[mood];

    // Early completion bonus
    if (isEarlyCompletion) {
      points += POINTS_CONFIG.earlyBonus;
    }

    return points;
  }

  /**
   * Calculate perfect day bonus
   * Called when all habits are completed for the day
   */
  calculatePerfectDayBonus(): number {
    return POINTS_CONFIG.perfectDayBonus;
  }

  /**
   * Add points to user profile
   */
  addPointsToProfile(points: number): UserProfile {
    const profile = this.storageService.getUserProfile();
    profile.totalPoints += points;
    this.storageService.updateUserProfile(profile);
    return profile;
  }

  /**
   * Get user's total points
   */
  getTotalPoints(): number {
    return this.storageService.getUserProfile().totalPoints;
  }

  /**
   * Check if user earned any new badges based on points
   */
  checkPointsBadges(): Badge[] {
    const profile = this.storageService.getUserProfile();
    const newBadges: Badge[] = [];

    // Filter point-type badges
    const pointBadges = BADGE_DEFINITIONS.filter(b => b.type === 'points');

    pointBadges.forEach(badge => {
      // Check if user has enough points and doesn't have this badge yet
      const hasBadge = profile.badges.some(b => b.id === badge.id);
      
      if (!hasBadge && profile.totalPoints >= badge.requirement) {
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
    }

    return newBadges;
  }

  /**
   * Get leaderboard data
   * For local app, we'll show habits ranked by points
   */
  getHabitLeaderboard(habits: Habit[]): { habit: Habit; rank: number }[] {
    const sorted = [...habits].sort((a, b) => b.totalPoints - a.totalPoints);
    return sorted.map((habit, index) => ({
      habit,
      rank: index + 1
    }));
  }

  /**
   * Get points earned today across all habits
   */
  getPointsToday(habits: Habit[]): number {
    const today = new Date().toISOString().split('T')[0];
    return habits.reduce((total, habit) => {
      const todayStatus = habit.dailyStatus.find(s => s.date === today);
      return total + (todayStatus?.pointsEarned || 0);
    }, 0);
  }

  /**
   * Get points earned this week
   */
  getPointsThisWeek(habits: Habit[]): number {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    return habits.reduce((total, habit) => {
      const weekPoints = habit.dailyStatus
        .filter(s => new Date(s.date) >= weekAgo)
        .reduce((sum, s) => sum + s.pointsEarned, 0);
      return total + weekPoints;
    }, 0);
  }
}

