import { ParentalSettings, UserProgress } from '../types/news';

export function calculateRemainingSeconds(
  allowedMinutes: number,
  spentSeconds: number
): number {
  const totalAllowedSeconds = Math.max(0, allowedMinutes * 60);
  return Math.max(0, totalAllowedSeconds - spentSeconds);
}

export function isSessionExpired(
  allowedMinutes: number,
  spentSeconds: number
): boolean {
  if (allowedMinutes <= 0) return false; // 0 means unlimited
  return calculateRemainingSeconds(allowedMinutes, spentSeconds) === 0;
}

export function isWarningTimeReached(
  allowedMinutes: number,
  spentSeconds: number,
  warningMinutesBefore: number = 2
): boolean {
  if (allowedMinutes <= 0) return false;
  const remaining = calculateRemainingSeconds(allowedMinutes, spentSeconds);
  const warningThresholdSeconds = warningMinutesBefore * 60;
  return remaining > 0 && remaining <= warningThresholdSeconds;
}

export function formatTimeDisplay(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export function verifyParentPin(entered: string, correctPin: string): boolean {
  return entered.trim() === correctPin.trim();
}

export function verifyAdultChallenge(num1: number, num2: number, answer: number): boolean {
  return num1 * num2 === answer || num1 + num2 === answer;
}

export function computeStarsCount(completedActivities: number[]): number {
  const unique = new Set(completedActivities);
  return Math.min(5, unique.size);
}

export function determineEarnedBadges(progress: UserProgress): string[] {
  const badges: string[] = ['curieux-debutant'];
  if (progress.completedActivities.includes(1)) {
    badges.push('super-spectateur');
  }
  if (progress.completedActivities.includes(2)) {
    badges.push('oreille-magique');
  }
  if (progress.completedActivities.includes(3)) {
    badges.push('ami-des-animaux');
  }
  if (progress.completedActivities.includes(4)) {
    badges.push('chasseur-de-mysteres');
  }
  if (progress.completedActivities.includes(5)) {
    badges.push('roi-des-etoiles');
  }
  if (progress.starsEarned >= 5) {
    badges.push('champion-du-jour');
  }
  if (progress.wordsDiscovered && progress.wordsDiscovered.length >= 3) {
    badges.push('explorateur-des-mots');
  }
  return badges;
}
