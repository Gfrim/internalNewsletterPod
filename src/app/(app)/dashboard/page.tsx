'use client';

import * as React from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/page-header';
import type { Source } from '@/lib/types';
import { mockSources } from '@/lib/data';
import { AddSourceDialog } from './components/add-source-dialog';
import { SourceCard } from './components/source-card';

export default function DashboardPage() {
  const [sources, setSources] = React.useState<Source[]>(mockSources);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleAddSource = (newSource: Source) => {
    setSources((prevSources) => [newSource, ...prevSources]);
  };

  const filteredSources = sources.filter(
    (source) =>
      source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <PageHeader
        title="Source Repository"
        description="Browse, search, and manage all your content sources."
      >
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sources..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Source
        </Button>
      </PageHeader>
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredSources.length > 0 ? (
            filteredSources.map((source) => (
              <SourceCard key={source.id} source={source} />
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <h3 className="text-lg font-medium">No sources found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or add a new source.
              </p>
            </div>
          )}
        </div>
      </main>

      <AddSourceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSourceAdded={handleAddSource}
      />
    </>
  );
}
