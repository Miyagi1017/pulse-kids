/** Date « du jour » côté enfants français, indépendante du fuseau du serveur. */
export function todayParis(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Paris' }).format(new Date());
}
