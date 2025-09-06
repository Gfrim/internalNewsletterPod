
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
  DialogDescription,
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
    wins: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-800',
    challenges: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/50 dark:text-rose-300 dark:border-rose-800',
    'key activities': 'bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-900/50 dark:text-sky-300 dark:border-sky-800',
    internal: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600',
    external: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-800',
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
              <DialogDescription>AI-generated summary</DialogDescription>
            </DialogHeader>
            <div className="mt-4 max-h-[60vh] overflow-y-auto pr-4">
              <p className="text-sm whitespace-pre-wrap">{source.summary}</p>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
