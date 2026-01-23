/**
 * Dashboard Component
 * 
 * The main view showing:
 * - Daily motivation quote
 * - Stats overview (habits, streaks, points)
 * - Habit cards with quick actions
 * - Active challenges
 * - Coach tips
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HabitService } from '../../core/services/habit.service';
import { StreakService } from '../../core/services/streak.service';
import { PointsService } from '../../core/services/points.service';
import { CoachService } from '../../core/services/coach.service';
import { ChallengeService } from '../../core/services/challenge.service';
import { StorageService } from '../../core/services/storage.service';
import { Habit, DailyStatus, MiniChallenge, Badge } from '../../core/models/habit.model';
import { HabitCardComponent } from '../../shared/components/habit-card/habit-card.component';
import { CoachTipComponent } from '../../shared/components/coach-tip/coach-tip.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { CoachAdviceComponent } from '../../shared/components/coach-advice/coach-advice.component';
import { MoodSelectorComponent } from '../../shared/components/mood-selector/mood-selector.component';
import { Mood } from '../../core/models/habit.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HabitCardComponent, CoachTipComponent, BadgeComponent, CoachAdviceComponent, MoodSelectorComponent],
  template: `
    <div class="dashboard">
      <!-- Header -->
      <header class="dashboard-header">
        <div class="greeting">
          <h1>Good {{ getTimeOfDay() }}! 👋</h1>
          <p class="date">{{ today | date:'EEEE, MMMM d, y' }}</p>
        </div>
        <button class="add-btn" (click)="goToAddHabit()">
          <span>+</span> Add Habit
        </button>
      </header>

      <!-- Daily Quote -->
      <div class="motivation-card">
        <span class="quote-icon">💬</span>
        <p class="quote">{{ dailyQuote }}</p>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-icon">📊</span>
          <div class="stat-info">
            <span class="stat-value">{{ habits.length }}</span>
            <span class="stat-label">Total Habits</span>
          </div>
        </div>
        
        <div class="stat-card">
          <span class="stat-icon">✅</span>
          <div class="stat-info">
            <span class="stat-value">{{ completedToday }} / {{ habits.length }}</span>
            <span class="stat-label">Completed Today</span>
          </div>
        </div>
        
        <div class="stat-card">
          <span class="stat-icon">🔥</span>
          <div class="stat-info">
            <span class="stat-value">{{ longestStreak }}</span>
            <span class="stat-label">Best Streak</span>
          </div>
        </div>
        
        <div class="stat-card">
          <span class="stat-icon">⭐</span>
          <div class="stat-info">
            <span class="stat-value">{{ pointsToday }}</span>
            <span class="stat-label">Points Today</span>
          </div>
        </div>
      </div>

      <!-- Quick Mood Check -->
      <div class="mood-check" *ngIf="habits.length > 0">
        <span class="mood-label">How are you feeling?</span>
        <div class="mood-buttons">
          <button 
            *ngFor="let m of moodOptions"
            class="mood-btn"
            [class.active]="currentMood === m.value"
            (click)="setMood(m.value)"
          >
            {{ m.emoji }}
          </button>
        </div>
      </div>

      <!-- AI Coach Advice -->
      <app-coach-advice
        *ngIf="getFirstIncompleteHabit()"
        [habit]="getFirstIncompleteHabit()!"
        [dailyValue]="getFirstIncompleteHabitProgress()"
        [mood]="currentMood"
      ></app-coach-advice>

      <!-- Daily Quote (if no habits) -->
      <app-coach-tip *ngIf="habits.length === 0"></app-coach-tip>

      <!-- Active Challenges -->
      <section class="challenges-section" *ngIf="activeChallenges.length > 0">
        <div class="section-header">
          <h2>🎯 Active Challenges</h2>
          <span class="days-left">{{ daysRemaining }} days left</span>
        </div>
        <div class="challenges-list">
          <div 
            class="challenge-card" 
            *ngFor="let challenge of activeChallenges"
            [class.completed]="challenge.isCompleted"
          >
            <div class="challenge-info">
              <span class="challenge-title">{{ challenge.title }}</span>
              <span class="challenge-desc">{{ challenge.description }}</span>
            </div>
            <div class="challenge-progress">
              <div class="progress-ring">
                <svg viewBox="0 0 36 36">
                  <path
                    class="progress-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    class="progress-fill"
                    [style.stroke-dasharray]="getChallengeProgress(challenge) + ', 100'"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span class="progress-text">{{ challenge.currentValue }}/{{ challenge.targetValue }}</span>
              </div>
              <span class="reward">+{{ challenge.reward }} pts</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Habits Section -->
      <section class="habits-section">
        <div class="section-header">
          <h2>📋 Your Habits</h2>
          <button class="view-all" (click)="goToHabits()">View All →</button>
        </div>

        <div class="empty-state" *ngIf="habits.length === 0">
          <span class="empty-icon">🎯</span>
          <h3>No habits yet!</h3>
          <p>Start building better habits today</p>
          <button class="primary-btn" (click)="goToAddHabit()">
            Add Your First Habit
          </button>
        </div>

        <div class="habits-list" *ngIf="habits.length > 0">
          <app-habit-card
            *ngFor="let habit of habits"
            [habit]="habit"
            [todayStatus]="getTodayStatus(habit)"
            [freezeAvailable]="isFreezeAvailable(habit)"
            (checkIn)="openCheckIn($event)"
            (edit)="editHabit($event)"
            (delete)="deleteHabit($event)"
            (freeze)="useFreeze($event)"
          ></app-habit-card>
        </div>
      </section>

      <!-- Recent Badges -->
      <section class="badges-section" *ngIf="recentBadges.length > 0">
        <div class="section-header">
          <h2>🏆 Recent Badges</h2>
          <button class="view-all" (click)="goToLeaderboard()">All Badges →</button>
        </div>
        <div class="badges-grid">
          <app-badge 
            *ngFor="let badge of recentBadges" 
            [badge]="badge"
            size="small"
          ></app-badge>
        </div>
      </section>

      <!-- Quick Leaderboard -->
      <section class="leaderboard-preview">
        <div class="section-header">
          <h2>🏅 Top Habits</h2>
          <button class="view-all" (click)="goToLeaderboard()">Full Board →</button>
        </div>
        <div class="leaderboard-list">
          <div 
            class="leaderboard-item" 
            *ngFor="let item of topHabits; let i = index"
          >
            <span class="rank">{{ getRankEmoji(i) }}</span>
            <span class="habit-name">{{ item.habit.icon }} {{ item.habit.name }}</span>
            <span class="points">{{ item.habit.totalPoints }} pts</span>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 1.5rem;
      max-width: 800px;
      margin: 0 auto;
    }

    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }

    .greeting h1 {
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary, #fff);
      margin: 0 0 0.25rem 0;
    }

    .date {
      color: var(--text-secondary, #a0a0a0);
      font-size: 0.9rem;
      margin: 0;
    }

    .add-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 12px;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .add-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .add-btn span {
      font-size: 1.25rem;
    }

    .motivation-card {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.25rem;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border-radius: 16px;
      border: 1px solid var(--border-color, #333);
      margin-bottom: 1.5rem;
    }

    .quote-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .quote {
      font-size: 0.95rem;
      color: var(--text-primary, #fff);
      line-height: 1.6;
      font-style: italic;
      margin: 0;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .mood-check {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.25rem;
      background: var(--card-bg, #1a1a2e);
      border-radius: 12px;
      border: 1px solid var(--border-color, #333);
      margin-bottom: 1rem;
    }

    .mood-label {
      font-size: 0.9rem;
      color: var(--text-secondary, #a0a0a0);
    }

    .mood-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .mood-btn {
      width: 40px;
      height: 40px;
      font-size: 1.25rem;
      background: var(--border-color, #333);
      border: 2px solid transparent;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .mood-btn:hover {
      transform: scale(1.1);
    }

    .mood-btn.active {
      border-color: var(--accent-color, #667eea);
      background: rgba(102, 126, 234, 0.2);
    }

    @media (min-width: 600px) {
      .stats-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    .stat-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: var(--card-bg, #1a1a2e);
      border-radius: 12px;
      border: 1px solid var(--border-color, #333);
    }

    .stat-icon {
      font-size: 1.5rem;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary, #fff);
    }

    .stat-label {
      font-size: 0.75rem;
      color: var(--text-secondary, #a0a0a0);
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

    .view-all, .days-left {
      font-size: 0.85rem;
      color: var(--accent-color, #667eea);
      background: none;
      border: none;
      cursor: pointer;
    }

    .days-left {
      background: rgba(102, 126, 234, 0.1);
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
    }

    .challenges-section, .habits-section, .badges-section, .leaderboard-preview {
      margin-bottom: 2rem;
    }

    .challenges-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .challenge-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: var(--card-bg, #1a1a2e);
      border-radius: 12px;
      border: 1px solid var(--border-color, #333);
    }

    .challenge-card.completed {
      border-color: #4CAF50;
      background: linear-gradient(135deg, #1a2e1a 0%, #162e16 100%);
    }

    .challenge-info {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .challenge-title {
      font-weight: 600;
      color: var(--text-primary, #fff);
    }

    .challenge-desc {
      font-size: 0.8rem;
      color: var(--text-secondary, #a0a0a0);
    }

    .challenge-progress {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }

    .progress-ring {
      width: 48px;
      height: 48px;
      position: relative;
    }

    .progress-ring svg {
      transform: rotate(-90deg);
    }

    .progress-bg {
      fill: none;
      stroke: var(--border-color, #333);
      stroke-width: 3;
    }

    .progress-fill {
      fill: none;
      stroke: #667eea;
      stroke-width: 3;
      stroke-linecap: round;
      transition: stroke-dasharray 0.3s ease;
    }

    .progress-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 0.6rem;
      font-weight: 600;
      color: var(--text-primary, #fff);
    }

    .reward {
      font-size: 0.7rem;
      color: #4CAF50;
      font-weight: 600;
    }

    .empty-state {
      text-align: center;
      padding: 3rem 1rem;
      background: var(--card-bg, #1a1a2e);
      border-radius: 16px;
      border: 2px dashed var(--border-color, #333);
    }

    .empty-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      font-size: 1.25rem;
      color: var(--text-primary, #fff);
      margin: 0 0 0.5rem 0;
    }

    .empty-state p {
      color: var(--text-secondary, #a0a0a0);
      margin: 0 0 1.5rem 0;
    }

    .primary-btn {
      padding: 0.75rem 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 12px;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .primary-btn:hover {
      transform: translateY(-2px);
    }

    .habits-list {
      display: flex;
      flex-direction: column;
    }

    .badges-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .leaderboard-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .leaderboard-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      background: var(--card-bg, #1a1a2e);
      border-radius: 12px;
      border: 1px solid var(--border-color, #333);
    }

    .rank {
      font-size: 1.25rem;
      width: 32px;
      text-align: center;
    }

    .habit-name {
      flex: 1;
      color: var(--text-primary, #fff);
    }

    .points {
      color: var(--accent-color, #667eea);
      font-weight: 600;
    }
  `]
})
export class DashboardComponent implements OnInit {
  today = new Date();
  dailyQuote = '';
  habits: Habit[] = [];
  activeChallenges: MiniChallenge[] = [];
  recentBadges: Badge[] = [];
  topHabits: { habit: Habit; rank: number }[] = [];
  
  completedToday = 0;
  longestStreak = 0;
  pointsToday = 0;
  daysRemaining = 0;
  
  // Current mood for AI Coach (default to Neutral)
  currentMood: Mood = 'Neutral';
  
  // Mood options for quick selection
  moodOptions = [
    { value: 'Happy' as Mood, emoji: '😊' },
    { value: 'Neutral' as Mood, emoji: '😐' },
    { value: 'Sad' as Mood, emoji: '😢' },
    { value: 'Stressed' as Mood, emoji: '😰' }
  ];

  constructor(
    private router: Router,
    private habitService: HabitService,
    private streakService: StreakService,
    private pointsService: PointsService,
    private coachService: CoachService,
    private challengeService: ChallengeService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    this.loadData();
    this.dailyQuote = this.coachService.getDailyMotivation();
    
    // Subscribe to habit changes
    this.habitService.habits$.subscribe(habits => {
      this.habits = habits;
      this.updateStats();
    });
  }

  loadData(): void {
    // Check for missed days and reset streaks
    this.habitService.checkAndResetStreaks();
    
    // Load habits
    this.habits = this.habitService.getHabits();
    
    // Load challenges
    this.activeChallenges = this.challengeService.getActiveChallenges();
    this.daysRemaining = this.challengeService.getDaysRemaining();
    
    // Load badges
    const profile = this.storageService.getUserProfile();
    this.recentBadges = profile.badges.slice(-3);
    
    // Load leaderboard
    this.topHabits = this.pointsService.getHabitLeaderboard(this.habits).slice(0, 3);
    
    this.updateStats();
  }

  updateStats(): void {
    this.completedToday = this.habitService.getCompletedTodayCount();
    this.longestStreak = this.streakService.getBestStreakEver(this.habits);
    this.pointsToday = this.pointsService.getPointsToday(this.habits);
  }

  getTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    return 'Evening';
  }

  getTodayStatus(habit: Habit): DailyStatus | undefined {
    return this.habitService.getTodayStatus(habit);
  }

  isFreezeAvailable(habit: Habit): boolean {
    return this.streakService.isStreakFreezeAvailable(habit);
  }

  getChallengeProgress(challenge: MiniChallenge): number {
    return this.challengeService.getChallengeProgress(challenge);
  }

  getRankEmoji(index: number): string {
    const emojis = ['🥇', '🥈', '🥉'];
    return emojis[index] || `${index + 1}`;
  }

  // Set current mood for AI Coach
  setMood(mood: Mood): void {
    this.currentMood = mood;
  }

  // Navigation
  goToAddHabit(): void {
    this.router.navigate(['/habits', 'new']);
  }

  goToHabits(): void {
    this.router.navigate(['/habits']);
  }

  goToLeaderboard(): void {
    this.router.navigate(['/leaderboard']);
  }

  // Habit Actions
  openCheckIn(habit: Habit): void {
    this.router.navigate(['/habits', habit.id, 'checkin']);
  }

  editHabit(habit: Habit): void {
    this.router.navigate(['/habits', habit.id, 'edit']);
  }

  deleteHabit(habit: Habit): void {
    if (confirm(`Are you sure you want to delete "${habit.name}"?`)) {
      this.habitService.deleteHabit(habit.id);
    }
  }

  useFreeze(habit: Habit): void {
    const success = this.habitService.useStreakFreeze(habit.id);
    if (success) {
      alert('Streak freeze activated! Your streak is protected for today. ❄️');
      this.loadData();
    } else {
      alert('Streak freeze already used this week.');
    }
  }

  // AI Coach Helper Methods
  
  /**
   * Get the first habit that hasn't been completed today
   * Used by the AI Coach to provide relevant advice
   */
  getFirstIncompleteHabit(): Habit | null {
    return this.habits.find(h => !this.habitService.isCompletedToday(h)) || 
           (this.habits.length > 0 ? this.habits[0] : null);
  }

  /**
   * Get the current progress of the first incomplete habit
   */
  getFirstIncompleteHabitProgress(): number {
    const habit = this.getFirstIncompleteHabit();
    if (!habit) return 0;
    
    const todayStatus = this.habitService.getTodayStatus(habit);
    return todayStatus?.value || 0;
  }
}

