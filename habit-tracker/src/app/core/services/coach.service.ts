/**
 * Coach Service - Rule-Based AI Habit Coach
 * 
 * This service provides personalized coaching advice WITHOUT using external APIs.
 * It uses rule-based logic to analyze user data and generate helpful recommendations.
 * 
 * The coach considers:
 * - Habit name and type
 * - Daily value vs target
 * - User's mood
 * - Current and best streaks
 * - Points earned
 */

import { Injectable } from '@angular/core';
import { Habit, Mood, DailyStatus } from '../models/habit.model';
import { COACH_TIPS, HABIT_SUGGESTIONS } from '../models/constants';

// Structured advice output format
export interface CoachAdvice {
  title: string;
  advice: string[];
  motivation: string;
  actionSteps: string[];
  moodTip?: string;
  streakMessage?: string;
  icon: string;
}

export interface CoachMessage {
  type: 'tip' | 'encouragement' | 'warning' | 'celebration';
  message: string;
  icon: string;
}

// Replacement activities by category
interface ReplacementActivities {
  calming: string[];
  productive: string[];
  social: string[];
  physical: string[];
  creative: string[];
}

@Injectable({
  providedIn: 'root'
})
export class CoachService {
  
  // Replacement activities database
  private replacementActivities: ReplacementActivities = {
    calming: [
      'Take 5 deep breaths slowly',
      'Drink a glass of cold water',
      'Step outside for fresh air',
      'Listen to calming music for 5 minutes',
      'Do a 2-minute meditation',
      'Stretch your body gently',
      'Close your eyes and count to 20'
    ],
    productive: [
      'Read 5 pages of a book',
      'Organize your desk or room',
      'Write down 3 things you\'re grateful for',
      'Learn a new word or fact',
      'Plan tomorrow\'s tasks',
      'Clean one small area',
      'Review your goals'
    ],
    social: [
      'Send a positive message to a friend',
      'Call a family member',
      'Share a compliment with someone',
      'Write in a journal about your day',
      'Watch a funny video with someone'
    ],
    physical: [
      'Do 10 jumping jacks',
      'Take a 5-minute walk',
      'Do 10 pushups or squats',
      'Stretch for 3 minutes',
      'Dance to one song',
      'Take the stairs instead of elevator'
    ],
    creative: [
      'Doodle or sketch something',
      'Listen to a new song',
      'Write a short poem or note',
      'Take a photo of something beautiful',
      'Try a new recipe or snack'
    ]
  };

  // Motivational messages database
  private motivationalMessages = {
    general: [
      "Every small step counts. You're doing great!",
      "Progress, not perfection. Keep going!",
      "You're stronger than you think. Believe in yourself!",
      "Today's effort is tomorrow's strength.",
      "One day at a time. You've got this!",
      "Your future self will thank you for this.",
      "Small changes lead to big results.",
      "You're building something amazing. Don't stop now!"
    ],
    streakLow: [
      "Every expert was once a beginner. Start small!",
      "The journey of a thousand miles begins with one step.",
      "Don't compare your start to someone's middle.",
      "Building habits takes time. Be patient with yourself.",
      "Focus on showing up, not being perfect."
    ],
    streakHigh: [
      "You're on fire! Your consistency is inspiring!",
      "Look how far you've come. Amazing work!",
      "Champions are made through daily habits like yours.",
      "Your dedication is truly remarkable. Keep shining!",
      "You've proven you can do this. The sky is the limit!"
    ],
    moodSad: [
      "It's okay to have tough days. You're still making progress.",
      "Be gentle with yourself today. Tomorrow is a new day.",
      "Even on hard days, you showed up. That's courage.",
      "Your feelings are valid. Take it one moment at a time."
    ],
    moodStressed: [
      "Take a breath. You're handling this better than you think.",
      "Stress is temporary, but your strength is permanent.",
      "You've overcome challenges before. You'll overcome this too.",
      "Remember to take care of yourself. You matter."
    ],
    moodHappy: [
      "Your positive energy is contagious! Keep spreading joy!",
      "Happiness + habits = unstoppable! Go crush it!",
      "This is your moment. Make the most of it!",
      "Your smile can change the world. Keep shining!"
    ]
  };

