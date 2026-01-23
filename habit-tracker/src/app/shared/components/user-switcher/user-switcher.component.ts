/**
 * User Switcher Component
 * 
 * Allows switching between users.
 * Shows current user and dropdown to select others.
 */

import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { User } from '../../../core/models/habit.model';

@Component({
  selector: 'app-user-switcher',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="user-switcher">
      <!-- Current User Display -->
      <div class="current-user" (click)="toggleDropdown()" *ngIf="currentUser">
        <div 
          class="user-avatar"
          [style.background]="currentUser.profile.color"
        >
          {{ currentUser.profile.avatar }}
        </div>
        <div class="user-info">
          <span class="user-name">{{ currentUser.profile.name }}</span>
          <span class="user-points">{{ currentUser.profile.totalPoints }} pts</span>
        </div>
        <span class="dropdown-arrow">{{ isOpen ? '▲' : '▼' }}</span>
      </div>

      <!-- Dropdown -->
      <div class="dropdown" *ngIf="isOpen">
        <div class="dropdown-header">Switch User</div>
        
        <div 
          class="user-option"
          *ngFor="let user of users"
          [class.active]="user.id === currentUser?.id"
          (click)="selectUser(user)"
        >
          <div 
            class="user-avatar small"
            [style.background]="user.profile.color"
          >
            {{ user.profile.avatar }}
          </div>
          <div class="option-info">
            <span class="option-name">{{ user.profile.name }}</span>
            <span class="option-points">{{ user.profile.totalPoints }} pts</span>
          </div>
          <span class="check" *ngIf="user.id === currentUser?.id">✓</span>
        </div>

        <div class="dropdown-divider"></div>

        <!-- Edit Current User -->
        <div class="edit-section" *ngIf="isEditing">
          <input 
            type="text" 
            class="edit-input"
            [(ngModel)]="editName"
            placeholder="Enter name"
            (keyup.enter)="saveEdit()"
          >
          <div class="avatar-picker">
            <button 
              *ngFor="let avatar of availableAvatars"
              class="avatar-btn"
              [class.selected]="editAvatar === avatar"
              (click)="editAvatar = avatar"
            >
              {{ avatar }}
            </button>
          </div>
          <div class="edit-actions">
            <button class="cancel-btn" (click)="cancelEdit()">Cancel</button>
            <button class="save-btn" (click)="saveEdit()">Save</button>
          </div>
        </div>

        <button 
          class="edit-user-btn" 
          *ngIf="!isEditing"
          (click)="startEdit()"
        >
          ✏️ Edit Profile
        </button>
      </div>

      <!-- Overlay to close dropdown -->
      <div 
        class="overlay" 
        *ngIf="isOpen" 
        (click)="toggleDropdown()"
      ></div>
    </div>
  `,
  styles: [`
    .user-switcher {
      position: relative;
    }

    .current-user {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0.75rem;
      background: var(--card-bg, #1a1a2e);
      border: 1px solid var(--border-color, #333);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .current-user:hover {
      border-color: var(--accent-color, #667eea);
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
    }

    .user-avatar.small {
      width: 32px;
      height: 32px;
      font-size: 1rem;
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-weight: 600;
      color: var(--text-primary, #fff);
      font-size: 0.9rem;
    }

    .user-points {
      font-size: 0.75rem;
      color: var(--accent-color, #667eea);
    }

    .dropdown-arrow {
      color: var(--text-secondary, #a0a0a0);
      font-size: 0.7rem;
      margin-left: auto;
    }

    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 99;
    }

    .dropdown {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      right: 0;
      min-width: 220px;
      background: var(--card-bg, #1a1a2e);
      border: 1px solid var(--border-color, #333);
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      z-index: 100;
      overflow: hidden;
    }

    .dropdown-header {
      padding: 0.75rem 1rem;
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--text-secondary, #a0a0a0);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 1px solid var(--border-color, #333);
    }

    .user-option {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .user-option:hover {
      background: rgba(102, 126, 234, 0.1);
    }

    .user-option.active {
      background: rgba(102, 126, 234, 0.15);
    }

    .option-info {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .option-name {
      font-size: 0.9rem;
      color: var(--text-primary, #fff);
    }

    .option-points {
      font-size: 0.75rem;
      color: var(--text-secondary, #a0a0a0);
    }

    .check {
      color: var(--accent-color, #667eea);
      font-weight: bold;
    }

    .dropdown-divider {
      height: 1px;
      background: var(--border-color, #333);
      margin: 0.5rem 0;
    }

    .edit-section {
      padding: 1rem;
    }

    .edit-input {
      width: 100%;
      padding: 0.75rem;
      background: var(--bg-primary, #0f0f1a);
      border: 1px solid var(--border-color, #333);
      border-radius: 8px;
      color: var(--text-primary, #fff);
      font-size: 0.9rem;
      margin-bottom: 0.75rem;
    }

    .edit-input:focus {
      outline: none;
      border-color: var(--accent-color, #667eea);
    }

    .avatar-picker {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 0.5rem;
      margin-bottom: 0.75rem;
    }

    .avatar-btn {
      padding: 0.5rem;
      font-size: 1.25rem;
      background: var(--bg-primary, #0f0f1a);
      border: 2px solid transparent;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .avatar-btn:hover {
      border-color: var(--border-color, #333);
    }

    .avatar-btn.selected {
      border-color: var(--accent-color, #667eea);
      background: rgba(102, 126, 234, 0.1);
    }

    .edit-actions {
      display: flex;
      gap: 0.5rem;
    }

    .cancel-btn, .save-btn {
      flex: 1;
      padding: 0.5rem;
      border: none;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
    }

    .cancel-btn {
      background: var(--border-color, #333);
      color: var(--text-primary, #fff);
    }

    .save-btn {
      background: var(--accent-color, #667eea);
      color: #fff;
    }

    .edit-user-btn {
      display: block;
      width: 100%;
      padding: 0.75rem 1rem;
      background: none;
      border: none;
      text-align: left;
      color: var(--text-secondary, #a0a0a0);
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .edit-user-btn:hover {
      background: rgba(102, 126, 234, 0.1);
      color: var(--text-primary, #fff);
    }
  `]
})
export class UserSwitcherComponent implements OnInit {
  @Output() userChanged = new EventEmitter<User>();

  users: User[] = [];
  currentUser: User | null = null;
  isOpen = false;
  isEditing = false;
  
  editName = '';
  editAvatar = '';
  availableAvatars: string[] = [];

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userService.users$.subscribe(users => {
      this.users = users;
    });

    this.userService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });

    this.availableAvatars = this.userService.getAvailableAvatars();
  }

  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
    if (!this.isOpen) {
      this.isEditing = false;
    }
  }

  selectUser(user: User): void {
    this.userService.switchUser(user.id);
    this.userChanged.emit(user);
    this.isOpen = false;
    this.isEditing = false;
  }

  startEdit(): void {
    if (this.currentUser) {
      this.editName = this.currentUser.profile.name;
      this.editAvatar = this.currentUser.profile.avatar;
      this.isEditing = true;
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
  }

  saveEdit(): void {
    if (this.currentUser && this.editName.trim()) {
      this.userService.updateUserProfile(this.currentUser.id, {
        name: this.editName.trim(),
        avatar: this.editAvatar
      });
      this.isEditing = false;
    }
  }
}

