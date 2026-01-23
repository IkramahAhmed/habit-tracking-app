/**
 * Habit Form Component
 * 
 * Handles creating new habits and editing existing ones.
 * Features:
 * - Smart suggestions for quick setup
 * - Custom habit creation
 * - Time window configuration
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HabitService } from '../../core/services/habit.service';
import { Habit, HabitSuggestion, TargetOption, HabitCategory } from '../../core/models/habit.model';
import { HABIT_SUGGESTIONS, CATEGORY_COLORS, CATEGORY_ICONS } from '../../core/models/constants';

@Component({
  selector: 'app-habit-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="habit-form-page">
      <header class="page-header">
        <button class="back-btn" (click)="goBack()">← Back</button>
        <h1>{{ isEditMode ? 'Edit Habit' : 'New Habit' }}</h1>
        <div class="spacer"></div>
      </header>

      <!-- Suggestions (only for new habits) -->
      <section class="suggestions-section" *ngIf="!isEditMode && !showCustomForm">
        <h2>Quick Start with Suggestions</h2>
        <p class="section-desc">Choose a popular habit or create your own</p>
        
        <div class="suggestions-grid">
          <button 
            *ngFor="let suggestion of suggestions"
            class="suggestion-card"
            [style.--cat-color]="getCategoryColor(suggestion.category)"
            (click)="selectSuggestion(suggestion)"
          >
            <span class="suggestion-icon">{{ suggestion.icon }}</span>
            <span class="suggestion-name">{{ suggestion.name }}</span>
            <span class="suggestion-cat">{{ suggestion.category | titlecase }}</span>
          </button>
        </div>

        <div class="divider">
          <span>or</span>
        </div>

        <button class="custom-btn" (click)="showCustomForm = true">
          ✨ Create Custom Habit
        </button>
      </section>

      <!-- Habit Form -->
      <form class="habit-form" *ngIf="isEditMode || showCustomForm" (ngSubmit)="saveHabit()">
        <!-- Icon & Name -->
        <div class="form-section">
          <label class="form-label">Habit Icon & Name</label>
          <div class="icon-name-row">
            <button type="button" class="icon-picker" (click)="showIconPicker = !showIconPicker">
              {{ formData.icon }}
            </button>
            <input 
              type="text" 
              class="form-input" 
              placeholder="e.g., Quit Smoking"
              [(ngModel)]="formData.name"
              name="name"
              required
            >
          </div>
          
          <div class="icon-grid" *ngIf="showIconPicker">
            <button 
              type="button"
              *ngFor="let icon of iconOptions"
              class="icon-option"
              (click)="selectIcon(icon)"
            >
              {{ icon }}
            </button>
          </div>
        </div>

        <!-- Category -->
        <div class="form-section">
          <label class="form-label">Category</label>
          <div class="category-chips">
            <button 
              type="button"
              *ngFor="let cat of categories"
              class="category-chip"
              [class.selected]="formData.category === cat"
              [style.--cat-color]="getCategoryColor(cat)"
              (click)="formData.category = cat"
            >
              {{ getCategoryIcon(cat) }} {{ cat | titlecase }}
            </button>
          </div>
        </div>

        <!-- Habit Type -->
        <div class="form-section">
          <label class="form-label">Habit Type</label>
          <div class="type-toggle">
            <button 
              type="button"
              class="type-btn"
              [class.selected]="!formData.isReduceHabit"
              (click)="formData.isReduceHabit = false"
            >
              📈 Build Habit
              <span class="type-desc">Increase something (exercise, reading)</span>
            </button>
            <button 
              type="button"
              class="type-btn"
              [class.selected]="formData.isReduceHabit"
              (click)="formData.isReduceHabit = true"
            >
              📉 Break Habit
              <span class="type-desc">Reduce something (smoking, junk food)</span>
            </button>
          </div>
        </div>

        <!-- Target -->
        <div class="form-section">
          <label class="form-label">Daily Target</label>
          <div class="target-options" *ngIf="formData.targetOptions.length > 0">
            <button 
              type="button"
              *ngFor="let opt of formData.targetOptions"
              class="target-btn"
              [class.selected]="formData.targetValue === opt.value"
              (click)="formData.targetValue = opt.value"
            >
              {{ opt.label }}
            </button>
          </div>
          
          <div class="custom-target">
            <input 
              type="number" 
              class="form-input small"
              [(ngModel)]="formData.targetValue"
              name="targetValue"
              min="0"
              required
            >
            <input 
              type="text" 
              class="form-input"
              placeholder="unit (e.g., cigarettes, pages)"
              [(ngModel)]="formData.targetUnit"
              name="targetUnit"
              required
            >
          </div>
        </div>

        <!-- Replacement Action -->
        <div class="form-section">
          <label class="form-label">
            Replacement Action
            <span class="label-hint">What to do instead</span>
          </label>
          
          <div class="replacement-suggestions" *ngIf="selectedSuggestion?.suggestedReplacements">
            <button 
              type="button"
              *ngFor="let rep of selectedSuggestion!.suggestedReplacements"
              class="replacement-btn"
              [class.selected]="formData.replacement === rep"
              (click)="formData.replacement = rep"
            >
              {{ rep }}
            </button>
          </div>
          
          <input 
            type="text" 
            class="form-input"
            placeholder="e.g., Drink water, Take a walk"
            [(ngModel)]="formData.replacement"
            name="replacement"
            required
          >
        </div>

        <!-- Time Window (Optional) -->
        <div class="form-section">
          <label class="form-label">
            Time Window (Optional)
            <span class="label-hint">When to focus on this habit</span>
          </label>
          
          <div class="toggle-row">
            <span>Enable time window</span>
            <label class="toggle">
              <input 
                type="checkbox" 
                [(ngModel)]="hasTimeWindow"
                name="hasTimeWindow"
              >
              <span class="toggle-slider"></span>
            </label>
          </div>
          
          <div class="time-inputs" *ngIf="hasTimeWindow">
            <div class="time-field">
              <label>Start</label>
              <input 
                type="time" 
                class="form-input"
                [(ngModel)]="formData.timeWindowStart"
                name="timeWindowStart"
              >
            </div>
            <div class="time-field">
              <label>End</label>
              <input 
                type="time" 
                class="form-input"
                [(ngModel)]="formData.timeWindowEnd"
                name="timeWindowEnd"
              >
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="form-actions">
          <button type="button" class="cancel-btn" (click)="goBack()">
            Cancel
          </button>
          <button type="submit" class="submit-btn" [disabled]="!isFormValid()">
            {{ isEditMode ? 'Save Changes' : 'Create Habit' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .habit-form-page {
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

    .suggestions-section {
      text-align: center;
    }

    .suggestions-section h2 {
      font-size: 1.25rem;
      color: var(--text-primary, #fff);
      margin: 0 0 0.5rem 0;
    }

    .section-desc {
      color: var(--text-secondary, #a0a0a0);
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
    }

    .suggestions-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    @media (min-width: 500px) {
      .suggestions-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    .suggestion-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1.25rem 0.75rem;
      background: var(--card-bg, #1a1a2e);
      border: 2px solid var(--border-color, #333);
      border-radius: 16px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .suggestion-card:hover {
      border-color: var(--cat-color, #667eea);
      transform: translateY(-2px);
    }

    .suggestion-icon {
      font-size: 2rem;
    }

    .suggestion-name {
      font-weight: 600;
      color: var(--text-primary, #fff);
      font-size: 0.85rem;
    }

    .suggestion-cat {
      font-size: 0.7rem;
      color: var(--cat-color, #667eea);
      background: rgba(102, 126, 234, 0.1);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
    }

    .divider {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin: 1.5rem 0;
      color: var(--text-secondary, #a0a0a0);
    }

    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--border-color, #333);
    }

    .custom-btn {
      width: 100%;
      padding: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 12px;
      color: #fff;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .custom-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .habit-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .form-section {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .form-label {
      font-weight: 600;
      color: var(--text-primary, #fff);
      font-size: 0.95rem;
    }

    .label-hint {
      font-weight: 400;
      color: var(--text-secondary, #a0a0a0);
      font-size: 0.8rem;
      margin-left: 0.5rem;
    }

    .icon-name-row {
      display: flex;
      gap: 0.75rem;
    }

    .icon-picker {
      width: 56px;
      height: 56px;
      font-size: 1.75rem;
      background: var(--card-bg, #1a1a2e);
      border: 2px solid var(--border-color, #333);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .icon-picker:hover {
      border-color: var(--accent-color, #667eea);
    }

    .icon-grid {
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 0.5rem;
      padding: 1rem;
      background: var(--card-bg, #1a1a2e);
      border-radius: 12px;
      border: 1px solid var(--border-color, #333);
    }

    .icon-option {
      padding: 0.5rem;
      font-size: 1.25rem;
      background: none;
      border: none;
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.2s ease;
    }

    .icon-option:hover {
      background: var(--border-color, #333);
    }

    .form-input {
      padding: 0.875rem 1rem;
      background: var(--card-bg, #1a1a2e);
      border: 1px solid var(--border-color, #333);
      border-radius: 12px;
      color: var(--text-primary, #fff);
      font-size: 1rem;
      flex: 1;
    }

    .form-input:focus {
      outline: none;
      border-color: var(--accent-color, #667eea);
    }

    .form-input.small {
      width: 100px;
      flex: 0;
    }

    .category-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .category-chip {
      padding: 0.5rem 1rem;
      background: var(--card-bg, #1a1a2e);
      border: 2px solid var(--border-color, #333);
      border-radius: 20px;
      color: var(--text-secondary, #a0a0a0);
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .category-chip:hover {
      border-color: var(--cat-color, #667eea);
    }

    .category-chip.selected {
      background: var(--cat-color, #667eea);
      border-color: var(--cat-color, #667eea);
      color: #fff;
    }

    .type-toggle {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    @media (min-width: 500px) {
      .type-toggle {
        flex-direction: row;
      }
    }

    .type-btn {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1.25rem;
      background: var(--card-bg, #1a1a2e);
      border: 2px solid var(--border-color, #333);
      border-radius: 12px;
      color: var(--text-primary, #fff);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .type-btn:hover {
      border-color: var(--accent-color, #667eea);
    }

    .type-btn.selected {
      border-color: var(--accent-color, #667eea);
      background: rgba(102, 126, 234, 0.1);
    }

    .type-desc {
      font-size: 0.75rem;
      font-weight: 400;
      color: var(--text-secondary, #a0a0a0);
    }

    .target-options {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .target-btn {
      padding: 0.5rem 1rem;
      background: var(--card-bg, #1a1a2e);
      border: 1px solid var(--border-color, #333);
      border-radius: 8px;
      color: var(--text-secondary, #a0a0a0);
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .target-btn.selected {
      border-color: var(--accent-color, #667eea);
      color: var(--accent-color, #667eea);
      background: rgba(102, 126, 234, 0.1);
    }

    .custom-target {
      display: flex;
      gap: 0.75rem;
    }

    .replacement-suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }

    .replacement-btn {
      padding: 0.4rem 0.75rem;
      background: var(--card-bg, #1a1a2e);
      border: 1px solid var(--border-color, #333);
      border-radius: 16px;
      color: var(--text-secondary, #a0a0a0);
      font-size: 0.8rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .replacement-btn.selected {
      border-color: #4CAF50;
      color: #4CAF50;
      background: rgba(76, 175, 80, 0.1);
    }

    .toggle-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      background: var(--card-bg, #1a1a2e);
      border-radius: 12px;
      border: 1px solid var(--border-color, #333);
    }

    .toggle {
      position: relative;
      width: 48px;
      height: 26px;
    }

    .toggle input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .toggle-slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: var(--border-color, #333);
      border-radius: 26px;
      transition: 0.3s;
    }

    .toggle-slider::before {
      position: absolute;
      content: "";
      height: 20px;
      width: 20px;
      left: 3px;
      bottom: 3px;
      background: white;
      border-radius: 50%;
      transition: 0.3s;
    }

    .toggle input:checked + .toggle-slider {
      background: var(--accent-color, #667eea);
    }

    .toggle input:checked + .toggle-slider::before {
      transform: translateX(22px);
    }

    .time-inputs {
      display: flex;
      gap: 1rem;
      margin-top: 0.75rem;
    }

    .time-field {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .time-field label {
      font-size: 0.8rem;
      color: var(--text-secondary, #a0a0a0);
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }

    .cancel-btn {
      flex: 1;
      padding: 1rem;
      background: var(--card-bg, #1a1a2e);
      border: 1px solid var(--border-color, #333);
      border-radius: 12px;
      color: var(--text-primary, #fff);
      font-weight: 600;
      cursor: pointer;
    }

    .submit-btn {
      flex: 2;
      padding: 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 12px;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }

    .submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  `]
})
export class HabitFormComponent implements OnInit {
  isEditMode = false;
  showCustomForm = false;
  showIconPicker = false;
  hasTimeWindow = false;
  
  suggestions = HABIT_SUGGESTIONS;
  selectedSuggestion: HabitSuggestion | null = null;
  
  categories: HabitCategory[] = ['health', 'fitness', 'mindfulness', 'productivity', 'social', 'learning', 'finance', 'other'];
  
  iconOptions = ['🎯', '💪', '🏃', '📚', '🧘', '💧', '🚭', '😴', '💰', '🎨', '🎵', '✍️', '🍎', '🥗', '🧠', '❤️'];
  
  formData = {
    name: '',
    icon: '🎯',
    category: 'health' as HabitCategory,
    isReduceHabit: false,
    targetOptions: [] as TargetOption[],
    targetValue: 0,
    targetUnit: '',
    replacement: '',
    timeWindowStart: '09:00',
    timeWindowEnd: '21:00'
  };

  private editingHabitId: number | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private habitService: HabitService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    
    if (id && id !== 'new') {
      this.isEditMode = true;
      this.showCustomForm = true;
      this.editingHabitId = parseInt(id, 10);
      this.loadHabit(this.editingHabitId);
    }
  }

  loadHabit(id: number): void {
    const habit = this.habitService.getHabitById(id);
    if (habit) {
      this.formData = {
        name: habit.name,
        icon: habit.icon,
        category: habit.category,
        isReduceHabit: habit.isReduceHabit,
        targetOptions: habit.targetOptions,
        targetValue: habit.targetValue,
        targetUnit: habit.targetUnit,
        replacement: habit.replacement,
        timeWindowStart: habit.timeWindow?.start || '09:00',
        timeWindowEnd: habit.timeWindow?.end || '21:00'
      };
      this.hasTimeWindow = !!habit.timeWindow;
    }
  }

  selectSuggestion(suggestion: HabitSuggestion): void {
    this.selectedSuggestion = suggestion;
    this.showCustomForm = true;
    
    this.formData = {
      name: suggestion.name,
      icon: suggestion.icon,
      category: suggestion.category,
      isReduceHabit: suggestion.isReduceHabit,
      targetOptions: suggestion.targetOptions,
      targetValue: suggestion.defaultTarget,
      targetUnit: suggestion.targetUnit,
      replacement: suggestion.suggestedReplacements[0],
      timeWindowStart: '09:00',
      timeWindowEnd: '21:00'
    };
  }

  selectIcon(icon: string): void {
    this.formData.icon = icon;
    this.showIconPicker = false;
  }

  getCategoryColor(category: string): string {
    return CATEGORY_COLORS[category] || CATEGORY_COLORS['other'];
  }

  getCategoryIcon(category: string): string {
    return CATEGORY_ICONS[category] || CATEGORY_ICONS['other'];
  }

  isFormValid(): boolean {
    return !!(
      this.formData.name &&
      this.formData.targetValue >= 0 &&
      this.formData.targetUnit &&
      this.formData.replacement
    );
  }

  saveHabit(): void {
    if (!this.isFormValid()) return;

    const timeWindow = this.hasTimeWindow ? {
      start: this.formData.timeWindowStart,
      end: this.formData.timeWindowEnd
    } : undefined;

    if (this.isEditMode && this.editingHabitId) {
      // Update existing habit
      const existingHabit = this.habitService.getHabitById(this.editingHabitId);
      if (existingHabit) {
        const updatedHabit: Habit = {
          ...existingHabit,
          name: this.formData.name,
          icon: this.formData.icon,
          category: this.formData.category,
          isReduceHabit: this.formData.isReduceHabit,
          targetOptions: this.formData.targetOptions,
          targetValue: this.formData.targetValue,
          targetUnit: this.formData.targetUnit,
          replacement: this.formData.replacement,
          timeWindow
        };
        this.habitService.updateHabit(updatedHabit);
      }
    } else {
      // Create new habit
      this.habitService.createCustomHabit(
        this.formData.name,
        this.formData.targetOptions,
        this.formData.targetValue,
        this.formData.targetUnit,
        this.formData.isReduceHabit,
        this.formData.replacement,
        this.formData.category,
        this.formData.icon,
        timeWindow
      );
    }

    this.router.navigate(['/habits']);
  }

  goBack(): void {
    if (this.showCustomForm && !this.isEditMode) {
      this.showCustomForm = false;
      this.selectedSuggestion = null;
    } else {
      this.router.navigate(['/habits']);
    }
  }
}