  /**
   * Generate comprehensive daily advice based on user's habit data
   * This is the main AI Coach function
   */
  generateDailyAdvice(
    habit: Habit,
    dailyValue: number,
    mood: Mood,
    todayStatus?: DailyStatus
  ): CoachAdvice {
    const advice: string[] = [];
    const actionSteps: string[] = [];
    let title = 'Daily Coach Advice';
    let icon = '🧙';
    let moodTip: string | undefined;
    let streakMessage: string | undefined;

    const currentStreak = habit.currentStreak;
    const bestStreak = habit.bestStreak;
    const target = habit.targetValue;
    const isReduceHabit = habit.isReduceHabit;

    // ============ RULE 1: Check daily value vs target ============
    if (isReduceHabit) {
      // For reduce habits (like quit smoking)
      if (dailyValue > target) {
        advice.push(`You went over your target today (${dailyValue} vs ${target}). That's okay - tomorrow is a fresh start!`);
        advice.push(`Consider adjusting your target to ${target + 1} tomorrow to make it more achievable.`);
        actionSteps.push(this.getRandomItem(this.getReplacementForHabit(habit.name)));
        icon = '💪';
      } else if (dailyValue === 0) {
        advice.push(`Perfect! You completely avoided ${habit.name.toLowerCase()} today! 🎉`);
        icon = '🌟';
      } else if (dailyValue <= target) {
        advice.push(`Great job staying within your target! You're making real progress.`);
        icon = '✨';
      }
    } else {
      // For build habits (like exercise, reading)
      if (dailyValue < target) {
        const remaining = target - dailyValue;
        advice.push(`You're ${remaining} ${habit.targetUnit} away from your goal. You can still make it!`);
        actionSteps.push(`Try to add ${Math.ceil(remaining / 2)} more ${habit.targetUnit} right now`);
        icon = '🎯';
      } else if (dailyValue >= target) {
        advice.push(`You crushed your ${habit.name} goal today! Amazing work! 🏆`);
        if (dailyValue > target) {
          advice.push(`You exceeded your target by ${dailyValue - target} ${habit.targetUnit}!`);
        }
        icon = '🔥';
      }
    }

    // ============ RULE 2: Mood-based advice (Stressed) ============
    if (mood === 'Stressed') {
      title = 'Calm & Focus';
      moodTip = "I sense you're stressed. Let's handle this together.";
      
      advice.push("When stressed, habits feel harder. Be kind to yourself.");
      
      // Add calming activities
      actionSteps.push(this.getRandomItem(this.replacementActivities.calming));
      actionSteps.push(this.getRandomItem(this.replacementActivities.calming));
      
      icon = '🌿';
    }

    // ============ RULE 3: Mood-based advice (Sad/Bored mapped to Sad) ============
    if (mood === 'Sad') {
      title = 'Lift Your Spirits';
      moodTip = "Feeling down? Small wins can boost your mood.";
      
      advice.push("On tough days, even small progress is a victory.");
      
      // Add productive and creative activities
      actionSteps.push(this.getRandomItem(this.replacementActivities.productive));
      actionSteps.push(this.getRandomItem(this.replacementActivities.creative));
      
      icon = '💙';
    }

    // ============ RULE 4: Low streak advice (<= 3) ============
    if (currentStreak <= 3 && currentStreak > 0) {
      streakMessage = `${currentStreak} day${currentStreak > 1 ? 's' : ''} and counting! 🌱`;
      
      advice.push("You're in the crucial habit-building phase. Focus on showing up daily.");
      actionSteps.push("Set a specific time each day for this habit");
      actionSteps.push("Start with the minimum - consistency beats intensity");
      
      icon = '🌱';
    } else if (currentStreak === 0) {
      streakMessage = "Let's start a new streak today! 🚀";
      
      advice.push("Every streak starts with Day 1. Today can be your Day 1!");
      actionSteps.push("Make your habit so small you can't say no");
      
      icon = '🚀';
    }

    // ============ RULE 5: High streak advice (>= 7) ============
    if (currentStreak >= 7) {
      streakMessage = `🔥 ${currentStreak} days! You're on fire!`;
      
      if (currentStreak >= 30) {
        advice.push("A month-long streak! You've built a real habit. Consider leveling up your target!");
        icon = '👑';
      } else if (currentStreak >= 14) {
        advice.push("Two weeks strong! You're proving that consistency is your superpower.");
        icon = '💎';
      } else {
        advice.push("One week+ streak! You've built serious momentum. Keep it going!");
        icon = '⚡';
      }
      
      // Suggest increasing challenge
      if (isReduceHabit && target > 0) {
        actionSteps.push(`Challenge: Try reducing your target to ${Math.max(0, target - 1)} next week`);
      } else if (!isReduceHabit) {
        actionSteps.push(`Challenge: Try increasing your target by 10% next week`);
      }
    }

    // ============ RULE 6: Happy mood - capitalize on energy ============
    if (mood === 'Happy') {
      title = 'Ride the Wave!';
      moodTip = "Great mood detected! Perfect time to push a bit harder.";
      
      advice.push("Your positive energy is your secret weapon today!");
      actionSteps.push("Use this energy to tackle the hardest part first");
      
      icon = '☀️';
    }

    // ============ RULE 7: Best streak comparison ============
    if (currentStreak > 0 && bestStreak > currentStreak && (bestStreak - currentStreak) <= 3) {
      advice.push(`You're just ${bestStreak - currentStreak} day${bestStreak - currentStreak > 1 ? 's' : ''} away from beating your best streak!`);
      icon = '🏆';
    } else if (currentStreak > 0 && currentStreak === bestStreak) {
      advice.push("You're at your personal best! Every day now is a new record!");
      icon = '🥇';
    }

    // ============ Ensure we have at least 2-3 action steps ============
    while (actionSteps.length < 2) {
      const categories = ['calming', 'productive', 'physical'] as const;
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const newStep = this.getRandomItem(this.replacementActivities[randomCategory]);
      if (!actionSteps.includes(newStep)) {
        actionSteps.push(newStep);
      }
    }

    // Limit to 3 action steps
    const finalActionSteps = actionSteps.slice(0, 3);

    // ============ Get motivational message ============
    const motivation = this.getMotivationalMessage(mood, currentStreak);

    return {
      title,
      advice: advice.slice(0, 3), // Max 3 advice lines
      motivation,
      actionSteps: finalActionSteps,
      moodTip,
      streakMessage,
      icon
    };
  }

