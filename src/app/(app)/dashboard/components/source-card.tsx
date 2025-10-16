
'use client';

import {
  BookText,
  Briefcase,
  Calendar,
  Code,
  FileCheck,
  Link as LinkIcon,
  Server,
  Settings,
  Users,
  Target,
  Circle as CircleIcon,
  ShoppingBag,
  Heart,
  User,
  FileOutput,
  Cpu,
  Building,
  BarChart,
  GitMerge,
  FlaskConical,
  UserCircle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Category, Circle, Source } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import Image from 'next/image';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface SourceCardProps {
  source: Source;
}

const circleIcons: Record<Circle, React.ElementType> = {
  Analytics: BarChart,
  BizDev: Briefcase,
  Operations: Settings,
  Events: Calendar,
  Marketing: Target,
  Review: FileCheck,
  Documentation: BookText,
  Onboarding: Users,
  Lab: FlaskConical,
  DevOutreach: Code,
};

const circleColors: Record<Circle, string> = {
    Analytics: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800',
    BizDev: 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/50 dark:text-pink-300 dark:border-pink-800',
    Operations: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/50 dark:text-cyan-300 dark:border-cyan-800',
    Events: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800',
    Marketing: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/50 dark:text-orange-300 dark:border-orange-800',
    Review: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800',
    Documentation: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600',
    Onboarding: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800',
    Lab: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:border-indigo-800',
    DevOutreach: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800',
};


export function SourceCard({ source }: SourceCardProps) {
  const CircleIcon = source.circle ? circleIcons[source.circle] || CircleIcon : null;
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
      <CardFooter className="flex justify-between items-center gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="capitalize">
                {source.category}
            </Badge>
            {source.circle && CircleIcon && (
                <Badge variant="outline" className={`capitalize ${circleColors[source.circle]}`}>
                    <CircleIcon className="mr-1.5 h-3 w-3" />
                    {source.circle}
                </Badge>
            )}
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">View Source</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{source.title}</DialogTitle>
                {source.contributor && (
                    <DialogDescription className="flex items-center gap-2 pt-1">
                      <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-xs">{source.contributor.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span>Contributed by {source.contributor}</span>
                    </DialogDescription>
                )}
            </DialogHeader>
            <div className="mt-4 max-h-[70vh] overflow-y-auto pr-4 space-y-4">
              {source.imageUrl && (
                  <div className="relative w-full">
                    <Image src={source.imageUrl} alt={source.title} width={800} height={400} className="rounded-md object-contain border w-full" />
                  </div>
              )}
              <p className="text-sm font-semibold text-foreground">Summary</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{source.summary}</p>
              {source.content && (
                <>
                    <h3 className="text-lg font-semibold mt-6 border-t pt-4">Original Content</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{source.content}</p>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
