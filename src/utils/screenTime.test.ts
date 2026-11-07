import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateRemainingSeconds,
  isSessionExpired,
  isWarningTimeReached,
  formatTimeDisplay,
  computeStarsCount,
  determineEarnedBadges
} from './screenTime';

test('calculateRemainingSeconds handles normal countdown', () => {
  assert.equal(calculateRemainingSeconds(15, 0), 900);
  assert.equal(calculateRemainingSeconds(15, 300), 600);
  assert.equal(calculateRemainingSeconds(15, 900), 0);
  assert.equal(calculateRemainingSeconds(15, 1200), 0); // clamp to 0
});

test('isSessionExpired triggers strictly when time is up', () => {
  assert.equal(isSessionExpired(15, 899), false);
  assert.equal(isSessionExpired(15, 900), true);
  assert.equal(isSessionExpired(15, 950), true);
  // Unlimited mode (0 minutes) never expires
  assert.equal(isSessionExpired(0, 9999), false);
});

test('isWarningTimeReached triggers when within warning window', () => {
  // 15 min total, 2 min warning threshold (120 seconds left)
  // At 13 min spent (780 sec), remaining is 120 sec -> true
  assert.equal(isWarningTimeReached(15, 780, 2), true);
  // At 14 min spent (840 sec), remaining is 60 sec -> true
  assert.equal(isWarningTimeReached(15, 840, 2), true);
  // At 10 min spent (600 sec), remaining is 300 sec -> false
  assert.equal(isWarningTimeReached(15, 600, 2), false);
  // When expired (900 sec), remaining is 0 -> false
  assert.equal(isWarningTimeReached(15, 900, 2), false);
});

test('formatTimeDisplay formats minutes and seconds with leading zero', () => {
  assert.equal(formatTimeDisplay(900), '15:00');
  assert.equal(formatTimeDisplay(65), '1:05');
  assert.equal(formatTimeDisplay(9), '0:09');
  assert.equal(formatTimeDisplay(0), '0:00');
});

test('computeStarsCount caps at 5 and counts unique completed activities', () => {
  assert.equal(computeStarsCount([]), 0);
  assert.equal(computeStarsCount([1, 2]), 2);
  assert.equal(computeStarsCount([1, 1, 2, 2]), 2);
  assert.equal(computeStarsCount([1, 2, 3, 4, 5]), 5);
  assert.equal(computeStarsCount([1, 2, 3, 4, 5, 6]), 5);
});

test('determineEarnedBadges returns badges according to achievements', () => {
  const badges = determineEarnedBadges({
    completedActivities: [1, 2, 3, 4, 5],
    starsEarned: 5,
    unlockedBadges: [],
    wordsDiscovered: ['chaudière', 'bâtisseur', 'chaleur'],
    timeSpentSecondsToday: 400,
    lastVisitDate: '2026-11-02'
  });

  assert.ok(badges.includes('curieux-debutant'));
  assert.ok(badges.includes('super-spectateur'));
  assert.ok(badges.includes('champion-du-jour'));
  assert.ok(badges.includes('explorateur-des-mots'));
});
