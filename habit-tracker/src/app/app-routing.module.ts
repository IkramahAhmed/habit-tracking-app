/**
 * App Routing Module
 * 
 * Defines all the routes for the application.
 * 
 * Why routing?
 * - Allows navigation between different pages
 * - Enables deep linking (bookmarking specific pages)
 * - Keeps the app organized with separate views
 */

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Import all feature components
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { HabitsComponent } from './features/habits/habits.component';
import { HabitFormComponent } from './features/habits/habit-form.component';
import { HabitCheckinComponent } from './features/habits/habit-checkin.component';
import { LeaderboardComponent } from './features/leaderboard/leaderboard.component';
import { ChallengesComponent } from './features/challenges/challenges.component';
import { CompareComponent } from './features/compare/compare.component';

const routes: Routes = [
  // Home / Dashboard
  { 
    path: '', 
    component: DashboardComponent,
    title: 'Dashboard - Habit Tracker'
  },
  
  // Habits List
  { 
    path: 'habits', 
    component: HabitsComponent,
    title: 'My Habits - Habit Tracker'
  },
  
  // Create New Habit
  { 
    path: 'habits/new', 
    component: HabitFormComponent,
    title: 'New Habit - Habit Tracker'
  },
  
  // Edit Habit
  { 
    path: 'habits/:id/edit', 
    component: HabitFormComponent,
    title: 'Edit Habit - Habit Tracker'
  },
  
  // Daily Check-in
  { 
    path: 'habits/:id/checkin', 
    component: HabitCheckinComponent,
    title: 'Check-in - Habit Tracker'
  },
  
  // Leaderboard & Badges
  { 
    path: 'leaderboard', 
    component: LeaderboardComponent,
    title: 'Leaderboard - Habit Tracker'
  },
  
  // Challenges
  { 
    path: 'challenges', 
    component: ChallengesComponent,
    title: 'Challenges - Habit Tracker'
  },
  
  // User Comparison / Battle
  { 
    path: 'compare', 
    component: CompareComponent,
    title: 'Battle - Habit Tracker'
  },
  
  // Redirect unknown routes to dashboard
  { 
    path: '**', 
    redirectTo: '' 
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
