
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

export default function DashboardPage() {
  const { sources, loading } = useSource();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const filteredSources = sources.filter(
    (source) =>
      source.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      source.category.toLowerCase().includes(searchQuery.toLowerCase())
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
                Try adjusting your search or add a new source.
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