  /**
   * Get advice in the requested JSON format
   */
  getAdviceAsJSON(
    habit: Habit,
    dailyValue: number,
    mood: Mood,
    todayStatus?: DailyStatus
  ): {
    title: string;
    advice: string[];
    motivation: string;
  } {
    const fullAdvice = this.generateDailyAdvice(habit, dailyValue, mood, todayStatus);
    
    // Combine advice and action steps
    const combinedAdvice = [
      ...fullAdvice.advice,
      ...fullAdvice.actionSteps.map(step => `Action: ${step}`)
    ].slice(0, 4);

    return {
      title: fullAdvice.title,
      advice: combinedAdvice,
      motivation: fullAdvice.motivation
    };
  }

  /**
   * Get replacement activities specific to a habit
   */
  private getReplacementForHabit(habitName: string): string[] {
    const name = habitName.toLowerCase();
    
    if (name.includes('smok') || name.includes('cigarette')) {
      return [
        'Chew sugar-free gum instead',
        'Drink a glass of cold water',
        'Take 10 deep breaths',
        'Go for a 5-minute walk',
        'Squeeze a stress ball',
        'Eat a healthy snack like carrots',
        'Call a supportive friend'
      ];
    }
    
    if (name.includes('phone') || name.includes('screen') || name.includes('social')) {
      return [
        'Put your phone in another room',
        'Read a physical book instead',
        'Go outside for 10 minutes',
        'Do a quick workout',
        'Have a face-to-face conversation',
        'Write in a journal'
      ];
    }
    
    if (name.includes('junk') || name.includes('food') || name.includes('snack')) {
      return [
        'Drink a glass of water first',
        'Eat a piece of fruit instead',
        'Wait 10 minutes before eating',
        'Go for a short walk',
        'Chew gum',
        'Have a healthy alternative ready'
      ];
    }
    
    if (name.includes('sleep') || name.includes('bed')) {
      return [
        'Set a "wind down" alarm 1 hour before bed',
        'Put devices away 30 minutes early',
        'Read a book instead of scrolling',
        'Take a warm shower',
        'Do light stretching',
        'Dim the lights in your room'
      ];
    }
    
    // Default replacements
    return [
      ...this.replacementActivities.calming.slice(0, 2),
      ...this.replacementActivities.productive.slice(0, 2)
    ];
  }

