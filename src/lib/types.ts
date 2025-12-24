
export const CATEGORIES = ['internal', 'challenges', 'key activities', 'wins', 'updates', 'general'] as const;
export type Category = (typeof CATEGORIES)[number];

export const CIRCLES = ['Analytics', 'BizDev', 'Operations', 'Events', 'Marketing', 'Review', 'Documentation', 'Onboarding', 'Lab', 'DevOutreach'] as const;
export type Circle = (typeof CIRCLES)[number];

export interface Source {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: Category;
  circle?: Circle;
  url?: string;
  createdAt: string;
  imageUrl?: string;
  contributor?: string;
  isBookmarked?: boolean;
}
