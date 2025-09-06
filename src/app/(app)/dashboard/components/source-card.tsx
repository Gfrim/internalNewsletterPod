'use client';

import {
  BookText,
  Building,
  ClipboardList,
  ExternalLink,
  Globe,
  Link as LinkIcon,
  ShieldAlert,
  Trophy,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Category, Source } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface SourceCardProps {
  source: Source;
}

const categoryIcons: Record<Category, React.ElementType> = {
  wins: Trophy,
  challenges: ShieldAlert,
  'key activities': ClipboardList,
  internal: Building,
  external: Globe,
};

const categoryColors: Record<Category, string> = {
    wins: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800',
    challenges: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800',
    'key activities': 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800',
    internal: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-800',
    external: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800',
};


export function SourceCard({ source }: SourceCardProps) {
  const CategoryIcon = categoryIcons[source.category] || BookText;
  const timeAgo = formatDistanceToNow(new Date(source.createdAt), { addSuffix: true });

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-start justify-between">
          <span className="text-base font-semibold leading-tight pr-2">{source.title}</span>
          {source.url && (
            <a href={source.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary">
                    <LinkIcon className="h-4 w-4" />
                </Button>
            </a>
          )}
        </CardTitle>
        <CardDescription className="text-xs">{timeAgo}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-4">{source.summary}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Badge variant="outline" className={`capitalize ${categoryColors[source.category]}`}>
          <CategoryIcon className="mr-1.5 h-3 w-3" />
          {source.category}
        </Badge>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">View Source</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{source.title}</DialogTitle>
              <CardDescription>Full source content</CardDescription>
            </DialogHeader>
            <div className="mt-4 max-h-[60vh] overflow-y-auto pr-4">
              <p className="text-sm whitespace-pre-wrap">{source.content}</p>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
