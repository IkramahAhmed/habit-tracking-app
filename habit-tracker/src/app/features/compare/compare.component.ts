/**
 * Compare Component
 * 
 * User vs User comparison dashboard featuring:
 * - Total points comparison
 * - Streak comparison
 * - Habit-by-habit breakdown
 * - Daily "Habit Battle" feature
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../core/services/user.service';
import { ComparisonService, HabitComparisonItem } from '../../core/services/comparison.service';
import { User, UserComparison, HabitBattle } from '../../core/models/habit.model';

@Component({
  selector: 'app-compare',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="compare-page">
      <header class="page-header">
        <button class="back-btn" (click)="goBack()">← Back</button>
        <h1>User Battle</h1>
        <div class="spacer"></div>
      </header>

      <!-- User Selection -->
      <div class="user-selection" *ngIf="users.length >= 2">
        <div class="user-card" [style.--user-color]="getUserColor(0)">
          <div class="user-avatar">{{ users[0].profile.avatar }}</div>
          <span class="user-name">{{ users[0].profile.name }}</span>
        </div>
        
        <div class="vs-badge">VS</div>
        
        <div class="user-card" [style.--user-color]="getUserColor(1)">
          <div class="user-avatar">{{ users[1].profile.avatar }}</div>
          <span class="user-name">{{ users[1].profile.name }}</span>
        </div>
      </div>

      <!-- Today's Winner Banner -->
      <div class="winner-banner" *ngIf="comparison" [class.draw]="!comparison.todayWinner">
        <div class="winner-content" *ngIf="comparison.todayWinner">
          <span class="trophy">🏆</span>
          <span class="winner-text">
            {{ getWinnerName(comparison.todayWinner) }} is winning today!
          </span>
        </div>
        <div class="winner-content" *ngIf="!comparison.todayWinner">
          <span class="handshake">🤝</span>
          <span class="winner-text">It's a tie today!</span>
        </div>
      </div>

      <!-- Quick Stats Comparison -->
      <section class="stats-comparison" *ngIf="comparison">
        <h2>📊 Stats Comparison</h2>
        
        <div class="stat-row">
          <div class="stat-bar-container">
            <div class="stat-label">Total Points</div>
            <div class="stat-bars">
              <div class="bar-wrapper">
                <div 
                  class="bar user1"
                  [style.width.%]="getBarWidth(comparison.user1.totalPoints, comparison.user2.totalPoints, true)"
                  [style.--bar-color]="getUserColor(0)"
                >
                  {{ comparison.user1.totalPoints }}
                </div>
              </div>
              <div class="bar-wrapper right">
                <div 
                  class="bar user2"
                  [style.width.%]="getBarWidth(comparison.user2.totalPoints, comparison.user1.totalPoints, true)"
                  [style.--bar-color]="getUserColor(1)"
                >
                  {{ comparison.user2.totalPoints }}
                </div>
              </div>
            </div>
            <span class="stat-winner" *ngIf="comparison.overallWinner">
              {{ getWinnerAvatar(comparison.overallWinner) }}
            </span>
          </div>
        </div>

        <div class="stat-row">
          <div class="stat-bar-container">
            <div class="stat-label">Points Today</div>
            <div class="stat-bars">
              <div class="bar-wrapper">
                <div 
                  class="bar user1"
                  [style.width.%]="getBarWidth(comparison.user1.pointsToday, comparison.user2.pointsToday, true)"
                  [style.--bar-color]="getUserColor(0)"
                >
                  {{ comparison.user1.pointsToday }}
                </div>
              </div>
              <div class="bar-wrapper right">
                <div 
                  class="bar user2"
                  [style.width.%]="getBarWidth(comparison.user2.pointsToday, comparison.user1.pointsToday, true)"
                  [style.--bar-color]="getUserColor(1)"
                >
                  {{ comparison.user2.pointsToday }}
                </div>
              </div>
            </div>
            <span class="stat-winner" *ngIf="comparison.todayWinner">
              {{ getWinnerAvatar(comparison.todayWinner) }}
            </span>
          </div>
        </div>

        <div class="stat-row">
          <div class="stat-bar-container">
            <div class="stat-label">Best Streak</div>
            <div class="stat-bars">
              <div class="bar-wrapper">
                <div 
                  class="bar user1"
                  [style.width.%]="getBarWidth(comparison.user1.longestStreak, comparison.user2.longestStreak, true)"
                  [style.--bar-color]="getUserColor(0)"
                >
                  {{ comparison.user1.longestStreak }} 🔥
                </div>
              </div>
              <div class="bar-wrapper right">
                <div 
                  class="bar user2"
                  [style.width.%]="getBarWidth(comparison.user2.longestStreak, comparison.user1.longestStreak, true)"
                  [style.--bar-color]="getUserColor(1)"
                >
                  {{ comparison.user2.longestStreak }} 🔥
                </div>
              </div>
            </div>
            <span class="stat-winner" *ngIf="comparison.streakWinner">
              {{ getWinnerAvatar(comparison.streakWinner) }}
            </span>
          </div>
        </div>

        <div class="stat-row">
          <div class="stat-bar-container">
            <div class="stat-label">Completion Rate</div>
            <div class="stat-bars">
              <div class="bar-wrapper">
                <div 
                  class="bar user1"
                  [style.width.%]="comparison.user1.completionRate"
                  [style.--bar-color]="getUserColor(0)"
                >
                  {{ comparison.user1.completionRate }}%
                </div>
              </div>
              <div class="bar-wrapper right">
                <div 
                  class="bar user2"
                  [style.width.%]="comparison.user2.completionRate"
                  [style.--bar-color]="getUserColor(1)"
                >
                  {{ comparison.user2.completionRate }}%
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Daily Battle -->
      <section class="battle-section">
        <h2>⚔️ Daily Habit Battle</h2>
        
        <!-- No Active Battle -->
        <div class="no-battle" *ngIf="!activeBattle">
          <div class="battle-icon">🎮</div>
          <p>No battle today! Start a new one?</p>
          <button class="start-battle-btn" (click)="startNewBattle()">
            Start Battle
          </button>
        </div>

        <!-- Active Battle -->
        <div class="active-battle" *ngIf="activeBattle">
          <div class="battle-header">
            <span class="battle-habit">{{ activeBattle.habitName }}</span>
            <span class="battle-target">
              Target: {{ activeBattle.isReduceHabit ? 'Max ' : '' }}{{ activeBattle.targetValue }} {{ activeBattle.targetUnit }}
            </span>
          </div>

          <div class="battle-participants">
            <div 
              class="participant"
              *ngFor="let p of activeBattle.participants; let i = index"
              [class.winner]="activeBattle.winnerId === p.userId"
              [class.completed]="p.completed"
            >
              <div class="participant-avatar">{{ p.userAvatar }}</div>
              <span class="participant-name">{{ p.userName }}</span>
              <div class="participant-progress">
                <input 
                  type="number" 
                  class="progress-input"
                  [value]="p.value"
                  (change)="updateBattleProgress(p.userId, $event)"
                  [disabled]="activeBattle.status !== 'active'"
                  min="0"
                >
                <span class="progress-unit">{{ activeBattle.targetUnit }}</span>
              </div>
              <div class="participant-status">
                <span *ngIf="p.completed" class="status-check">✓</span>
                <span *ngIf="!p.completed" class="status-pending">○</span>
              </div>
            </div>
          </div>

          <div class="battle-reward">
            <span class="reward-icon">🏆</span>
            <span>Winner gets +{{ activeBattle.bonusPoints }} bonus points!</span>
          </div>

          <!-- Battle Result -->
          <div class="battle-result" *ngIf="activeBattle.status !== 'active'">
            <div *ngIf="activeBattle.winnerId" class="result-winner">
              <span class="result-emoji">🎉</span>
              <span>{{ getWinnerName(activeBattle.winnerId) }} wins!</span>
            </div>
            <div *ngIf="activeBattle.status === 'draw'" class="result-draw">
              <span class="result-emoji">🤝</span>
              <span>It's a draw!</span>
            </div>
          </div>

          <button 
            class="end-battle-btn" 
            *ngIf="activeBattle.status === 'active'"
            (click)="endBattle()"
          >
            End Battle
          </button>
        </div>
      </section>

      <!-- Habit by Habit Comparison -->
      <section class="habit-comparison" *ngIf="habitComparison.length > 0">
        <h2>📋 Habit-by-Habit</h2>
        
        <div class="habit-list">
          <div 
            class="habit-row" 
            *ngFor="let item of habitComparison"
          >
            <div class="habit-icon">{{ item.icon }}</div>
            <div class="habit-name">{{ item.habitName }}</div>
            
            <div class="habit-scores">
              <div 
                class="score user1"
                [class.winner]="item.winner === 1"
                [class.no-habit]="!item.user1.hasHabit"
              >
                <span class="streak" *ngIf="item.user1.hasHabit">🔥{{ item.user1.streak }}</span>
                <span class="check" *ngIf="item.user1.completedToday">✓</span>
                <span *ngIf="!item.user1.hasHabit">-</span>
              </div>
              
              <div 
                class="score user2"
                [class.winner]="item.winner === 2"
                [class.no-habit]="!item.user2.hasHabit"
              >
                <span class="streak" *ngIf="item.user2.hasHabit">🔥{{ item.user2.streak }}</span>
                <span class="check" *ngIf="item.user2.completedToday">✓</span>
                <span *ngIf="!item.user2.hasHabit">-</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Battle History -->
      <section class="battle-history" *ngIf="battleHistory.length > 0">
        <h2>📜 Battle History</h2>
        
        <div class="history-list">
          <div 
            class="history-item" 
            *ngFor="let battle of battleHistory.slice(0, 5)"
          >
            <span class="history-date">{{ battle.date }}</span>
            <span class="history-habit">{{ battle.habitName }}</span>
            <span class="history-result" *ngIf="battle.winnerId">
              {{ getWinnerAvatar(battle.winnerId) }} won
            </span>
            <span class="history-result draw" *ngIf="!battle.winnerId">
              Draw
            </span>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .compare-page {
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

    /* User Selection */
    .user-selection {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .user-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      background: var(--card-bg, #1a1a2e);
      border: 2px solid var(--user-color, #667eea);
      border-radius: 16px;
      min-width: 100px;
    }

    .user-avatar {
      width: 48px;
      height: 48px;
      font-size: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .user-name {
      font-weight: 600;
      color: var(--text-primary, #fff);
      font-size: 0.9rem;
    }

    .vs-badge {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      color: #fff;
      font-size: 0.9rem;
    }

    /* Winner Banner */
    .winner-banner {
      padding: 1rem;
      background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
      border-radius: 12px;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .winner-banner.draw {
      background: linear-gradient(135deg, #9E9E9E 0%, #757575 100%);
    }

    .winner-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      color: #fff;
    }

    .trophy, .handshake {
      font-size: 1.5rem;
    }

    .winner-text {
      font-weight: 600;
      font-size: 1rem;
    }

    /* Stats Comparison */
    .stats-comparison, .battle-section, .habit-comparison, .battle-history {
      margin-bottom: 2rem;
    }

    h2 {
      font-size: 1.1rem;
      color: var(--text-primary, #fff);
      margin: 0 0 1rem 0;
    }

    .stat-row {
      margin-bottom: 1rem;
    }

    .stat-bar-container {
      background: var(--card-bg, #1a1a2e);
      border-radius: 12px;
      padding: 1rem;
      border: 1px solid var(--border-color, #333);
    }

    .stat-label {
      font-size: 0.8rem;
      color: var(--text-secondary, #a0a0a0);
      margin-bottom: 0.5rem;
      text-align: center;
    }

    .stat-bars {
      display: flex;
      gap: 4px;
      height: 32px;
    }

    .bar-wrapper {
      flex: 1;
      display: flex;
    }

    .bar-wrapper.right {
      justify-content: flex-end;
    }

    .bar {
      height: 100%;
      border-radius: 6px;
      display: flex;
      align-items: center;
      padding: 0 0.75rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: #fff;
      min-width: 40px;
      background: var(--bar-color, #667eea);
      transition: width 0.3s ease;
    }

    .bar.user1 {
      justify-content: flex-start;
    }

    .bar.user2 {
      justify-content: flex-end;
    }

    .stat-winner {
      display: block;
      text-align: center;
      margin-top: 0.5rem;
      font-size: 1.25rem;
    }

    /* Battle Section */
    .no-battle {
      text-align: center;
      padding: 2rem;
      background: var(--card-bg, #1a1a2e);
      border-radius: 16px;
      border: 2px dashed var(--border-color, #333);
    }

    .battle-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .no-battle p {
      color: var(--text-secondary, #a0a0a0);
      margin-bottom: 1rem;
    }

    .start-battle-btn {
      padding: 0.875rem 2rem;
      background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
      border: none;
      border-radius: 12px;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .start-battle-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(255, 107, 53, 0.4);
    }

    .active-battle {
      background: var(--card-bg, #1a1a2e);
      border-radius: 16px;
      border: 1px solid var(--border-color, #333);
      overflow: hidden;
    }

    .battle-header {
      padding: 1rem;
      background: linear-gradient(135deg, rgba(255, 107, 53, 0.2) 0%, rgba(247, 147, 30, 0.1) 100%);
      border-bottom: 1px solid var(--border-color, #333);
      text-align: center;
    }

    .battle-habit {
      display: block;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary, #fff);
      margin-bottom: 0.25rem;
    }

    .battle-target {
      font-size: 0.85rem;
      color: var(--text-secondary, #a0a0a0);
    }

    .battle-participants {
      padding: 1rem;
    }

    .participant {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.875rem;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 12px;
      margin-bottom: 0.75rem;
      border: 2px solid transparent;
    }

    .participant.winner {
      border-color: #4CAF50;
      background: rgba(76, 175, 80, 0.1);
    }

    .participant.completed {
      border-color: rgba(76, 175, 80, 0.5);
    }

    .participant-avatar {
      font-size: 1.5rem;
    }

    .participant-name {
      flex: 1;
      font-weight: 600;
      color: var(--text-primary, #fff);
    }

    .participant-progress {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .progress-input {
      width: 60px;
      padding: 0.5rem;
      background: var(--bg-primary, #0f0f1a);
      border: 1px solid var(--border-color, #333);
      border-radius: 8px;
      color: var(--text-primary, #fff);
      text-align: center;
      font-size: 1rem;
    }

    .progress-input:focus {
      outline: none;
      border-color: var(--accent-color, #667eea);
    }

    .progress-unit {
      font-size: 0.8rem;
      color: var(--text-secondary, #a0a0a0);
    }

    .participant-status {
      width: 32px;
      text-align: center;
    }

    .status-check {
      color: #4CAF50;
      font-weight: bold;
      font-size: 1.25rem;
    }

    .status-pending {
      color: var(--text-secondary, #a0a0a0);
      font-size: 1.25rem;
    }

    .battle-reward {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.875rem;
      background: rgba(255, 215, 0, 0.1);
      color: #FFD700;
      font-size: 0.9rem;
    }

    .battle-result {
      padding: 1.5rem;
      text-align: center;
      background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
    }

    .result-winner, .result-draw {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      color: #fff;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .result-emoji {
      font-size: 1.5rem;
    }

    .end-battle-btn {
      width: 100%;
      padding: 1rem;
      background: var(--border-color, #333);
      border: none;
      color: var(--text-primary, #fff);
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .end-battle-btn:hover {
      background: rgba(244, 67, 54, 0.3);
    }

    /* Habit Comparison */
    .habit-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .habit-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      background: var(--card-bg, #1a1a2e);
      border-radius: 12px;
      border: 1px solid var(--border-color, #333);
    }

    .habit-icon {
      font-size: 1.25rem;
    }

    .habit-name {
      flex: 1;
      color: var(--text-primary, #fff);
      font-size: 0.9rem;
    }

    .habit-scores {
      display: flex;
      gap: 0.5rem;
    }

    .score {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.375rem 0.625rem;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      font-size: 0.8rem;
      min-width: 50px;
      justify-content: center;
    }

    .score.winner {
      background: rgba(76, 175, 80, 0.2);
      border: 1px solid #4CAF50;
    }

    .score.no-habit {
      opacity: 0.4;
    }

    .streak {
      color: #FF9800;
    }

    .check {
      color: #4CAF50;
    }

    /* Battle History */
    .history-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .history-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.75rem 1rem;
      background: var(--card-bg, #1a1a2e);
      border-radius: 10px;
      border: 1px solid var(--border-color, #333);
    }

    .history-date {
      font-size: 0.75rem;
      color: var(--text-secondary, #a0a0a0);
      min-width: 80px;
    }

    .history-habit {
      flex: 1;
      color: var(--text-primary, #fff);
      font-size: 0.9rem;
    }

    .history-result {
      font-size: 0.85rem;
      color: #4CAF50;
      font-weight: 600;
    }

    .history-result.draw {
      color: var(--text-secondary, #a0a0a0);
    }
  `]
})
export class CompareComponent implements OnInit {
  users: User[] = [];
  comparison: UserComparison | null = null;
  habitComparison: HabitComparisonItem[] = [];
  activeBattle: HabitBattle | null = null;
  battleHistory: HabitBattle[] = [];

  constructor(
    private router: Router,
    private userService: UserService,
    private comparisonService: ComparisonService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.users = this.userService.getUsers();
    
    if (this.users.length >= 2) {
      this.comparison = this.comparisonService.compareUsers(
        this.users[0].id,
        this.users[1].id
      );
      
      this.habitComparison = this.comparisonService.getHabitComparison(
        this.users[0].id,
        this.users[1].id
      );
    }

    this.activeBattle = this.comparisonService.getTodaysBattle();
    this.battleHistory = this.comparisonService.getBattleHistory();
  }

  getWinnerName(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user?.profile.name || 'Unknown';
  }

  getWinnerAvatar(userId: number): string {
    const user = this.users.find(u => u.id === userId);
    return user?.profile.avatar || '👤';
  }

  getUserColor(index: number): string {
    if (this.users[index]) {
      return this.users[index].profile.color;
    }
    return index === 0 ? '#667eea' : '#f093fb';
  }

  getBarWidth(value1: number, value2: number, isHigherBetter: boolean): number {
    const total = value1 + value2;
    if (total === 0) return 50;
    return Math.round((value1 / total) * 100);
  }

  startNewBattle(): void {
    if (this.users.length >= 2) {
      this.activeBattle = this.comparisonService.createBattle(
        this.users[0].id,
        this.users[1].id
      );
    }
  }

  updateBattleProgress(userId: number, event: Event): void {
    if (!this.activeBattle) return;
    
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value, 10) || 0;
    
    this.activeBattle = this.comparisonService.updateBattleProgress(
      this.activeBattle.id,
      userId,
      value
    );
    
    // Refresh comparison after battle update
    this.loadData();
  }

  endBattle(): void {
    if (this.activeBattle) {
      this.comparisonService.completeBattle(this.activeBattle);
      this.loadData();
    }
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}

