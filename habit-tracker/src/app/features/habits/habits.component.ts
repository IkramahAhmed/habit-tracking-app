/**
 * Habits List Component
 * 
 * Shows all habits with filtering and sorting options.
 * Entry point to habit management.
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HabitService } from '../../core/services/habit.service';
import { StreakService } from '../../core/services/streak.service';
import { Habit, DailyStatus, HabitCategory } from '../../core/models/habit.model';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../../core/models/constants';
import { HabitCardComponent } from '../../shared/components/habit-card/habit-card.component';

@Component({
  selector: 'app-habits',
  standalone: true,
  imports: [CommonModule, FormsModule, HabitCardComponent],
  template: `
    <div class="habits-page">
      <header class="page-header">
        <button class="back-btn" (click)="goBack()">← Back</button>
        <h1>Your Habits</h1>
        <button class="add-btn" (click)="goToAddHabit()">+ Add</button>
      </header>

      <!-- Filters -->
      <div class="filters">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search habits..."
            [(ngModel)]="searchQuery"
            (ngModelChange)="filterHabits()"
          >
        </div>
        
        <div class="filter-chips">
          <button 
            class="chip" 
            [class.active]="selectedCategory === 'all'"
            (click)="filterByCategory('all')"
          >
            All
          </button>
          <button 
            *ngFor="let cat of categories"
            class="chip" 
            [class.active]="selectedCategory === cat"
            [style.--chip-color]="getCategoryColor(cat)"
            (click)="filterByCategory(cat)"
          >
            {{ getCategoryIcon(cat) }} {{ cat | titlecase }}
          </button>
        </div>
      </div>

      <!-- Sort Options -->
      <div class="sort-options">
        <span>Sort by:</span>
        <select [(ngModel)]="sortBy" (ngModelChange)="sortHabits()">
          <option value="name">Name</option>
          <option value="streak">Streak</option>
          <option value="points">Points</option>
          <option value="created">Recent</option>
        </select>
      </div>

      <!-- Habits List -->
      <div class="habits-list" *ngIf="filteredHabits.length > 0">
        <app-habit-card
          *ngFor="let habit of filteredHabits"
          [habit]="habit"
          [todayStatus]="getTodayStatus(habit)"
          [freezeAvailable]="isFreezeAvailable(habit)"
          (checkIn)="openCheckIn($event)"
          (edit)="editHabit($event)"
          (delete)="deleteHabit($event)"
          (freeze)="useFreeze($event)"
        ></app-habit-card>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="filteredHabits.length === 0 && habits.length > 0">
        <span class="empty-icon">🔍</span>
        <h3>No habits found</h3>
        <p>Try a different search or filter</p>
      </div>

      <div class="empty-state" *ngIf="habits.length === 0">
        <span class="empty-icon">🎯</span>
        <h3>No habits yet!</h3>
        <p>Start your journey by creating your first habit</p>
        <button class="primary-btn" (click)="goToAddHabit()">
          Create Your First Habit
        </button>
      </div>
    </div>
  `,
  styles: [`
    .habits-page {
      padding: 1.5rem;
      max-width: 800px;
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
      padding: 0.5rem;
    }

    .add-btn {
      padding: 0.5rem 1rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 8px;
      color: #fff;
      font-weight: 600;
      cursor: pointer;
    }

    .filters {
      margin-bottom: 1rem;
    }

    .search-box {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      background: var(--card-bg, #1a1a2e);
      border-radius: 12px;
      border: 1px solid var(--border-color, #333);
      margin-bottom: 1rem;
    }

    .search-icon {
      font-size: 1rem;
    }

    .search-box input {
      flex: 1;
      background: none;
      border: none;
      color: var(--text-primary, #fff);
      font-size: 1rem;
      outline: none;
    }

    .search-box input::placeholder {
      color: var(--text-secondary, #a0a0a0);
    }

    .filter-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .chip {
      padding: 0.5rem 1rem;
      background: var(--card-bg, #1a1a2e);
      border: 1px solid var(--border-color, #333);
      border-radius: 20px;
      color: var(--text-secondary, #a0a0a0);
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .chip:hover {
      border-color: var(--chip-color, #667eea);
    }

    .chip.active {
      background: var(--chip-color, #667eea);
      border-color: var(--chip-color, #667eea);
      color: #fff;
    }

    .sort-options {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
      font-size: 0.9rem;
      color: var(--text-secondary, #a0a0a0);
    }

    .sort-options select {
      padding: 0.5rem 1rem;
      background: var(--card-bg, #1a1a2e);
      border: 1px solid var(--border-color, #333);
      border-radius: 8px;
      color: var(--text-primary, #fff);
      font-size: 0.9rem;
      cursor: pointer;
    }

    .habits-list {
      display: flex;
      flex-direction: column;
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
    }
  `]
})
export class HabitsComponent implements OnInit {
  habits: Habit[] = [];
  filteredHabits: Habit[] = [];
  searchQuery = '';
  selectedCategory: string = 'all';
  sortBy = 'created';
  
  categories: HabitCategory[] = ['health', 'fitness', 'mindfulness', 'productivity', 'social', 'learning', 'finance', 'other'];

  constructor(
    private router: Router,
    private habitService: HabitService,
    private streakService: StreakService
  ) {}

  ngOnInit(): void {
    this.habitService.habits$.subscribe(habits => {
      this.habits = habits;
      this.filterHabits();
    });
  }

  filterHabits(): void {
    let result = [...this.habits];

    // Search filter
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(h => 
        h.name.toLowerCase().includes(query) ||
        h.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (this.selectedCategory !== 'all') {
      result = result.filter(h => h.category === this.selectedCategory);
    }

    this.filteredHabits = result;
    this.sortHabits();
  }

  sortHabits(): void {
    this.filteredHabits.sort((a, b) => {
      switch (this.sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'streak':
          return b.currentStreak - a.currentStreak;
        case 'points':
          return b.totalPoints - a.totalPoints;
        case 'created':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });
  }

  filterByCategory(category: string): void {
    this.selectedCategory = category;
    this.filterHabits();
  }

  getCategoryColor(category: string): string {
    return CATEGORY_COLORS[category] || CATEGORY_COLORS['other'];
  }

  getCategoryIcon(category: string): string {
    return CATEGORY_ICONS[category] || CATEGORY_ICONS['other'];
  }

  getTodayStatus(habit: Habit): DailyStatus | undefined {
    return this.habitService.getTodayStatus(habit);
  }

  isFreezeAvailable(habit: Habit): boolean {
    return this.streakService.isStreakFreezeAvailable(habit);
  }

  // Navigation
  goBack(): void {
    this.router.navigate(['/']);
  }

  goToAddHabit(): void {
    this.router.navigate(['/habits', 'new']);
  }

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
    } else {
      alert('Streak freeze already used this week.');
    }
  }
}

