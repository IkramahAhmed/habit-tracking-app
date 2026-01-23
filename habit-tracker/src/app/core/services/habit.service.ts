/**
 * Habit Service - Main service for habit CRUD operations
 * 
 * This service handles:
 * - Creating, reading, updating, deleting habits
 * - Getting today's status for habits
 * - Managing daily check-ins
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Habit, DailyStatus, Mood, HabitSuggestion, TargetOption } from '../models/habit.model';
import { StorageService } from './storage.service';
import { HABIT_SUGGESTIONS } from '../models/constants';

@Injectable({
  providedIn: 'root'
})
export class HabitService {
  /**
   * BehaviorSubject - A special type of Observable that:
   * - Holds the current value
   * - Emits the current value to new subscribers
   * - Can be updated with new values
   * 
   * Why use this?
   * - Components can subscribe and get automatic updates
   * - Multiple components stay in sync
   */
  private habitsSubject = new BehaviorSubject<Habit[]>([]);
  public habits$ = this.habitsSubject.asObservable();

  constructor(private storageService: StorageService) {
    // Load habits from storage when service initializes
    this.loadHabits();
  }

  /**
   * Load habits from storage and update the subject
   */
  private loadHabits(): void {
    const habits = this.storageService.getHabits();
    this.habitsSubject.next(habits);
  }

  /**
   * Get all habits (current value)
   */
  getHabits(): Habit[] {
    return this.habitsSubject.getValue();
  }

  /**
   * Get a single habit by ID
   */
  getHabitById(id: number): Habit | undefined {
    return this.getHabits().find(h => h.id === id);
  }

  /**
   * Get smart habit suggestions
   */
  getSuggestions(): HabitSuggestion[] {
    return HABIT_SUGGESTIONS;
  }

  /**
   * Create a new habit from a suggestion
   */
  createFromSuggestion(suggestion: HabitSuggestion, customTarget?: number): Habit {
    const newHabit: Habit = {
      id: this.storageService.generateId(),
      name: suggestion.name,
      description: suggestion.description,
      targetOptions: suggestion.targetOptions,
      targetValue: customTarget || suggestion.defaultTarget,
      targetUnit: suggestion.targetUnit,
      isReduceHabit: suggestion.isReduceHabit,
      replacement: suggestion.suggestedReplacements[0],
      currentStreak: 0,
      bestStreak: 0,
      totalPoints: 0,
      dailyStatus: [],
      createdAt: new Date().toISOString(),
      isActive: true,
      category: suggestion.category,
      icon: suggestion.icon
    };

    return this.addHabit(newHabit);
  }

  /**
   * Create a custom habit
   */
  createCustomHabit(
    name: string,
    targetOptions: TargetOption[],
    targetValue: number,
    targetUnit: string,
    isReduceHabit: boolean,
    replacement: string,
    category: string,
    icon: string,
    timeWindow?: { start: string; end: string }
  ): Habit {
    const newHabit: Habit = {
      id: this.storageService.generateId(),
      name,
      targetOptions,
      targetValue,
      targetUnit,
      isReduceHabit,
      replacement,
      timeWindow,
      currentStreak: 0,
      bestStreak: 0,
      totalPoints: 0,
      dailyStatus: [],
      createdAt: new Date().toISOString(),
      isActive: true,
      category: category as any,
      icon
    };

    return this.addHabit(newHabit);
  }

  /**
   * Add a new habit
   */
  addHabit(habit: Habit): Habit {
    const habits = [...this.getHabits(), habit];
    this.storageService.saveHabits(habits);
    this.habitsSubject.next(habits);
    return habit;
  }

  /**
   * Update an existing habit
   */
  updateHabit(updatedHabit: Habit): void {
    const habits = this.getHabits().map(h => 
      h.id === updatedHabit.id ? updatedHabit : h
    );
    this.storageService.saveHabits(habits);
    this.habitsSubject.next(habits);
  }

  /**
   * Delete a habit
   */
  deleteHabit(id: number): void {
    const habits = this.getHabits().filter(h => h.id !== id);
    this.storageService.saveHabits(habits);
    this.habitsSubject.next(habits);
  }

  /**
   * Get today's date in YYYY-MM-DD format
   */
  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Get today's status for a habit
   */
  getTodayStatus(habit: Habit): DailyStatus | undefined {
    const today = this.getTodayDate();
    return habit.dailyStatus.find(s => s.date === today);
  }

  /**
   * Check if habit is completed today
   */
  isCompletedToday(habit: Habit): boolean {
    const status = this.getTodayStatus(habit);
    return status?.done || false;
  }

  /**
   * Record daily progress for a habit
   * 
   * This is the main function for tracking daily habit completion
   */
  recordDailyProgress(
    habitId: number,
    value: number,
    mood: Mood,
    replacementDone: boolean
  ): { habit: Habit; pointsEarned: number; streakUpdated: boolean } {
    const habit = this.getHabitById(habitId);
    if (!habit) {
      throw new Error('Habit not found');
    }

    const today = this.getTodayDate();
    
    // Check if target is met
    // For reduce habits: success if value <= target
    // For increase habits: success if value >= target
    const targetMet = habit.isReduceHabit 
      ? value <= habit.targetValue 
      : value >= habit.targetValue;

    // Calculate points (basic calculation, will be enhanced by PointsService)
    let pointsEarned = 0;
    if (targetMet) {
      pointsEarned = 10; // Base points
      if (replacementDone) {
        pointsEarned += 5; // Bonus for replacement
      }
    }

    // Create or update today's status
    const existingIndex = habit.dailyStatus.findIndex(s => s.date === today);
    const newStatus: DailyStatus = {
      date: today,
      done: targetMet,
      value,
      mood,
      pointsEarned,
      replacementDone
    };

    if (existingIndex >= 0) {
      habit.dailyStatus[existingIndex] = newStatus;
    } else {
      habit.dailyStatus.push(newStatus);
    }

    // Update streak
    let streakUpdated = false;
    if (targetMet && replacementDone) {
      habit.currentStreak += 1;
      streakUpdated = true;
      
      // Update best streak if current exceeds it
      if (habit.currentStreak > habit.bestStreak) {
        habit.bestStreak = habit.currentStreak;
      }
    }

    // Update total points
    habit.totalPoints += pointsEarned;

    // Save the updated habit
    this.updateHabit(habit);

    return { habit, pointsEarned, streakUpdated };
  }

  /**
   * Use streak freeze (once per week protection)
   */
  useStreakFreeze(habitId: number): boolean {
    const habit = this.getHabitById(habitId);
    if (!habit) return false;

    const today = this.getTodayDate();
    const lastFreezeDate = habit.lastStreakFreezeDate;

    // Check if freeze was used in the last 7 days
    if (lastFreezeDate) {
      const lastFreeze = new Date(lastFreezeDate);
      const now = new Date(today);
      const daysDiff = Math.floor((now.getTime() - lastFreeze.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff < 7) {
        return false; // Freeze already used this week
      }
    }

    // Apply streak freeze
    habit.lastStreakFreezeDate = today;
    
    // Mark today as frozen (streak maintained but not increased)
    const todayStatus = this.getTodayStatus(habit);
    if (todayStatus) {
      todayStatus.streakFrozen = true;
    } else {
      habit.dailyStatus.push({
        date: today,
        done: false,
        value: 0,
        mood: 'Neutral',
        pointsEarned: 0,
        replacementDone: false,
        streakFrozen: true
      });
    }

    this.updateHabit(habit);
    return true;
  }

  /**
   * Check and reset streaks for missed days
   * Should be called when app loads
   */
  checkAndResetStreaks(): void {
    const habits = this.getHabits();
    const today = this.getTodayDate();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    habits.forEach(habit => {
      // Find yesterday's status
      const yesterdayStatus = habit.dailyStatus.find(s => s.date === yesterdayStr);
      
      // If yesterday wasn't completed and not frozen, reset streak
      if (!yesterdayStatus?.done && !yesterdayStatus?.streakFrozen) {
        if (habit.currentStreak > 0) {
          habit.currentStreak = 0;
          this.updateHabit(habit);
        }
      }
    });
  }

  /**
   * Get habits completed today
   */
  getCompletedTodayCount(): number {
    return this.getHabits().filter(h => this.isCompletedToday(h)).length;
  }

  /**
   * Get total points earned today
   */
  getPointsEarnedToday(): number {
    const today = this.getTodayDate();
    return this.getHabits().reduce((total, habit) => {
      const status = habit.dailyStatus.find(s => s.date === today);
      return total + (status?.pointsEarned || 0);
    }, 0);
  }

  /**
   * Get active habits count
   */
  getActiveHabitsCount(): number {
    return this.getHabits().filter(h => h.isActive).length;
  }
}

