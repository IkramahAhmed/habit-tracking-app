/**
 * Leaderboard Component
 * 
 * Shows:
 * - Habit rankings by points
 * - User badges collection
 * - Weekly/All-time stats
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HabitService } from '../../core/services/habit.service';
import { PointsService } from '../../core/services/points.service';
import { StreakService } from '../../core/services/streak.service';
import { StorageService } from '../../core/services/storage.service';
import { Habit, Badge, UserProfile } from '../../core/models/habit.model';
import { BADGE_DEFINITIONS } from '../../core/models/constants';
import { BadgeComponent } from '../../shared/components/badge/badge.component';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
  template: `
    <div class="leaderboard-page">
      <header class="page-header">
        <button class="back-btn" (click)="goBack()">← Back</button>
        <h1>Leaderboard</h1>
        <div class="spacer"></div>
      </header>

      <!-- User Stats Summary -->
      <div class="user-stats">
        <div class="stat-card main">
          <span class="stat-icon">⭐</span>
          <div class="stat-info">
            <span class="stat-value">{{ userProfile.totalPoints }}</span>
            <span class="stat-label">Total Points</span>
          </div>
        </div>
        <div class="stat-row">
          <div class="stat-card small">
            <span class="stat-value">{{ pointsThisWeek }}</span>
            <span class="stat-label">This Week</span>
          </div>
          <div class="stat-card small">
            <span class="stat-value">{{ userProfile.longestStreak }}</span>
            <span class="stat-label">Best Streak</span>
          </div>
          <div class="stat-card small">
            <span class="stat-value">{{ earnedBadges.length }}</span>
            <span class="stat-label">Badges</span>
          </div>
        </div>
      </div>

      <!-- Tab Navigation -->
      <div class="tabs">
        <button 
          class="tab" 
          [class.active]="activeTab === 'rankings'"
          (click)="activeTab = 'rankings'"
        >
          🏅 Rankings
        </button>
        <button 
          class="tab" 
          [class.active]="activeTab === 'badges'"
          (click)="activeTab = 'badges'"
        >
          🏆 Badges
        </button>
      </div>

      <!-- Rankings Tab -->
      <div class="tab-content" *ngIf="activeTab === 'rankings'">
        <div class="section-header">
          <h2>Habit Rankings</h2>
          <span class="hint">Ranked by total points</span>
        </div>

        <div class="rankings-list" *ngIf="habitRankings.length > 0">
          <div 
            class="ranking-item"
            *ngFor="let item of habitRankings; let i = index"
            [class.top-3]="i < 3"
          >
            <div class="rank">
              <span *ngIf="i === 0" class="medal">🥇</span>
              <span *ngIf="i === 1" class="medal">🥈</span>
              <span *ngIf="i === 2" class="medal">🥉</span>
              <span *ngIf="i >= 3" class="rank-number">{{ i + 1 }}</span>
            </div>
            
            <div class="habit-info">
              <span class="habit-icon">{{ item.habit.icon }}</span>
              <div class="habit-details">
                <span class="habit-name">{{ item.habit.name }}</span>
                <span class="habit-streak" *ngIf="item.habit.currentStreak > 0">
                  🔥 {{ item.habit.currentStreak }} day streak
                </span>
              </div>
            </div>
            
            <div class="points">
              <span class="points-value">{{ item.habit.totalPoints }}</span>
              <span class="points-label">pts</span>
            </div>
          </div>
        </div>

        <div class="empty-state" *ngIf="habitRankings.length === 0">
          <span class="empty-icon">🎯</span>
          <p>No habits yet! Create habits to start earning points.</p>
        </div>
      </div>

      <!-- Badges Tab -->
      <div class="tab-content" *ngIf="activeTab === 'badges'">
        <div class="section-header">
          <h2>Your Badges</h2>
          <span class="hint">{{ earnedBadges.length }} / {{ allBadges.length }} earned</span>
        </div>

        <div class="badge-categories">
          <!-- Streak Badges -->
          <div class="badge-category">
            <h3>🔥 Streak Badges</h3>
            <div class="badges-grid">
              <app-badge 
                *ngFor="let badge of getBadgesByType('streak')"
                [badge]="badge"
                [showLabel]="true"
                size="medium"
              ></app-badge>
            </div>
          </div>

          <!-- Points Badges -->
          <div class="badge-category">
            <h3>⭐ Points Badges</h3>
            <div class="badges-grid">
              <app-badge 
                *ngFor="let badge of getBadgesByType('points')"
                [badge]="badge"
                [showLabel]="true"
                size="medium"
              ></app-badge>
            </div>
          </div>

          <!-- Habit Badges -->
          <div class="badge-category">
            <h3>🎯 Habit Badges</h3>
            <div class="badges-grid">
              <app-badge 
                *ngFor="let badge of getBadgesByType('habits')"
                [badge]="badge"
                [showLabel]="true"
                size="medium"
              ></app-badge>
            </div>
          </div>

          <!-- Special Badges -->
          <div class="badge-category">
            <h3>✨ Special Badges</h3>
            <div class="badges-grid">
              <app-badge 
                *ngFor="let badge of getSpecialBadges()"
                [badge]="badge"
                [showLabel]="true"
                size="medium"
              ></app-badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .leaderboard-page {
      padding: 1.5rem;
      max-width: 600px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .page-header h1 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary, #fff);
      margin: 0;
    }

    .back-btn {
      background: none;
      border: none;
      color: var(--accent-color, #667eea);
      font-size: 1rem;
      cursor: pointer;
    }

    .spacer {
      width: 60px;
    }

    .user-stats {
      margin-bottom: 1.5rem;
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      background: var(--card-bg, #1a1a2e);
      border-radius: 16px;
      border: 1px solid var(--border-color, #333);
    }

    .stat-card.main {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      margin-bottom: 1rem;
    }

    .stat-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
    }

    .stat-card.small {
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      padding: 1rem;
    }

    .stat-icon {
      font-size: 2rem;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #fff;
    }

    .stat-card.small .stat-value {
      font-size: 1.25rem;
      color: var(--text-primary, #fff);
    }

    .stat-label {
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.8);
    }

    .stat-card.small .stat-label {
      color: var(--text-secondary, #a0a0a0);
    }

    .tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }

    .tab {
      flex: 1;
      padding: 0.875rem;
      background: var(--card-bg, #1a1a2e);
      border: 1px solid var(--border-color, #333);
      border-radius: 12px;
      color: var(--text-secondary, #a0a0a0);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .tab.active {
      background: var(--accent-color, #667eea);
      border-color: var(--accent-color, #667eea);
      color: #fff;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .section-header h2 {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary, #fff);
      margin: 0;
    }

    .hint {
      font-size: 0.8rem;
      color: var(--text-secondary, #a0a0a0);
    }

    .rankings-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .ranking-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: var(--card-bg, #1a1a2e);
      border-radius: 12px;
      border: 1px solid var(--border-color, #333);
    }

    .ranking-item.top-3 {
      background: linear-gradient(135deg, #1a1a2e 0%, #2a1a3e 100%);
    }

    .rank {
      width: 40px;
      text-align: center;
    }

    .medal {
      font-size: 1.5rem;
    }

    .rank-number {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-secondary, #a0a0a0);
    }

    .habit-info {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .habit-icon {
      font-size: 1.5rem;
    }

    .habit-details {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .habit-name {
      font-weight: 600;
      color: var(--text-primary, #fff);
    }

    .habit-streak {
      font-size: 0.75rem;
      color: #FF9800;
    }

    .points {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .points-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--accent-color, #667eea);
    }

    .points-label {
      font-size: 0.7rem;
      color: var(--text-secondary, #a0a0a0);
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      color: var(--text-secondary, #a0a0a0);
    }

    .empty-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 1rem;
    }

    .badge-categories {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .badge-category h3 {
      font-size: 0.95rem;
      color: var(--text-primary, #fff);
      margin: 0 0 0.75rem 0;
    }

    .badges-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.75rem;
    }

    @media (min-width: 500px) {
      .badges-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  `]
})
export class LeaderboardComponent implements OnInit {
  activeTab: 'rankings' | 'badges' = 'rankings';
  
  habits: Habit[] = [];
  habitRankings: { habit: Habit; rank: number }[] = [];
  userProfile!: UserProfile;
  pointsThisWeek = 0;
  
  allBadges: Badge[] = BADGE_DEFINITIONS;
  earnedBadges: Badge[] = [];

  constructor(
    private router: Router,
    private habitService: HabitService,
    private pointsService: PointsService,
    private streakService: StreakService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.habits = this.habitService.getHabits();
    this.habitRankings = this.pointsService.getHabitLeaderboard(this.habits);
    this.userProfile = this.storageService.getUserProfile();
    this.pointsThisWeek = this.pointsService.getPointsThisWeek(this.habits);
    this.earnedBadges = this.userProfile.badges;
  }

  getBadgesByType(type: string): Badge[] {
    return this.allBadges
      .filter(b => b.type === type)
      .map(badge => {
        const earned = this.earnedBadges.find(e => e.id === badge.id);
        return earned ? { ...badge, earnedAt: earned.earnedAt } : badge;
      });
  }

  getSpecialBadges(): Badge[] {
    const specialTypes = ['perfect-week', 'early-bird', 'comeback', 'challenger'];
    return this.allBadges
      .filter(b => specialTypes.includes(b.type))
      .map(badge => {
        const earned = this.earnedBadges.find(e => e.id === badge.id);
        return earned ? { ...badge, earnedAt: earned.earnedAt } : badge;
      });
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}

