export const CATEGORIES = ['Events', 'Marketing', 'Operations', 'Review', 'Onboarding', 'Documentation', 'DevOutreach', 'IT'] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Source {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: Category;
  url?: string;
  createdAt: string;
  imageUrl?: string;
}
