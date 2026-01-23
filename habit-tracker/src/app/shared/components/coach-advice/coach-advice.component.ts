/**
 * Coach Advice Component
 * 
 * Displays the AI Coach's personalized advice in a beautiful card format.
 * Shows:
 * - Title with icon
 * - Advice points
 * - Action steps
 * - Mood-specific tips
 * - Streak message
 * - Motivational quote
 */

import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoachService, CoachAdvice } from '../../../core/services/coach.service';
import { Habit, Mood, DailyStatus } from '../../../core/models/habit.model';

@Component({
  selector: 'app-coach-advice',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="coach-advice-card" [class.expanded]="isExpanded">
      <!-- Header -->
      <div class="card-header" (click)="toggleExpand()">
        <div class="coach-avatar">
          <span class="avatar-icon">{{ advice.icon }}</span>
        </div>
        <div class="header-content">
          <span class="coach-label">AI Habit Coach</span>
          <h3 class="advice-title">{{ advice.title }}</h3>
        </div>
        <button class="expand-btn">
          {{ isExpanded ? '▲' : '▼' }}
        </button>
      </div>

      <!-- Mood Tip Banner -->
      <div class="mood-tip" *ngIf="advice.moodTip && isExpanded">
        <span class="mood-icon">{{ getMoodIcon() }}</span>
        <span>{{ advice.moodTip }}</span>
      </div>

      <!-- Streak Message -->
      <div class="streak-message" *ngIf="advice.streakMessage && isExpanded">
        {{ advice.streakMessage }}
      </div>

      <!-- Main Content -->
      <div class="card-content" *ngIf="isExpanded">
        <!-- Advice Points -->
        <div class="advice-section">
          <h4>💬 What I Notice</h4>
          <ul class="advice-list">
            <li *ngFor="let point of advice.advice">
              <span class="bullet">•</span>
              {{ point }}
            </li>
          </ul>
        </div>

        <!-- Action Steps -->
        <div class="action-section" *ngIf="advice.actionSteps.length > 0">
          <h4>🎯 Try This Today</h4>
          <div class="action-steps">
            <div class="action-step" *ngFor="let step of advice.actionSteps; let i = index">
              <span class="step-number">{{ i + 1 }}</span>
              <span class="step-text">{{ step }}</span>
            </div>
          </div>
        </div>

        <!-- Motivation -->
        <div class="motivation-section">
          <div class="motivation-card">
            <span class="quote-icon">✨</span>
            <p class="motivation-text">{{ advice.motivation }}</p>
          </div>
        </div>
      </div>

      <!-- Collapsed Preview -->
      <div class="collapsed-preview" *ngIf="!isExpanded">
        <p>{{ advice.advice[0] }}</p>
        <span class="tap-hint">Tap to see full advice →</span>
      </div>
    </div>
  `,
  styles: [`
    .coach-advice-card {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border-radius: 20px;
      border: 1px solid var(--border-color, #333);
      overflow: hidden;
      transition: all 0.3s ease;
    }

    .coach-advice-card:hover {
      border-color: rgba(102, 126, 234, 0.5);
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      cursor: pointer;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
    }

    .coach-avatar {
      width: 56px;
      height: 56px;
      border-radius: 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .avatar-icon {
      font-size: 1.75rem;
    }

    .header-content {
      flex: 1;
    }

    .coach-label {
      font-size: 0.75rem;
      color: var(--accent-color, #667eea);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .advice-title {
      font-size: 1.1rem;
      color: var(--text-primary, #fff);
      margin: 0.25rem 0 0 0;
      font-weight: 600;
    }

    .expand-btn {
      width: 32px;
      height: 32px;
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: 8px;
      color: var(--text-secondary, #a0a0a0);
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .expand-btn:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    .mood-tip {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1.25rem;
      background: rgba(255, 152, 0, 0.1);
      border-bottom: 1px solid rgba(255, 152, 0, 0.2);
      font-size: 0.9rem;
      color: #FF9800;
    }

    .mood-icon {
      font-size: 1.25rem;
    }

    .streak-message {
      padding: 0.875rem 1.25rem;
      background: linear-gradient(90deg, rgba(255, 107, 53, 0.2) 0%, rgba(247, 147, 30, 0.1) 100%);
      font-weight: 600;
      color: #FF9800;
      text-align: center;
      border-bottom: 1px solid rgba(255, 152, 0, 0.2);
    }

    .card-content {
      padding: 1.25rem;
    }

    .advice-section,
    .action-section {
      margin-bottom: 1.25rem;
    }

    .advice-section h4,
    .action-section h4 {
      font-size: 0.9rem;
      color: var(--text-primary, #fff);
      margin: 0 0 0.75rem 0;
      font-weight: 600;
    }

    .advice-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .advice-list li {
      display: flex;
      gap: 0.75rem;
      padding: 0.5rem 0;
      color: var(--text-secondary, #a0a0a0);
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .bullet {
      color: var(--accent-color, #667eea);
      font-weight: bold;
    }

    .action-steps {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .action-step {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      padding: 0.875rem 1rem;
      background: rgba(102, 126, 234, 0.1);
      border-radius: 12px;
      border-left: 3px solid var(--accent-color, #667eea);
    }

    .step-number {
      width: 28px;
      height: 28px;
      background: var(--accent-color, #667eea);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 700;
      color: white;
      flex-shrink: 0;
    }

    .step-text {
      color: var(--text-primary, #fff);
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .motivation-section {
      margin-top: 1rem;
    }

    .motivation-card {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      background: linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(139, 195, 74, 0.05) 100%);
      border-radius: 12px;
      border: 1px solid rgba(76, 175, 80, 0.2);
    }

    .quote-icon {
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .motivation-text {
      margin: 0;
      color: var(--text-primary, #fff);
      font-style: italic;
      font-size: 0.95rem;
      line-height: 1.5;
    }

    .collapsed-preview {
      padding: 0.875rem 1.25rem;
    }

    .collapsed-preview p {
      margin: 0 0 0.5rem 0;
      color: var(--text-secondary, #a0a0a0);
      font-size: 0.9rem;
      line-height: 1.4;
    }

    .tap-hint {
      font-size: 0.75rem;
      color: var(--accent-color, #667eea);
    }

    /* Animation for expanding */
    .coach-advice-card.expanded {
      box-shadow: 0 8px 32px rgba(102, 126, 234, 0.2);
    }
  `]
})
export class CoachAdviceComponent implements OnInit, OnChanges {
  @Input() habit!: Habit;
  @Input() dailyValue: number = 0;
  @Input() mood: Mood = 'Neutral';
  @Input() todayStatus?: DailyStatus;
  @Input() autoExpand: boolean = false;

  advice!: CoachAdvice;
  isExpanded = false;

  constructor(private coachService: CoachService) {}

  ngOnInit(): void {
    this.generateAdvice();
    this.isExpanded = this.autoExpand;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['habit'] || changes['dailyValue'] || changes['mood']) {
      this.generateAdvice();
    }
  }

  generateAdvice(): void {
    if (this.habit) {
      this.advice = this.coachService.generateDailyAdvice(
        this.habit,
        this.dailyValue,
        this.mood,
        this.todayStatus
      );
    } else {
      // Default advice if no habit provided
      this.advice = {
        title: 'Welcome!',
        advice: ['Start by creating your first habit to get personalized advice.'],
        motivation: 'Every journey begins with a single step!',
        actionSteps: ['Tap the + button to create a habit'],
        icon: '🧙'
      };
    }
  }

  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  getMoodIcon(): string {
    const icons: Record<Mood, string> = {
      Happy: '😊',
      Neutral: '😐',
      Sad: '😢',
      Stressed: '😰'
    };
    return icons[this.mood] || '😐';
  }
}