  /**
   * Get motivational message based on mood and streak
   */
  private getMotivationalMessage(mood: Mood, streak: number): string {
    let messagePool: string[];
    
    if (mood === 'Stressed') {
      messagePool = this.motivationalMessages.moodStressed;
    } else if (mood === 'Sad') {
      messagePool = this.motivationalMessages.moodSad;
    } else if (mood === 'Happy') {
      messagePool = this.motivationalMessages.moodHappy;
    } else if (streak <= 3) {
      messagePool = this.motivationalMessages.streakLow;
    } else if (streak >= 7) {
      messagePool = this.motivationalMessages.streakHigh;
    } else {
      messagePool = this.motivationalMessages.general;
    }
    
    return this.getRandomItem(messagePool);
  }

  /**
   * Get random item from array
   */
  private getRandomItem<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  // ============ EXISTING METHODS (kept for compatibility) ============

  /**
   * Get a tip based on the current situation
   */
  getTip(situation: string, mood?: Mood): string {
    let tips = COACH_TIPS.find(t => t.situation === situation);
    
    if (mood) {
      const moodTips = COACH_TIPS.find(t => t.mood === mood);
      if (moodTips) {
        tips = moodTips;
      }
    }

    if (tips && tips.tips.length > 0) {
      return this.getRandomItem(tips.tips);
    }

    return "Keep going! Every small step counts.";
  }

  /**
   * Get coaching message based on habit status
   */
  getCoachMessage(habit: Habit, todayStatus?: DailyStatus): CoachMessage {
    const today = new Date().toISOString().split('T')[0];

    // New habit
    if (habit.dailyStatus.length === 0) {
      return {
        type: 'tip',
        message: this.getTip('new-habit'),
        icon: '💡'
      };
    }

    // Streak milestone
    const milestones = [3, 7, 14, 30, 60, 100];
    if (milestones.includes(habit.currentStreak)) {
      return {
        type: 'celebration',
        message: `🎉 Amazing! ${habit.currentStreak}-day streak! ${this.getTip('streak-milestone')}`,
        icon: '🏆'
      };
    }

    // Streak broken
    if (habit.currentStreak === 0 && habit.bestStreak > 0) {
      return {
        type: 'encouragement',
        message: this.getTip('streak-broken'),
        icon: '💪'
      };
    }

    // Mood-based tips
    if (todayStatus?.mood) {
      if (todayStatus.mood === 'Stressed' || todayStatus.mood === 'Sad') {
        return {
          type: 'tip',
          message: this.getTip(`mood-${todayStatus.mood.toLowerCase()}`, todayStatus.mood),
          icon: todayStatus.mood === 'Stressed' ? '🌿' : '💙'
        };
      }
      if (todayStatus.mood === 'Happy') {
        return {
          type: 'encouragement',
          message: this.getTip('mood-happy', 'Happy'),
          icon: '☀️'
        };
      }
    }

    // Time window active
    if (habit.timeWindow) {
      const now = new Date();
      const [startHour, startMin] = habit.timeWindow.start.split(':').map(Number);
      const [endHour, endMin] = habit.timeWindow.end.split(':').map(Number);
      
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const startMinutes = startHour * 60 + startMin;
      const endMinutes = endHour * 60 + endMin;

      if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
        return {
          type: 'tip',
          message: this.getTip('time-window-active'),
          icon: '⏰'
        };
      }
    }

