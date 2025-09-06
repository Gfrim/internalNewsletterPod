export const CATEGORIES = ['wins', 'challenges', 'key activities', 'internal', 'external'] as const;

export type Category = typeof CATEGORIES[number];

export interface Source {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: Category;
  url?: string;
  createdAt: string;
}
