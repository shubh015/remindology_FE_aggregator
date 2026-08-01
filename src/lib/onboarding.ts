const KEY = 'remindology_onboarding_done';

function getCompleted(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function isOnboardingComplete(userId: string): boolean {
  return getCompleted().includes(userId);
}

export function markOnboardingComplete(userId: string): void {
  if (typeof window === 'undefined') return;
  const list = getCompleted();
  if (!list.includes(userId)) {
    list.push(userId);
    localStorage.setItem(KEY, JSON.stringify(list));
  }
}
