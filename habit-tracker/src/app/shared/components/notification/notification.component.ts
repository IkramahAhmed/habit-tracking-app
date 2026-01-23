/**
 * Notification Component
 * 
 * Shows toast-style notifications for:
 * - Points earned
 * - Badges unlocked
 * - Streak updates
 * - Challenges completed
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Notification {
  id: number;
  type: 'success' | 'info' | 'warning' | 'celebration';
  title: string;
  message: string;
  icon: string;
  duration?: number;
}

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notification-container">
      <div 
        *ngFor="let notif of notifications; trackBy: trackById"
        class="notification"
        [class]="notif.type"
        [@slideIn]
      >
        <div class="notif-icon">{{ notif.icon }}</div>
        <div class="notif-content">
          <span class="notif-title">{{ notif.title }}</span>
          <span class="notif-message">{{ notif.message }}</span>
        </div>
        <button class="close-btn" (click)="dismiss(notif.id)">×</button>
      </div>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-width: 350px;
    }

    .notification {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: 12px;
      background: var(--card-bg, #1a1a2e);
      border: 1px solid var(--border-color, #333);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .notification.success {
      border-left: 4px solid #4CAF50;
    }

    .notification.info {
      border-left: 4px solid #2196F3;
    }

    .notification.warning {
      border-left: 4px solid #FF9800;
    }

    .notification.celebration {
      border-left: 4px solid #FFD700;
      background: linear-gradient(135deg, #1a1a2e 0%, #2a1a3e 100%);
    }

    .notif-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .notif-content {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      flex: 1;
    }

    .notif-title {
      font-weight: 600;
      color: var(--text-primary, #fff);
      font-size: 0.9rem;
    }

    .notif-message {
      font-size: 0.8rem;
      color: var(--text-secondary, #a0a0a0);
    }

    .close-btn {
      background: none;
      border: none;
      color: var(--text-secondary, #a0a0a0);
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0;
      line-height: 1;
      transition: color 0.2s;
    }

    .close-btn:hover {
      color: var(--text-primary, #fff);
    }
  `]
})
export class NotificationComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private nextId = 1;
  private timeouts: Map<number, any> = new Map();

  // Static instance for global access
  private static instance: NotificationComponent;

  ngOnInit(): void {
    NotificationComponent.instance = this;
  }

  ngOnDestroy(): void {
    this.timeouts.forEach(timeout => clearTimeout(timeout));
  }

  static show(
    type: Notification['type'],
    title: string,
    message: string,
    icon: string,
    duration: number = 4000
  ): void {
    if (NotificationComponent.instance) {
      NotificationComponent.instance.addNotification({
        id: NotificationComponent.instance.nextId++,
        type,
        title,
        message,
        icon,
        duration
      });
    }
  }

  addNotification(notif: Notification): void {
    this.notifications.push(notif);

    if (notif.duration && notif.duration > 0) {
      const timeout = setTimeout(() => {
        this.dismiss(notif.id);
      }, notif.duration);
      this.timeouts.set(notif.id, timeout);
    }
  }

  dismiss(id: number): void {
    const timeout = this.timeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(id);
    }
    this.notifications = this.notifications.filter(n => n.id !== id);
  }

  trackById(index: number, item: Notification): number {
    return item.id;
  }
}

