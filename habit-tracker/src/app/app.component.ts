/**
 * App Component
 * 
 * The root component of the application.
 * Contains the main layout with navigation and user switcher.
 */

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StorageService } from './core/services/storage.service';
import { HabitService } from './core/services/habit.service';
import { UserService } from './core/services/user.service';
import { User } from './core/models/habit.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Habit Tracker';

  constructor(
    private router: Router,
    private storageService: StorageService,
    private habitService: HabitService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Initialize user service (creates default users if needed)
    // Check and reset streaks for missed days on app load
    this.habitService.checkAndResetStreaks();
  }

  // Navigation methods for bottom nav
  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  isActive(route: string): boolean {
    return this.router.url === route || 
           (route === '/' && this.router.url === '');
  }

  // Handle user switch
  onUserChanged(user: User): void {
    // Refresh the current page to load new user's data
    const currentUrl = this.router.url;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]);
    });
  }
}
