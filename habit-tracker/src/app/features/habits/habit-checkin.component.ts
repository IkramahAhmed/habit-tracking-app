/**
 * Habit Check-in Component
 * 
 * Daily check-in flow for recording habit progress.
 * Includes:
 * - Mood selection
 * - Progress input
 * - Replacement action confirmation
 * - Instant feedback
 */

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HabitService } from '../../core/services/habit.service';
import { PointsService } from '../../core/services/points.service';
import { StreakService } from '../../core/services/streak.service';
import { CoachService } from '../../core/services/coach.service';
import { ChallengeService } from '../../core/services/challenge.service';
import { Habit, Mood, Badge } from '../../core/models/habit.model';
import { MoodSelectorComponent } from '../../shared/components/mood-selector/mood-selector.component';
import { CoachTipComponent } from '../../shared/components/coach-tip/coach-tip.component';
import { BadgeComponent } from '../../shared/components/badge/badge.component';
import { CoachAdviceComponent } from '../../shared/components/coach-advice/coach-advice.component';

@Component({
  selector: 'app-habit-checkin',
  standalone: true,
  imports: [CommonModule, FormsModule, MoodSelectorComponent, CoachTipComponent, BadgeComponent, CoachAdviceComponent],
  template: `
    <div class="checkin-page" *ngIf="habit">
      <header class="page-header">
        <button class="back-btn" (click)="goBack()">← Back</button>
        <h1>Daily Check-in</h1>
        <div class="spacer"></div>
      </header>

      <!-- Habit Info -->
      <div class="habit-header">
        <div class="habit-icon">{{ habit.icon }}</div>
        <div class="habit-info">
          <h2>{{ habit.name }}</h2>
          <p>Target: {{ habit.isReduceHabit ? 'Max ' : '' }}{{ habit.targetValue }} {{ habit.targetUnit }}/day</p>
        </div>
        <div class="streak-info" *ngIf="habit.currentStreak > 0">
          <span class="fire">🔥</span>
          <span>{{ habit.currentStreak }} day streak</span>
        </div>
      </div>

      <!-- Already Completed -->
      <div class="already-done" *ngIf="alreadyCompleted">
        <span class="check-icon">✅</span>
        <h3>Already checked in today!</h3>
        <p>You've already recorded your progress for today.</p>
        <button class="primary-btn" (click)="goBack()">Back to Dashboard</button>
      </div>

      <!-- Check-in Form -->
      <form class="checkin-form" *ngIf="!alreadyCompleted && !showResults" (ngSubmit)="submitCheckin()">
        <!-- Step 1: Mood -->
        <div class="step" [class.active]="currentStep === 1">
          <div class="step-header">
            <span class="step-number">1</span>
            <span class="step-title">How are you feeling today?</span>
          </div>
          <app-mood-selector 
            [selectedMood]="selectedMood"
            (moodChange)="onMoodChange($event)"
          ></app-mood-selector>
        </div>

        <!-- Coach Tip based on mood -->
        <div class="mood-tip" *ngIf="moodTip">
          <span class="tip-icon">💡</span>
          <p>{{ moodTip }}</p>
        </div>

        <!-- Step 2: Progress -->
        <div class="step" [class.active]="currentStep >= 2">
          <div class="step-header">
            <span class="step-number">2</span>
            <span class="step-title">Record your progress</span>
          </div>
          
          <div class="progress-input">
            <div class="input-group">
              <button 
                type="button" 
                class="adjust-btn"
                (click)="adjustValue(-1)"
                [disabled]="progressValue <= 0"
              >−</button>
              <input 
                type="number" 
                [(ngModel)]="progressValue"
                name="progressValue"
                min="0"
                class="value-input"
              >
              <button 
                type="button" 
                class="adjust-btn"
                (click)="adjustValue(1)"
              >+</button>
            </div>
            <span class="unit">{{ habit.targetUnit }}</span>
          </div>

          <div class="progress-feedback" [class.success]="isTargetMet()" [class.warning]="!isTargetMet()">
            <span *ngIf="isTargetMet()">✅ Target met! Great job!</span>
            <span *ngIf="!isTargetMet() && habit.isReduceHabit">
              ⚠️ {{ progressValue - habit.targetValue }} over target
            </span>
            <span *ngIf="!isTargetMet() && !habit.isReduceHabit">
              ⚠️ {{ habit.targetValue - progressValue }} more to reach target
            </span>
          </div>
        </div>

        <!-- Step 3: Replacement Action -->
        <div class="step" [class.active]="currentStep >= 3">
          <div class="step-header">
            <span class="step-number">3</span>
            <span class="step-title">Did you do the replacement action?</span>
          </div>
          
          <div class="replacement-card">
            <span class="replacement-icon">🔄</span>
            <span class="replacement-text">{{ habit.replacement }}</span>
          </div>

          <div class="replacement-buttons">
            <button 
              type="button"
              class="choice-btn yes"
              [class.selected]="replacementDone === true"
              (click)="replacementDone = true"
            >
              ✓ Yes, I did!
            </button>
            <button 
              type="button"
              class="choice-btn no"
              [class.selected]="replacementDone === false"
              (click)="replacementDone = false"
            >
              ✗ Not today
            </button>
          </div>

          <!-- Suggested replacement based on mood -->
          <div class="mood-replacement" *ngIf="moodReplacement && moodReplacement !== habit.replacement">
            <span class="suggestion-label">💡 Mood-based suggestion:</span>
            <span class="suggestion-text">{{ moodReplacement }}</span>
          </div>
        </div>

        <!-- Submit Button -->
        <button 
          type="submit" 
          class="submit-btn"
          [disabled]="!canSubmit()"
        >
          Complete Check-in
        </button>
      </form>

      <!-- Results Screen -->
      <div class="results-screen" *ngIf="showResults">
        <div class="results-animation" [class.success]="isTargetMet()">
          <span class="result-emoji">{{ isTargetMet() ? '🎉' : '💪' }}</span>
        </div>

        <h2>{{ isTargetMet() ? 'Amazing Work!' : 'Good Effort!' }}</h2>
        
        <div class="points-earned">
          <span class="points-label">Points Earned</span>
          <span class="points-value">+{{ pointsEarned }}</span>
        </div>

        <div class="streak-update" *ngIf="streakUpdated">
          <span class="fire">🔥</span>
          <span>{{ streakMessage }}</span>
        </div>

        <!-- New Badges -->
        <div class="new-badges" *ngIf="newBadges.length > 0">
          <h3>🏆 New Badge Unlocked!</h3>
          <div class="badges-list">
            <app-badge 
              *ngFor="let badge of newBadges" 
              [badge]="badge"
            ></app-badge>
          </div>
        </div>

        <!-- AI Coach Advice -->
        <app-coach-advice
          [habit]="habit"
          [dailyValue]="progressValue"
          [mood]="selectedMood"
          [autoExpand]="true"
        ></app-coach-advice>

        <button class="primary-btn" (click)="goBack()">
          Back to Dashboard
        </button>
      </div>
    </div>
  `,
  styles: [`
    .checkin-page {
      padding: 1.5rem;
      max-width: 500px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .page-header h1 {
      font-size: 1.25rem;
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

    .habit-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      background: var(--card-bg, #1a1a2e);
      border-radius: 16px;
      border: 1px solid var(--border-color, #333);
      margin-bottom: 1.5rem;
    }

    .habit-icon {
      width: 56px;
      height: 56px;
      font-size: 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .habit-info {
      flex: 1;
    }

    .habit-info h2 {
      font-size: 1.1rem;
      margin: 0 0 0.25rem 0;
      color: var(--text-primary, #fff);
    }

    .habit-info p {
      font-size: 0.85rem;
      margin: 0;
      color: var(--text-secondary, #a0a0a0);
    }

    .streak-info {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.8rem;
      color: var(--text-primary, #fff);
    }

    .fire {
      font-size: 1.5rem;
    }

    .already-done {
      text-align: center;
      padding: 3rem 1rem;
      background: var(--card-bg, #1a1a2e);
      border-radius: 16px;
      border: 1px solid #4CAF50;
    }

    .check-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 1rem;
    }

    .already-done h3 {
      color: var(--text-primary, #fff);
      margin: 0 0 0.5rem 0;
    }

    .already-done p {
      color: var(--text-secondary, #a0a0a0);
      margin: 0 0 1.5rem 0;
    }

    .checkin-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .step {
      padding: 1.25rem;
      background: var(--card-bg, #1a1a2e);
      border-radius: 16px;
      border: 1px solid var(--border-color, #333);
      opacity: 0.7;
      transition: all 0.3s ease;
    }

    .step.active {
      opacity: 1;
      border-color: var(--accent-color, #667eea);
    }

    .step-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .step-number {
      width: 28px;
      height: 28px;
      background: var(--accent-color, #667eea);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      font-weight: 600;
      color: #fff;
    }

    .step-title {
      font-weight: 600;
      color: var(--text-primary, #fff);
    }

    .mood-tip {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
      background: rgba(102, 126, 234, 0.1);
      border-radius: 12px;
      font-size: 0.9rem;
      color: var(--text-primary, #fff);
    }

    .mood-tip p {
      margin: 0;
    }

    .progress-input {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }

    .input-group {
      display: flex;
      align-items: center;
      background: var(--border-color, #333);
      border-radius: 12px;
      overflow: hidden;
    }

    .adjust-btn {
      width: 48px;
      height: 48px;
      background: none;
      border: none;
      color: var(--text-primary, #fff);
      font-size: 1.5rem;
      cursor: pointer;
      transition: background 0.2s;
    }

    .adjust-btn:hover:not(:disabled) {
      background: var(--accent-color, #667eea);
    }

    .adjust-btn:disabled {
      opacity: 0.3;
    }

    .value-input {
      width: 80px;
      text-align: center;
      background: none;
      border: none;
      color: var(--text-primary, #fff);
      font-size: 1.5rem;
      font-weight: 700;
    }

    .value-input:focus {
      outline: none;
    }

    .unit {
      color: var(--text-secondary, #a0a0a0);
      font-size: 0.9rem;
    }

    .progress-feedback {
      text-align: center;
      margin-top: 1rem;
      padding: 0.75rem;
      border-radius: 8px;
      font-size: 0.9rem;
    }

    .progress-feedback.success {
      background: rgba(76, 175, 80, 0.1);
      color: #4CAF50;
    }

    .progress-feedback.warning {
      background: rgba(255, 152, 0, 0.1);
      color: #FF9800;
    }

    .replacement-card {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 1rem;
      background: linear-gradient(135deg, #1a2e1a 0%, #162e16 100%);
      border-radius: 12px;
      margin-bottom: 1rem;
    }

    .replacement-icon {
      font-size: 1.25rem;
    }

    .replacement-text {
      font-weight: 600;
      color: #4CAF50;
    }

    .replacement-buttons {
      display: flex;
      gap: 1rem;
    }

    .choice-btn {
      flex: 1;
      padding: 1rem;
      border: 2px solid var(--border-color, #333);
      border-radius: 12px;
      background: var(--card-bg, #1a1a2e);
      color: var(--text-primary, #fff);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .choice-btn.yes.selected {
      border-color: #4CAF50;
      background: rgba(76, 175, 80, 0.1);
      color: #4CAF50;
    }

    .choice-btn.no.selected {
      border-color: #f44336;
      background: rgba(244, 67, 54, 0.1);
      color: #f44336;
    }

    .mood-replacement {
      margin-top: 1rem;
      padding: 0.75rem;
      background: rgba(255, 152, 0, 0.1);
      border-radius: 8px;
      font-size: 0.85rem;
    }

    .suggestion-label {
      color: #FF9800;
    }

    .suggestion-text {
      color: var(--text-primary, #fff);
      margin-left: 0.5rem;
    }

    .submit-btn {
      padding: 1rem 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 12px;
      color: #fff;
      font-weight: 600;
      font-size: 1rem;
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

    /* Results Screen */
    .results-screen {
      text-align: center;
      padding: 2rem 1rem;
    }

    .results-animation {
      width: 100px;
      height: 100px;
      margin: 0 auto 1.5rem;
      border-radius: 50%;
      background: var(--card-bg, #1a1a2e);
      display: flex;
      align-items: center;
      justify-content: center;
      animation: pop 0.5s ease;
    }

    .results-animation.success {
      background: linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%);
    }

    @keyframes pop {
      0% { transform: scale(0); }
      70% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }

    .result-emoji {
      font-size: 3rem;
    }

    .results-screen h2 {
      font-size: 1.5rem;
      color: var(--text-primary, #fff);
      margin: 0 0 1.5rem 0;
    }

    .points-earned {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      padding: 1.5rem;
      background: var(--card-bg, #1a1a2e);
      border-radius: 16px;
      border: 1px solid var(--border-color, #333);
      margin-bottom: 1rem;
    }

    .points-label {
      font-size: 0.85rem;
      color: var(--text-secondary, #a0a0a0);
    }

    .points-value {
      font-size: 2rem;
      font-weight: 700;
      color: #4CAF50;
    }

    .streak-update {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 1rem;
      background: linear-gradient(135deg, #ff6b35 0%, #f7931e 100%);
      border-radius: 12px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 1rem;
    }

    .new-badges {
      padding: 1.5rem;
      background: linear-gradient(135deg, #1a1a2e 0%, #2a1a3e 100%);
      border-radius: 16px;
      border: 1px solid #FFD700;
      margin-bottom: 1rem;
    }

    .new-badges h3 {
      margin: 0 0 1rem 0;
      color: #FFD700;
    }

    .badges-list {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .primary-btn {
      width: 100%;
      padding: 1rem 2rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 12px;
      color: #fff;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      margin-top: 1rem;
    }
  `]
})
export class HabitCheckinComponent implements OnInit {
  habit: Habit | null = null;
  alreadyCompleted = false;
  showResults = false;
  currentStep = 1;

