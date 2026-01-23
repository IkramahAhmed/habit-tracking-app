/**
 * Challenges Component
 * 
 * Shows weekly mini challenges for extra motivation.
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ChallengeService } from '../../core/services/challenge.service';
import { MiniChallenge } from '../../core/models/habit.model';

@Component({
  selector: 'app-challenges',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="challenges-page">
      <header class="page-header">
        <button class="back-btn" (click)="goBack()">← Back</button>
        <h1>Challenges</h1>
        <div class="spacer"></div>
      </header>

      <!-- Week Info -->
      <div class="week-info">
        <div class="week-badge">
          <span class="trophy">🏆</span>
          <span>Weekly Challenges</span>
        </div>
        <div class="time-left">
          <span class="clock">⏰</span>
          <span>{{ daysRemaining }} days remaining</span>
        </div>
      </div>

      <!-- Active Challenges -->
      <section class="challenges-section">
        <h2>Active Challenges</h2>
        
        <div class="challenges-list">
          <div 
            class="challenge-card"
            *ngFor="let challenge of activeChallenges"
            [class.completed]="challenge.isCompleted"
          >
            <div class="challenge-header">
              <div class="challenge-icon">
                {{ getChallengeIcon(challenge.type) }}
              </div>
              <div class="challenge-info">
                <h3>{{ challenge.title }}</h3>
                <p>{{ challenge.description }}</p>
              </div>
              <div class="reward-badge">
                +{{ challenge.reward }}
              </div>
            </div>

            <div class="challenge-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill"
                  [style.width.%]="getProgress(challenge)"
                ></div>
              </div>
              <div class="progress-text">
                <span>{{ challenge.currentValue }} / {{ challenge.targetValue }}</span>
                <span *ngIf="challenge.isCompleted" class="completed-label">✓ Completed</span>
              </div>
            </div>
          </div>
        </div>

        <div class="empty-state" *ngIf="activeChallenges.length === 0">
          <span class="empty-icon">🎯</span>
          <p>No active challenges. Check back next week!</p>
        </div>
      </section>

      <!-- Completed Challenges -->
      <section class="challenges-section" *ngIf="completedChallenges.length > 0">
        <h2>Completed This Week</h2>
        
        <div class="completed-list">
          <div 
            class="completed-item"
            *ngFor="let challenge of completedChallenges"
          >
            <span class="check">✓</span>
            <span class="title">{{ challenge.title }}</span>
            <span class="reward">+{{ challenge.reward }} pts</span>
          </div>
        </div>

        <div class="total-rewards">
          <span>Total Rewards Earned:</span>
          <span class="total-value">{{ totalRewards }} pts</span>
        </div>
      </section>

      <!-- Tips -->
      <section class="tips-section">
        <h2>💡 Challenge Tips</h2>
        <ul class="tips-list">
          <li>Challenges reset every week</li>
          <li>Complete daily check-ins to progress</li>
          <li>Bonus points are added automatically</li>
          <li>Focus on one challenge at a time</li>
        </ul>
      </section>
    </div>
  `,
  styles: [`
    .challenges-page {
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

    .week-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      margin-bottom: 1.5rem;
    }

    .week-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: #fff;
    }

    .trophy {
      font-size: 1.25rem;
    }

    .time-left {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.9);
    }

    .challenges-section {
      margin-bottom: 2rem;
    }

    .challenges-section h2 {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary, #fff);
      margin: 0 0 1rem 0;
    }

    .challenges-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .challenge-card {
      padding: 1.25rem;
      background: var(--card-bg, #1a1a2e);
      border-radius: 16px;
      border: 1px solid var(--border-color, #333);
    }

    .challenge-card.completed {
      border-color: #4CAF50;
      background: linear-gradient(135deg, #1a2e1a 0%, #162e16 100%);
    }

    .challenge-header {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .challenge-icon {
      width: 48px;
      height: 48px;
      font-size: 1.5rem;
      background: var(--accent-color, #667eea);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .challenge-info {
      flex: 1;
    }

    .challenge-info h3 {
      font-size: 1rem;
      color: var(--text-primary, #fff);
      margin: 0 0 0.25rem 0;
    }

    .challenge-info p {
      font-size: 0.85rem;
      color: var(--text-secondary, #a0a0a0);
      margin: 0;
    }

    .reward-badge {
      padding: 0.5rem 0.75rem;
      background: rgba(76, 175, 80, 0.2);
      border-radius: 20px;
      color: #4CAF50;
      font-weight: 600;
      font-size: 0.85rem;
    }

    .challenge-progress {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .progress-bar {
      height: 8px;
      background: var(--border-color, #333);
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea, #764ba2);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .challenge-card.completed .progress-fill {
      background: #4CAF50;
    }

    .progress-text {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: var(--text-secondary, #a0a0a0);
    }

    .completed-label {
      color: #4CAF50;
      font-weight: 600;
    }

    .empty-state {
      text-align: center;
      padding: 2rem 1rem;
      color: var(--text-secondary, #a0a0a0);
    }

    .empty-icon {
      font-size: 2.5rem;
      display: block;
      margin-bottom: 0.5rem;
    }

    .completed-list {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .completed-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: rgba(76, 175, 80, 0.1);
      border-radius: 12px;
    }

    .check {
      color: #4CAF50;
      font-weight: bold;
    }

    .title {
      flex: 1;
      color: var(--text-primary, #fff);
    }

    .reward {
      color: #4CAF50;
      font-weight: 600;
    }

    .total-rewards {
      display: flex;
      justify-content: space-between;
      padding: 1rem;
      background: var(--card-bg, #1a1a2e);
      border-radius: 12px;
      border: 1px solid #4CAF50;
    }

    .total-rewards span:first-child {
      color: var(--text-secondary, #a0a0a0);
    }

    .total-value {
      color: #4CAF50;
      font-weight: 700;
      font-size: 1.1rem;
    }

    .tips-section {
      padding: 1.25rem;
      background: var(--card-bg, #1a1a2e);
      border-radius: 16px;
      border: 1px solid var(--border-color, #333);
    }

    .tips-section h2 {
      font-size: 1rem;
      color: var(--text-primary, #fff);
      margin: 0 0 0.75rem 0;
    }

    .tips-list {
      margin: 0;
      padding-left: 1.25rem;
      color: var(--text-secondary, #a0a0a0);
      font-size: 0.9rem;
      line-height: 1.8;
    }
  `]
})
export class ChallengesComponent implements OnInit {
  allChallenges: MiniChallenge[] = [];
  activeChallenges: MiniChallenge[] = [];
  completedChallenges: MiniChallenge[] = [];
  daysRemaining = 0;
  totalRewards = 0;

  constructor(
    private router: Router,
    private challengeService: ChallengeService
  ) {}

  ngOnInit(): void {
    this.loadChallenges();
  }

  loadChallenges(): void {
    this.allChallenges = this.challengeService.getAllChallenges();
    this.activeChallenges = this.allChallenges.filter(c => !c.isCompleted);
    this.completedChallenges = this.allChallenges.filter(c => c.isCompleted);
    this.daysRemaining = this.challengeService.getDaysRemaining();
    this.totalRewards = this.challengeService.getCompletedChallengeRewards();
  }

  getProgress(challenge: MiniChallenge): number {
    return this.challengeService.getChallengeProgress(challenge);
  }

  getChallengeIcon(type: string): string {
    const icons: Record<string, string> = {
      'streak': '🔥',
      'points': '⭐',
      'perfect-day': '✨',
      'early': '🌅',
      'replacement': '🔄'
    };
    return icons[type] || '🎯';
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}

