/**
 * Badge Component
 * 
 * Displays achievement badges with visual feedback.
 * Shows earned status and details on hover/click.
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Badge } from '../../../core/models/habit.model';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="badge" 
      [class.earned]="badge.earnedAt"
      [class.small]="size === 'small'"
      [class.large]="size === 'large'"
      [title]="badge.description"
    >
      <div class="badge-icon">
        <span class="emoji">{{ badge.icon }}</span>
        <div class="glow" *ngIf="badge.earnedAt"></div>
      </div>
      <div class="badge-info" *ngIf="showLabel">
        <span class="badge-name">{{ badge.name }}</span>
        <span class="badge-desc">{{ badge.description }}</span>
        <span class="earned-date" *ngIf="badge.earnedAt">
          Earned {{ formatDate(badge.earnedAt) }}
        </span>
      </div>
    </div>
  `,
  styles: [`
    .badge {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
      border-radius: 12px;
      transition: all 0.3s ease;
    }

    .badge:not(.earned) {
      opacity: 0.4;
      filter: grayscale(100%);
    }

    .badge.earned {
      opacity: 1;
    }

    .badge-icon {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .emoji {
      font-size: 2rem;
      z-index: 1;
      position: relative;
    }

    .badge.small .emoji {
      font-size: 1.25rem;
    }

    .badge.large .emoji {
      font-size: 3rem;
    }

    .glow {
      position: absolute;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(255, 215, 0, 0.4) 0%, transparent 70%);
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.5; }
      50% { transform: scale(1.3); opacity: 0.8; }
    }

    .badge-info {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }

    .badge-name {
      font-weight: 600;
      color: var(--text-primary, #fff);
      font-size: 0.9rem;
    }

    .badge.small .badge-name {
      font-size: 0.75rem;
    }

    .badge-desc {
      font-size: 0.75rem;
      color: var(--text-secondary, #a0a0a0);
    }

    .badge.small .badge-desc {
      display: none;
    }

    .earned-date {
      font-size: 0.65rem;
      color: var(--accent-color, #ffd700);
    }
  `]
})
export class BadgeComponent {
  @Input() badge!: Badge;
  @Input() showLabel: boolean = true;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  }
}

