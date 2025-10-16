
'use client';

import * as React from 'react';
import { Plus, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/page-header';
import type { Source } from '@/lib/types';
import { AddSourceDialog } from './components/add-source-dialog';
import { SourceCard } from './components/source-card';
import { useSource } from '@/context/source-context';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIES, CIRCLES } from '@/lib/types';

export default function DashboardPage() {
  const { sources, loading } = useSource();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [selectedCircle, setSelectedCircle] = React.useState('all');
  const [selectedContributor, setSelectedContributor] = React.useState('all');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const contributors = React.useMemo(() => {
    const uniqueContributors = new Set(sources.map(s => s.contributor).filter(Boolean));
    return ['all', ...Array.from(uniqueContributors)] as string[];
  }, [sources]);

  const filteredSources = sources.filter(
    (source) =>
      (source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.summary.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (selectedCategory === 'all' || source.category === selectedCategory) &&
      (selectedCircle === 'all' || source.circle === selectedCircle) &&
      (selectedContributor === 'all' || source.contributor === selectedContributor)
  );

  const renderContent = () => {
    if (loading) {
        return (
            <div className="col-span-full text-center py-16 flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <h3 className="text-lg font-medium">Loading Sources...</h3>
                <p className="text-muted-foreground">
                    Please wait while we fetch your data.
                </p>
            </div>
        );
    }
    if (sources.length === 0) {
        return (
            <div className="col-span-full text-center py-16">
                <h3 className="text-lg font-medium">No sources yet</h3>
                <p className="text-muted-foreground">
                    Click "Add Source" to get started.
                </p>
            </div>
        );
    }
    if (filteredSources.length > 0) {
        return filteredSources.map((source) => (
            <SourceCard key={source.id} source={source} />
        ));
    }
    return (
        <div className="col-span-full text-center py-16">
            <h3 className="text-lg font-medium">No sources found</h3>
            <p className="text-muted-foreground">
                Try adjusting your filters or add a new source.
            </p>
        </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Source Repository"
        description="Browse, search, and manage all your content sources."
      >
        <div className="flex w-full max-w-xl items-center gap-2">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sources..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsDialogOpen(true)} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            Add Source
          </Button>
        </div>
      </PageHeader>
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-4 mb-6">
            <h3 className="text-sm font-medium text-muted-foreground">Filter by:</h3>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-auto min-w-[150px]">
                    <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map(cat => <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select value={selectedCircle} onValueChange={setSelectedCircle}>
                <SelectTrigger className="w-full sm:w-auto min-w-[150px]">
                    <SelectValue placeholder="Circle" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Circles</SelectItem>
                    {CIRCLES.map(cir => <SelectItem key={cir} value={cir} className="capitalize">{cir}</SelectItem>)}
                </SelectContent>
            </Select>
            <Select value={selectedContributor} onValueChange={setSelectedContributor} disabled={contributors.length <= 1}>
                <SelectTrigger className="w-full sm:w-auto min-w-[150px]">
                    <SelectValue placeholder="Contributor" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Contributors</SelectItem>
                    {contributors.slice(1).map(con => <SelectItem key={con} value={con} className="capitalize">{con}</SelectItem>)}
                </SelectContent>
            </Select>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {renderContent()}
        </div>
      </main>

      <AddSourceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