  selectedMood: Mood = 'Neutral';
  progressValue = 0;
  replacementDone: boolean | null = null;

  moodTip: string = '';
  moodReplacement: string = '';

  // Results
  pointsEarned = 0;
  streakUpdated = false;
  streakMessage = '';
  newBadges: Badge[] = [];
  coachMessage: any = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private habitService: HabitService,
    private pointsService: PointsService,
    private streakService: StreakService,
    private coachService: CoachService,
    private challengeService: ChallengeService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadHabit(parseInt(id, 10));
    }
  }

  loadHabit(id: number): void {
    this.habit = this.habitService.getHabitById(id) || null;
    
    if (this.habit) {
      // Check if already completed today
      const todayStatus = this.habitService.getTodayStatus(this.habit);
      this.alreadyCompleted = !!todayStatus?.done;
      
      // Set initial progress value
      this.progressValue = todayStatus?.value || 0;
    }
  }

  onMoodChange(mood: Mood): void {
    this.selectedMood = mood;
    this.currentStep = 2;
    
    // Get mood-specific tip
    this.moodTip = this.coachService.getTip(`mood-${mood.toLowerCase()}`, mood);
    
    // Get mood-specific replacement suggestion
    if (this.habit) {
      this.moodReplacement = this.coachService.getReplacementSuggestion(
        this.habit.name, 
        mood
      );
    }
  }

  adjustValue(delta: number): void {
    this.progressValue = Math.max(0, this.progressValue + delta);
    this.currentStep = 3;
  }

  isTargetMet(): boolean {
    if (!this.habit) return false;
    
    if (this.habit.isReduceHabit) {
      return this.progressValue <= this.habit.targetValue;
    } else {
      return this.progressValue >= this.habit.targetValue;
    }
  }

  canSubmit(): boolean {
    return this.replacementDone !== null;
  }

  submitCheckin(): void {
    if (!this.habit || !this.canSubmit()) return;

    // Record the progress
    const result = this.habitService.recordDailyProgress(
      this.habit.id,
      this.progressValue,
      this.selectedMood,
      this.replacementDone!
    );

    // Calculate detailed points
    this.pointsEarned = this.pointsService.calculatePoints(
      result.habit,
      this.isTargetMet(),
      this.replacementDone!,
      this.selectedMood
    );

    // Update user profile points
    this.pointsService.addPointsToProfile(this.pointsEarned);

    // Check for badges
    const pointBadges = this.pointsService.checkPointsBadges();
    const streakBadges = this.streakService.checkStreakBadges(result.habit);
    this.newBadges = [...pointBadges, ...streakBadges];

    // Update challenges
    if (this.isTargetMet()) {
      this.challengeService.updateChallengeProgress('streak', 1);
    }
    if (this.replacementDone) {
      this.challengeService.updateChallengeProgress('replacement', 1);
    }

    // Set streak message
    this.streakUpdated = result.streakUpdated;
    if (this.streakUpdated) {
      this.streakMessage = this.coachService.getStreakEncouragement(result.habit.currentStreak);
    }

    // Get coach message
    this.coachMessage = this.coachService.getCoachMessage(result.habit);

    // Update local habit reference
    this.habit = result.habit;

    // Show results
    this.showResults = true;
  }

  goBack(): void {
    this.router.navigate(['/']);
  }
}

