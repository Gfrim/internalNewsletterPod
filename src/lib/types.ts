export const CATEGORIES = ['Events', 'Marketing', 'Operations', 'Review', 'Onboarding', 'Documentation', 'DevOutreach', 'IT'] as const;

export type Category = (typeof CATEGORIES)[number];

export const CIRCLES = ['Product', 'Engineering', 'Marketing', 'Sales', 'Support', 'HR'] as const;

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
}