    // Default
    return {
      type: 'tip',
      message: this.getDefaultTip(habit),
      icon: '✨'
    };
  }

  /**
   * Get replacement suggestion based on mood
   */
  getReplacementSuggestion(habitName: string, mood: Mood): string {
    const suggestion = HABIT_SUGGESTIONS.find(s => 
      s.name.toLowerCase() === habitName.toLowerCase()
    );

    if (!suggestion) {
      return this.getMoodBasedReplacement(mood);
    }

    const replacements = suggestion.suggestedReplacements;
    
    switch (mood) {
      case 'Stressed':
        const calmingOptions = replacements.filter(r => 
          r.toLowerCase().includes('breath') || 
          r.toLowerCase().includes('walk') ||
          r.toLowerCase().includes('water')
        );
        return calmingOptions.length > 0 ? calmingOptions[0] : replacements[0];
      
      case 'Sad':
        const upliftingOptions = replacements.filter(r =>
          r.toLowerCase().includes('talk') ||
          r.toLowerCase().includes('call') ||
          r.toLowerCase().includes('outside')
        );
        return upliftingOptions.length > 0 ? upliftingOptions[0] : replacements[0];
      
      case 'Happy':
        return replacements[replacements.length - 1] || replacements[0];
      
      default:
        return replacements[0];
    }
  }

  /**
   * Get mood-based generic replacement
   */
  private getMoodBasedReplacement(mood: Mood): string {
    const moodReplacements = {
      Happy: 'Challenge yourself with something new!',
      Sad: 'Take a short walk or call a friend',
      Stressed: 'Take 5 deep breaths',
      Neutral: 'Drink a glass of water'
    };
    return moodReplacements[mood];
  }

  /**
   * Get default tip for a habit
   */
  private getDefaultTip(habit: Habit): string {
    const defaultTips = [
      `You've got this! Keep working on "${habit.name}"`,
      `Small progress is still progress with "${habit.name}"`,
      `Every day is a new chance to improve "${habit.name}"`,
      `Stay consistent with "${habit.name}" - results will follow!`,
      `Your dedication to "${habit.name}" is inspiring!`
    ];
    return this.getRandomItem(defaultTips);
  }

  /**
   * Get motivational quote for the day
   */
  getDailyMotivation(): string {
    const quotes = [
      "The secret of getting ahead is getting started. — Mark Twain",
      "We are what we repeatedly do. Excellence is not an act, but a habit. — Aristotle",
      "Success is the sum of small efforts repeated day in and day out. — Robert Collier",
      "Motivation gets you started. Habit keeps you going. — Jim Ryun",
      "The only way to do great work is to love what you do. — Steve Jobs",
      "It's not about perfect. It's about effort. — Jillian Michaels",
      "Small daily improvements lead to staggering long-term results.",
      "Don't watch the clock; do what it does. Keep going. — Sam Levenson",
      "The journey of a thousand miles begins with a single step. — Lao Tzu",
      "Believe you can and you're halfway there. — Theodore Roosevelt"
    ];

    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const index = dayOfYear % quotes.length;
    
    return quotes[index];
  }

  /**
   * Get streak-specific encouragement
   */
  getStreakEncouragement(streak: number): string {
    if (streak === 0) {
      return "Start your streak today! 🚀";
    } else if (streak < 3) {
      return `${streak} day${streak > 1 ? 's' : ''} down! Keep it going! 🌱`;
    } else if (streak < 7) {
      return `${streak} days! You're building momentum! 🔥`;
    } else if (streak < 14) {
      return `${streak} days! One week+ champion! ⚡`;
    } else if (streak < 30) {
      return `${streak} days! You're unstoppable! 🏆`;
    } else if (streak < 60) {
      return `${streak} days! Monthly master! 👑`;
    } else {
      return `${streak} days! LEGENDARY! 💎`;
    }
  }
}
