/**
 * Mood Selector Component
 * 
 * A simple component for selecting daily mood.
 * Uses emojis for easy, visual selection.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Mood } from '../../../core/models/habit.model';

interface MoodOption {
  value: Mood;
  emoji: string;
  label: string;
  color: string;
}

@Component({
  selector: 'app-mood-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="mood-selector">
      <p class="mood-label">How are you feeling?</p>
      <div class="mood-options">
        <button 
          *ngFor="let mood of moods"
          class="mood-btn"
          [class.selected]="selectedMood === mood.value"
          [style.--mood-color]="mood.color"
          (click)="selectMood(mood.value)"
          type="button"
        >
          <span class="emoji">{{ mood.emoji }}</span>
          <span class="label">{{ mood.label }}</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .mood-selector {
      padding: 1rem;
    }

    .mood-label {
      font-size: 0.9rem;
      color: var(--text-secondary, #a0a0a0);
      margin-bottom: 0.75rem;
      text-align: center;
    }

    .mood-options {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .mood-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      padding: 0.75rem 1rem;
      border: 2px solid var(--border-color, #333);
      border-radius: 12px;
      background: var(--card-bg, #1a1a2e);
      cursor: pointer;
      transition: all 0.2s ease;
      min-width: 70px;
    }

    .mood-btn:hover {
      border-color: var(--mood-color);
      transform: translateY(-2px);
    }

    .mood-btn.selected {
      border-color: var(--mood-color);
      background: color-mix(in srgb, var(--mood-color) 20%, transparent);
      box-shadow: 0 0 12px color-mix(in srgb, var(--mood-color) 40%, transparent);
    }

    .emoji {
      font-size: 1.5rem;
    }

    .label {
      font-size: 0.75rem;
      color: var(--text-secondary, #a0a0a0);
    }

    .mood-btn.selected .label {
      color: var(--mood-color);
      font-weight: 600;
    }
  `]
})
export class MoodSelectorComponent {
  @Input() selectedMood: Mood = 'Neutral';
  @Output() moodChange = new EventEmitter<Mood>();

  moods: MoodOption[] = [
    { value: 'Happy', emoji: '😊', label: 'Happy', color: '#4CAF50' },
    { value: 'Neutral', emoji: '😐', label: 'Neutral', color: '#9E9E9E' },
    { value: 'Sad', emoji: '😢', label: 'Sad', color: '#2196F3' },
    { value: 'Stressed', emoji: '😰', label: 'Stressed', color: '#FF5722' }
  ];

  selectMood(mood: Mood): void {
    this.selectedMood = mood;
    this.moodChange.emit(mood);
  }
}

