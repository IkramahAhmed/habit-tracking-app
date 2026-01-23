/**
 * Challenge Service - Manages mini challenges for gamification
 * 
 * Challenges add extra motivation by giving users:
 * - Short-term goals
 * - Bonus points
 * - Special badges
 */

import { Injectable } from '@angular/core';
import { MiniChallenge, Habit, Badge } from '../models/habit.model';
import { StorageService } from './storage.service';
import { DEFAULT_CHALLENGES, BADGE_DEFINITIONS } from '../models/constants';

@Injectable({
  providedIn: 'root'
})
export class ChallengeService {
  constructor(private storageService: StorageService) {
    // Initialize challenges on first load
    this.initializeChallenges();
  }

  /**
   * Initialize weekly challenges if none exist
   */
  private initializeChallenges(): void {
    const challenges = this.storageService.getChallenges();
    
    if (challenges.length === 0) {
      this.generateWeeklyChallenges();
    } else {
      // Check if challenges need to be refreshed (weekly)
      this.refreshChallengesIfNeeded(challenges);
    }
  }

  /**
   * Generate new weekly challenges
   */
  generateWeeklyChallenges(): MiniChallenge[] {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 7);

    // Select 3 random challenges from defaults
    const shuffled = [...DEFAULT_CHALLENGES].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 3);

    const challenges: MiniChallenge[] = selected.map((challenge, index) => ({
      id: `challenge-${Date.now()}-${index}`,
      ...challenge,
      startDate: today.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      currentValue: 0,
      isCompleted: false
    }));

    this.storageService.saveChallenges(challenges);
    return challenges;
  }

  /**
   * Refresh challenges if the week has passed
   */
  private refreshChallengesIfNeeded(challenges: MiniChallenge[]): void {
    if (challenges.length === 0) return;

    const today = new Date();
    const endDate = new Date(challenges[0].endDate);

    if (today > endDate) {
      this.generateWeeklyChallenges();
    }
  }

  /**
   * Get active challenges
   */
  getActiveChallenges(): MiniChallenge[] {
    return this.storageService.getChallenges().filter(c => !c.isCompleted);
  }

  /**
   * Get all challenges (including completed)
   */
  getAllChallenges(): MiniChallenge[] {
    return this.storageService.getChallenges();
  }

  /**
   * Update challenge progress based on user action
   */
  updateChallengeProgress(
    type: 'streak' | 'points' | 'perfect-day' | 'early' | 'replacement',
    value: number = 1,
    habits?: Habit[]
  ): MiniChallenge[] {
    const challenges = this.storageService.getChallenges();
    const completedChallenges: MiniChallenge[] = [];

    challenges.forEach(challenge => {
      if (challenge.isCompleted) return;

      // Update progress based on challenge type
      if (challenge.type === type) {
        challenge.currentValue += value;

        // Check if challenge is completed
        if (challenge.currentValue >= challenge.targetValue) {
          challenge.isCompleted = true;
          completedChallenges.push(challenge);
        }
      }

      // Special handling for perfect-day challenge
      if (challenge.type === 'perfect-day' && habits) {
        const today = new Date().toISOString().split('T')[0];
        const allCompleted = habits.every(h => {
          const todayStatus = h.dailyStatus.find(s => s.date === today);
          return todayStatus?.done;
        });

        if (allCompleted && habits.length > 0) {
          challenge.currentValue = 1;
          if (!challenge.isCompleted) {
            challenge.isCompleted = true;
            completedChallenges.push(challenge);
          }
        }
      }
    });

    this.storageService.saveChallenges(challenges);
    return completedChallenges;
  }

  /**
   * Get total reward points from completed challenges
   */
  getCompletedChallengeRewards(): number {
    return this.storageService.getChallenges()
      .filter(c => c.isCompleted)
      .reduce((sum, c) => sum + c.reward, 0);
  }

  /**
   * Check and award challenger badge
   */
  checkChallengerBadge(): Badge | null {
    const profile = this.storageService.getUserProfile();
    const completedCount = this.storageService.getChallenges()
      .filter(c => c.isCompleted).length;

    if (completedCount > 0) {
      const challengerBadge = BADGE_DEFINITIONS.find(b => b.id === 'challenger');
      const hasBadge = profile.badges.some(b => b.id === 'challenger');

      if (challengerBadge && !hasBadge) {
        const earnedBadge: Badge = {
          ...challengerBadge,
          earnedAt: new Date().toISOString()
        };
        profile.badges.push(earnedBadge);
        this.storageService.updateUserProfile(profile);
        return earnedBadge;
      }
    }

    return null;
  }

  /**
   * Get challenge progress percentage
   */
  getChallengeProgress(challenge: MiniChallenge): number {
    return Math.min(100, (challenge.currentValue / challenge.targetValue) * 100);
  }

  /**
   * Get days remaining for challenges
   */
  getDaysRemaining(): number {
    const challenges = this.storageService.getChallenges();
    if (challenges.length === 0) return 0;

    const endDate = new Date(challenges[0].endDate);
    const today = new Date();
    const diff = endDate.getTime() - today.getTime();
    
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
}

