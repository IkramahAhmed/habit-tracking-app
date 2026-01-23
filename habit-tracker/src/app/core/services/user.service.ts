/**
 * User Service - Multi-User Management
 * 
 * Handles:
 * - Multiple user accounts (stored in localStorage)
 * - Switching between users
 * - User creation and management
 * - Getting current user's data
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { 
  User, 
  UserProfile, 
  Habit, 
  MiniChallenge, 
  MultiUserAppState,
  HabitBattle,
  AppSettings 
} from '../models/habit.model';

// Default avatars for users
const DEFAULT_AVATARS = ['👤', '👨', '👩', '🧑', '👦', '👧', '🦸', '🧙', '🥷', '👻'];
const DEFAULT_COLORS = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#fee140', '#30cfd0', '#a8edea'];

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly STORAGE_KEY = 'habit-tracker-multi-user';
  
  // Observable for current user
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  // Observable for all users
  private usersSubject = new BehaviorSubject<User[]>([]);
  public users$ = this.usersSubject.asObservable();

  constructor() {
    this.initializeMultiUser();
  }

  /**
   * Initialize multi-user system
   * Creates default users if none exist
   */
  private initializeMultiUser(): void {
    const state = this.getState();
    
    if (!state || state.users.length === 0) {
      // Create two default users
      const defaultState = this.createDefaultState();
      this.saveState(defaultState);
      this.usersSubject.next(defaultState.users);
      this.currentUserSubject.next(defaultState.users[0]);
    } else {
      this.usersSubject.next(state.users);
      const currentUser = state.users.find(u => u.id === state.currentUserId) || state.users[0];
      this.currentUserSubject.next(currentUser);
    }
  }

  /**
   * Create default state with two users
   */
  private createDefaultState(): MultiUserAppState {
    const user1: User = {
      id: 1,
      profile: {
        id: 1,
        name: 'Player 1',
        avatar: '🦸',
        totalPoints: 0,
        totalHabits: 0,
        longestStreak: 0,
        badges: [],
        createdAt: new Date().toISOString(),
        color: '#667eea'
      },
      habits: [],
      challenges: []
    };

    const user2: User = {
      id: 2,
      profile: {
        id: 2,
        name: 'Player 2',
        avatar: '🧙',
        totalPoints: 0,
        totalHabits: 0,
        longestStreak: 0,
        badges: [],
        createdAt: new Date().toISOString(),
        color: '#f093fb'
      },
      habits: [],
      challenges: []
    };

    return {
      users: [user1, user2],
      currentUserId: 1,
      battles: [],
      settings: {
        theme: 'dark',
        notifications: true,
        reminderTime: '09:00'
      }
    };
  }

  // ============ STATE MANAGEMENT ============

  /**
   * Get full multi-user state from localStorage
   */
  getState(): MultiUserAppState | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        return JSON.parse(data) as MultiUserAppState;
      }
    } catch (error) {
      console.error('Error reading multi-user state:', error);
    }
    return null;
  }

  /**
   * Save full state to localStorage
   */
  saveState(state: MultiUserAppState): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving multi-user state:', error);
    }
  }

  // ============ USER MANAGEMENT ============

  /**
   * Get all users
   */
  getUsers(): User[] {
    return this.usersSubject.getValue();
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.currentUserSubject.getValue();
  }

  /**
   * Get user by ID
   */
  getUserById(userId: number): User | undefined {
    return this.getUsers().find(u => u.id === userId);
  }

  /**
   * Switch to a different user
   */
  switchUser(userId: number): void {
    const state = this.getState();
    if (!state) return;

    const user = state.users.find(u => u.id === userId);
    if (user) {
      state.currentUserId = userId;
      this.saveState(state);
      this.currentUserSubject.next(user);
    }
  }

  /**
   * Update user profile
   */
  updateUserProfile(userId: number, updates: Partial<UserProfile>): void {
    const state = this.getState();
    if (!state) return;

    const userIndex = state.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      state.users[userIndex].profile = {
        ...state.users[userIndex].profile,
        ...updates
      };
      this.saveState(state);
      this.usersSubject.next(state.users);
      
      if (userId === state.currentUserId) {
        this.currentUserSubject.next(state.users[userIndex]);
      }
    }
  }

  /**
   * Update user's name
   */
  updateUserName(userId: number, name: string): void {
    this.updateUserProfile(userId, { name });
  }

  /**
   * Update user's avatar
   */
  updateUserAvatar(userId: number, avatar: string): void {
    this.updateUserProfile(userId, { avatar });
  }

  /**
   * Add a new user
   */
  addUser(name: string, avatar?: string, color?: string): User {
    const state = this.getState() || this.createDefaultState();
    
    const newId = Math.max(...state.users.map(u => u.id), 0) + 1;
    const newUser: User = {
      id: newId,
      profile: {
        id: newId,
        name: name,
        avatar: avatar || DEFAULT_AVATARS[newId % DEFAULT_AVATARS.length],
        totalPoints: 0,
        totalHabits: 0,
        longestStreak: 0,
        badges: [],
        createdAt: new Date().toISOString(),
        color: color || DEFAULT_COLORS[newId % DEFAULT_COLORS.length]
      },
      habits: [],
      challenges: []
    };

    state.users.push(newUser);
    this.saveState(state);
    this.usersSubject.next(state.users);
    
    return newUser;
  }

  // ============ HABIT MANAGEMENT (for current user) ============

  /**
   * Get current user's habits
   */
  getCurrentUserHabits(): Habit[] {
    const user = this.getCurrentUser();
    return user?.habits || [];
  }

  /**
   * Add habit to current user
   */
  addHabitToCurrentUser(habit: Habit): void {
    const state = this.getState();
    if (!state) return;

    const userIndex = state.users.findIndex(u => u.id === state.currentUserId);
    if (userIndex !== -1) {
      state.users[userIndex].habits.push(habit);
      state.users[userIndex].profile.totalHabits++;
      this.saveState(state);
      this.usersSubject.next(state.users);
      this.currentUserSubject.next(state.users[userIndex]);
    }
  }

  /**
   * Update habit for current user
   */
  updateHabitForCurrentUser(habit: Habit): void {
    const state = this.getState();
    if (!state) return;

    const userIndex = state.users.findIndex(u => u.id === state.currentUserId);
    if (userIndex !== -1) {
      const habitIndex = state.users[userIndex].habits.findIndex(h => h.id === habit.id);
      if (habitIndex !== -1) {
        state.users[userIndex].habits[habitIndex] = habit;
        this.saveState(state);
        this.usersSubject.next(state.users);
        this.currentUserSubject.next(state.users[userIndex]);
      }
    }
  }

  /**
   * Delete habit from current user
   */
  deleteHabitFromCurrentUser(habitId: number): void {
    const state = this.getState();
    if (!state) return;

    const userIndex = state.users.findIndex(u => u.id === state.currentUserId);
    if (userIndex !== -1) {
      state.users[userIndex].habits = state.users[userIndex].habits.filter(h => h.id !== habitId);
      state.users[userIndex].profile.totalHabits--;
      this.saveState(state);
      this.usersSubject.next(state.users);
      this.currentUserSubject.next(state.users[userIndex]);
    }
  }

  /**
   * Add points to user
   */
  addPointsToUser(userId: number, points: number): void {
    const state = this.getState();
    if (!state) return;

    const userIndex = state.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      state.users[userIndex].profile.totalPoints += points;
      this.saveState(state);
      this.usersSubject.next(state.users);
      
      if (userId === state.currentUserId) {
        this.currentUserSubject.next(state.users[userIndex]);
      }
    }
  }

  /**
   * Update user's longest streak if needed
   */
  updateLongestStreak(userId: number, streak: number): void {
    const state = this.getState();
    if (!state) return;

    const userIndex = state.users.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
      if (streak > state.users[userIndex].profile.longestStreak) {
        state.users[userIndex].profile.longestStreak = streak;
        this.saveState(state);
        this.usersSubject.next(state.users);
      }
    }
  }

  // ============ BATTLE MANAGEMENT ============

  /**
   * Get all battles
   */
  getBattles(): HabitBattle[] {
    const state = this.getState();
    return state?.battles || [];
  }

  /**
   * Get today's active battle
   */
  getActiveBattle(): HabitBattle | undefined {
    const state = this.getState();
    return state?.activeBattle;
  }

  /**
   * Save battle
   */
  saveBattle(battle: HabitBattle): void {
    const state = this.getState();
    if (!state) return;

    if (battle.status === 'active') {
      state.activeBattle = battle;
    } else {
      // Move to completed battles
      state.battles.push(battle);
      state.activeBattle = undefined;
    }

    this.saveState(state);
  }

  /**
   * Get available avatars
   */
  getAvailableAvatars(): string[] {
    return DEFAULT_AVATARS;
  }

  /**
   * Get available colors
   */
  getAvailableColors(): string[] {
    return DEFAULT_COLORS;
  }
}

