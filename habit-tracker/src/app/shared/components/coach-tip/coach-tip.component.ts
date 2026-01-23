/**
 * Coach Tip Component
 * 
 * Displays coaching tips and advice from the Habit Coach.
 * Shows contextual, helpful messages.
 */

import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoachService, CoachMessage } from '../../../core/services/coach.service';
import { Habit, DailyStatus } from '../../../core/models/habit.model';

@Component({
  selector: 'app-coach-tip',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="coach-tip" [class]="message.type">
      <div class="coach-avatar">
        <span class="avatar-emoji">🧙</span>
      </div>
      <div class="tip-content">
        <span class="tip-label">Habit Coach</span>
        <p class="tip-message">
          <span class="icon">{{ message.icon }}</span>
          {{ message.message }}
        </p>
      </div>
    </div>
  `,
  styles: [`
    .coach-tip {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      border-radius: 16px;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 1px solid var(--border-color, #333);
      margin: 1rem 0;
    }

    .coach-tip.celebration {
      background: linear-gradient(135deg, #1a2e1a 0%, #162e16 100%);
      border-color: #4CAF50;
    }

    .coach-tip.warning {
      background: linear-gradient(135deg, #2e2a1a 0%, #2e2516 100%);
      border-color: #FF9800;
    }

    .coach-avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .avatar-emoji {
      font-size: 1.5rem;
    }

    .tip-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .tip-label {
      font-size: 0.75rem;
      color: var(--accent-color, #667eea);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .tip-message {
      color: var(--text-primary, #fff);
      font-size: 0.95rem;
      line-height: 1.5;
      margin: 0;
    }

    .icon {
      margin-right: 0.5rem;
    }
  `]
})
export class CoachTipComponent implements OnInit {
  @Input() habit?: Habit;
  @Input() todayStatus?: DailyStatus;
  @Input() customMessage?: CoachMessage;

  message: CoachMessage = {
    type: 'tip',
    message: 'Loading tip...',
    icon: '💡'
  };

  constructor(private coachService: CoachService) {}

  ngOnInit(): void {
    if (this.customMessage) {
      this.message = this.customMessage;
    } else if (this.habit) {
      this.message = this.coachService.getCoachMessage(this.habit, this.todayStatus);
    } else {
      // Show daily motivation
      this.message = {
        type: 'tip',
        message: this.coachService.getDailyMotivation(),
        icon: '✨'
      };
    }
  }
}

