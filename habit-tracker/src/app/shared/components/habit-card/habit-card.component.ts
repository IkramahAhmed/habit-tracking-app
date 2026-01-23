/**
 * Habit Card Component
 * 
 * The main card component for displaying a habit.
 * Shows:
 * - Habit info (name, icon, target)
 * - Current streak
 * - Today's status
 * - Quick actions (check-in, edit, delete)
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Habit, DailyStatus, Mood } from '../../../core/models/habit.model';
import { CATEGORY_COLORS } from '../../../core/models/constants';

@Component({
  selector: 'app-habit-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="habit-card" 
      [class.completed]="todayStatus?.done"
      [class.expanded]="isExpanded"
      [style.--category-color]="getCategoryColor()"
    >
      <!-- Header -->
      <div class="card-header" (click)="toggleExpand()">
        <div class="habit-icon">
          <span>{{ habit.icon }}</span>
        </div>
        
        <div class="habit-info">
          <h3 class="habit-name">{{ habit.name }}</h3>
          <p class="habit-target">
            <span *ngIf="habit.isReduceHabit">Max: </span>
            {{ habit.targetValue }} {{ habit.targetUnit }}/day
          </p>
        </div>

        <div class="streak-badge" *ngIf="habit.currentStreak > 0">
          <span class="fire">🔥</span>
          <span class="count">{{ habit.currentStreak }}</span>
        </div>

        <div class="status-indicator">
          <span *ngIf="todayStatus?.done" class="check">✓</span>
          <span *ngIf="!todayStatus?.done" class="pending">○</span>
        </div>
      </div>

      <!-- Progress Bar -->
      <div class="progress-section" *ngIf="!todayStatus?.done">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            [style.width.%]="getProgress()"
          ></div>
        </div>
        <span class="progress-text">{{ getProgressText() }}</span>
      </div>

      <!-- Today's Info (when completed) -->
      <div class="completed-info" *ngIf="todayStatus?.done">
        <span class="mood-emoji">{{ getMoodEmoji(todayStatus!.mood) }}</span>
        <span class="points">+{{ todayStatus!.pointsEarned }} pts</span>
        <span class="replacement" *ngIf="todayStatus!.replacementDone">
          ✓ {{ habit.replacement }}
        </span>
      </div>

      <!-- Expanded Actions -->
      <div class="card-actions" *ngIf="isExpanded">
        <button 
          class="action-btn primary" 
          (click)="onCheckIn()"
          *ngIf="!todayStatus?.done"
        >
          <span>📝</span> Check In
        </button>
        
        <button 
          class="action-btn secondary" 
          (click)="onEdit()"
        >
          <span>✏️</span> Edit
        </button>
        
        <button 
          class="action-btn freeze" 
          (click)="onFreeze()"
          *ngIf="canFreeze && !todayStatus?.done"
          [disabled]="!freezeAvailable"
          [title]="freezeAvailable ? 'Use streak freeze' : 'Already used this week'"
        >
          <span>❄️</span> Freeze
        </button>

        <button 
          class="action-btn danger" 
          (click)="onDelete()"
        >
          <span>🗑️</span> Delete
        </button>
      </div>

      <!-- Time Window Indicator -->
      <div class="time-window" *ngIf="habit.timeWindow && isInTimeWindow()">
        <span class="clock">⏰</span>
        <span>Active now: {{ habit.timeWindow.start }} - {{ habit.timeWindow.end }}</span>
      </div>
    </div>
  `,
  styles: [`
    .habit-card {
      background: var(--card-bg, #1a1a2e);
      border-radius: 16px;
      border: 1px solid var(--border-color, #333);
      padding: 1rem;
      margin-bottom: 1rem;
      transition: all 0.3s ease;
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }

    .habit-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 4px;
      height: 100%;
      background: var(--category-color, #667eea);
    }

    .habit-card:hover {
      border-color: var(--category-color, #667eea);
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    }

    .habit-card.completed {
      background: linear-gradient(135deg, #1a2e1a 0%, #162e16 100%);
      border-color: #4CAF50;
    }

    .habit-card.completed::before {
      background: #4CAF50;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .habit-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: var(--category-color, #667eea);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .habit-info {
      flex: 1;
    }

    .habit-name {
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--text-primary, #fff);
      margin: 0 0 0.25rem 0;
    }

    .habit-target {
      font-size: 0.85rem;
      color: var(--text-secondary, #a0a0a0);
      margin: 0;
    }

    .streak-badge {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
      padding: 0.35rem 0.75rem;
      border-radius: 20px;
      font-weight: 600;
    }

    .fire {
      font-size: 0.9rem;
    }

    .count {
      color: #fff;
      font-size: 0.9rem;
    }

    .status-indicator {
      font-size: 1.5rem;
      width: 40px;
      text-align: center;
    }

    .check {
      color: #4CAF50;
      font-weight: bold;
    }

    .pending {
      color: var(--text-secondary, #a0a0a0);
    }

    .progress-section {
      margin-top: 1rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .progress-bar {
      flex: 1;
      height: 8px;
      background: var(--border-color, #333);
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--category-color, #667eea), #a855f7);
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .progress-text {
      font-size: 0.8rem;
      color: var(--text-secondary, #a0a0a0);
      min-width: 80px;
      text-align: right;
    }

    .completed-info {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-top: 0.75rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--border-color, #333);
    }

    .mood-emoji {
      font-size: 1.25rem;
    }

    .points {
      color: #4CAF50;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .replacement {
      font-size: 0.8rem;
      color: var(--text-secondary, #a0a0a0);
      background: rgba(76, 175, 80, 0.1);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
    }

    .card-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid var(--border-color, #333);
    }

    .action-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 8px;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s ease;
      background: var(--border-color, #333);
      color: var(--text-primary, #fff);
    }

    .action-btn:hover {
      transform: translateY(-1px);
    }

    .action-btn.primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff;
    }

    .action-btn.secondary {
      background: var(--border-color, #333);
    }

    .action-btn.freeze {
      background: linear-gradient(135deg, #00bcd4 0%, #2196f3 100%);
    }

    .action-btn.freeze:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .action-btn.danger {
      background: rgba(244, 67, 54, 0.2);
      color: #f44336;
    }

    .action-btn.danger:hover {
      background: rgba(244, 67, 54, 0.3);
    }

    .time-window {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.75rem;
      padding: 0.5rem 0.75rem;
      background: rgba(255, 152, 0, 0.1);
      border-radius: 8px;
      font-size: 0.8rem;
      color: #FF9800;
    }

    .clock {
      font-size: 1rem;
    }
  `]
})
export class HabitCardComponent {
  @Input() habit!: Habit;
  @Input() todayStatus?: DailyStatus;
  @Input() canFreeze: boolean = true;
  @Input() freezeAvailable: boolean = true;
  
  @Output() checkIn = new EventEmitter<Habit>();
  @Output() edit = new EventEmitter<Habit>();
  @Output() delete = new EventEmitter<Habit>();
  @Output() freeze = new EventEmitter<Habit>();

  isExpanded = false;

  toggleExpand(): void {
    this.isExpanded = !this.isExpanded;
  }

  getCategoryColor(): string {
    return CATEGORY_COLORS[this.habit.category] || CATEGORY_COLORS['other'];
  }

  getProgress(): number {
    if (!this.todayStatus) return 0;
    
    if (this.habit.isReduceHabit) {
      // For reduce habits, lower is better
      const remaining = this.habit.targetValue - this.todayStatus.value;
      return Math.max(0, (remaining / this.habit.targetValue) * 100);
    } else {
      // For increase habits, higher is better
      return Math.min(100, (this.todayStatus.value / this.habit.targetValue) * 100);
    }
  }

  getProgressText(): string {
    if (!this.todayStatus) {
      return `0 / ${this.habit.targetValue} ${this.habit.targetUnit}`;
    }
    return `${this.todayStatus.value} / ${this.habit.targetValue} ${this.habit.targetUnit}`;
  }

  getMoodEmoji(mood: Mood): string {
    const moodEmojis: Record<Mood, string> = {
      'Happy': '😊',
      'Neutral': '😐',
      'Sad': '😢',
      'Stressed': '😰'
    };
    return moodEmojis[mood] || '😐';
  }

  isInTimeWindow(): boolean {
    if (!this.habit.timeWindow) return false;
    
    const now = new Date();
    const [startHour, startMin] = this.habit.timeWindow.start.split(':').map(Number);
    const [endHour, endMin] = this.habit.timeWindow.end.split(':').map(Number);
    
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  onCheckIn(): void {
    this.checkIn.emit(this.habit);
  }

  onEdit(): void {
    this.edit.emit(this.habit);
  }

  onDelete(): void {
    this.delete.emit(this.habit);
  }

  onFreeze(): void {
    this.freeze.emit(this.habit);
  }
}

