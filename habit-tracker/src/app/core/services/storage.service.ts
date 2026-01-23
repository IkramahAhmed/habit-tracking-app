/**
 * Storage Service - Handles all localStorage operations
 * 
 * Why a separate service for storage?
 * - Centralizes all storage logic in one place
 * - Easy to switch to a different storage method later (e.g., IndexedDB)
 * - Provides type safety when saving/loading data
 * - Handles errors gracefully
 */

import { Injectable } from '@angular/core';
import { AppState, Habit, UserProfile, MiniChallenge, AppSettings } from '../models/habit.model';

@Injectable({
  providedIn: 'root'  // This makes the service available everywhere (singleton)
})
export class StorageService {
  // Key used to store data in localStorage
  private readonly STORAGE_KEY = 'habit-tracker-data';

  constructor() {
    // Initialize storage if it doesn't exist
    this.initializeStorage();
  }

  /**
   * Initialize storage with default values if empty
   * This runs when the app first loads
   */
  private initializeStorage(): void {
    const existingData = localStorage.getItem(this.STORAGE_KEY);
    
    if (!existingData) {
      const defaultState: AppState = {
        habits: [],
        userProfile: this.createDefaultProfile(),
        challenges: [],
        settings: {
          theme: 'dark',
          notifications: true,
          reminderTime: '09:00'
        }
      };
      
      this.saveState(defaultState);
    }
  }

  /**
   * Create a default user profile
   */
  private createDefaultProfile(): UserProfile {
    return {
      id: 1,
      name: 'User',
      avatar: '👤',
      totalPoints: 0,
      totalHabits: 0,
      longestStreak: 0,
      badges: [],
      createdAt: new Date().toISOString(),
      color: '#667eea'
    };
  }

  /**
   * Get the entire app state from localStorage
   * 
   * Why use try-catch?
   * - localStorage might contain corrupted data
   * - JSON.parse can throw errors
   * - Better to return default state than crash the app
   */
  getState(): AppState {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        return JSON.parse(data) as AppState;
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
    
    // Return default state if something goes wrong
    return {
      habits: [],
      userProfile: this.createDefaultProfile(),
      challenges: [],
      settings: {
        theme: 'dark',
        notifications: true,
        reminderTime: '09:00'
      }
    };
  }

  /**
   * Save the entire app state to localStorage
   */
  saveState(state: AppState): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }

  // ============ HABITS ============

  /**
   * Get all habits
   */
  getHabits(): Habit[] {
    return this.getState().habits;
  }

  /**
   * Save all habits (replaces existing)
   */
  saveHabits(habits: Habit[]): void {
    const state = this.getState();
    state.habits = habits;
    this.saveState(state);
  }

  /**
   * Get a single habit by ID
   */
  getHabitById(id: number): Habit | undefined {
    return this.getHabits().find(h => h.id === id);
  }

  /**
   * Add a new habit
   */
  addHabit(habit: Habit): void {
    const habits = this.getHabits();
    habits.push(habit);
    this.saveHabits(habits);
  }

  /**
   * Update an existing habit
   */
  updateHabit(updatedHabit: Habit): void {
    const habits = this.getHabits();
    const index = habits.findIndex(h => h.id === updatedHabit.id);
    
    if (index !== -1) {
      habits[index] = updatedHabit;
      this.saveHabits(habits);
    }
  }

  /**
   * Delete a habit by ID
   */
  deleteHabit(id: number): void {
    const habits = this.getHabits().filter(h => h.id !== id);
    this.saveHabits(habits);
  }

  // ============ USER PROFILE ============

  /**
   * Get user profile
   */
  getUserProfile(): UserProfile {
    return this.getState().userProfile;
  }

  /**
   * Update user profile
   */
  updateUserProfile(profile: UserProfile): void {
    const state = this.getState();
    state.userProfile = profile;
    this.saveState(state);
  }

  // ============ CHALLENGES ============

  /**
   * Get all challenges
   */
  getChallenges(): MiniChallenge[] {
    return this.getState().challenges;
  }

  /**
   * Save challenges
   */
  saveChallenges(challenges: MiniChallenge[]): void {
    const state = this.getState();
    state.challenges = challenges;
    this.saveState(state);
  }

  // ============ SETTINGS ============

  /**
   * Get app settings
   */
  getSettings(): AppSettings {
    return this.getState().settings;
  }

  /**
   * Update settings
   */
  updateSettings(settings: AppSettings): void {
    const state = this.getState();
    state.settings = settings;
    this.saveState(state);
  }

  // ============ UTILITIES ============

  /**
   * Clear all data (for testing or reset)
   */
  clearAll(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.initializeStorage();
  }

  /**
   * Generate a unique ID for new habits
   * 
   * Why this approach?
   * - Simple and works for local storage
   * - Uses timestamp + random number to avoid collisions
   */
  generateId(): number {
    return Date.now() + Math.floor(Math.random() * 1000);
  }
}

