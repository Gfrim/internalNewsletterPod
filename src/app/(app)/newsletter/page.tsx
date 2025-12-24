
'use client';

import * as React from 'react';
import { Clipboard, Loader2, Sparkles, BookHeart } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import type { Source } from '@/lib/types';
import { generateNewsletterAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { useSource } from '@/context/source-context';

export default function NewsletterPage() {
  const { sources, loading } = useSource();
  const [selectedSources, setSelectedSources] = React.useState<Set<string>>(new Set());
  const [newsletterTitle, setNewsletterTitle] = React.useState('Weekly Internal Update');
  const [generatedDraft, setGeneratedDraft] = React.useState('');
  const [isGenerating, setIsGenerating] = React.useState(false);
  const { toast } = useToast();

  const bookmarkedSources = React.useMemo(() => sources.filter(s => s.isBookmarked), [sources]);

  React.useEffect(() => {
    // Pre-select all bookmarked sources
    const bookmarkedIds = new Set(bookmarkedSources.map(s => s.id));
    setSelectedSources(bookmarkedIds);
  }, [bookmarkedSources]);

  const handleSelectSource = (sourceId: string, isSelected: boolean) => {
    setSelectedSources((prev) => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(sourceId);
      } else {
        newSet.delete(sourceId);
      }
      return newSet;
    });
  };

  const handleGenerate = async () => {
    if (selectedSources.size === 0) {
      toast({
        variant: 'destructive',
        title: 'No sources selected',
        description: 'Please select at least one source to generate a newsletter.',
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedDraft('');

    const contentForDraft = sources
      .filter((s) => selectedSources.has(s.id))
      .map(({ title, summary, category }) => ({ title, summary, category }));

    const { draft, error } = await generateNewsletterAction(contentForDraft, newsletterTitle);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: error,
      });
    } else {
      setGeneratedDraft(draft);
      toast({
        title: 'Newsletter Generated!',
        description: 'Your draft is ready for review.',
      });
    }
    setIsGenerating(false);
  };
  
  const handleCopyToClipboard = () => {
    if (!generatedDraft) return;
    navigator.clipboard.writeText(generatedDraft);
    toast({
      title: 'Copied to Clipboard!',
    });
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                <p className="text-muted-foreground">Loading bookmarked sources...</p>
            </div>
        </div>
      );
    }
    if (bookmarkedSources.length === 0) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
                 <BookHeart className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">No Bookmarked Sources</h3>
                <p className="text-muted-foreground">
                    Go to the dashboard and click the heart icon on any source to add it here.
                </p>
            </div>
        );
    }
    return (
        <div className="flex-1 overflow-y-auto space-y-4">
            {bookmarkedSources.map((source) => (
              <div key={source.id} className="flex items-start gap-4 rounded-md border p-4">
                <Checkbox
                  id={`source-${source.id}`}
                  checked={selectedSources.has(source.id)}
                  onCheckedChange={(checked) => handleSelectSource(source.id, !!checked)}
                  className="mt-1"
                />
                <div className="grid gap-1.5 leading-none">
                  <label htmlFor={`source-${source.id}`} className="font-medium cursor-pointer">
                    {source.title}
                  </label>
                  <p className="text-sm text-muted-foreground line-clamp-2">{source.summary}</p>
                </div>
              </div>
            ))}
        </div>
    );
  }

  return (
    <>
      <PageHeader
        title="Newsletter Generator"
        description="Select sources to compile and generate a draft newsletter."
      />
      <main className="flex-1 grid md:grid-cols-2 gap-8 p-4 sm:p-6 md:p-8 overflow-hidden">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>1. Select Content</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col">
            {renderContent()}
          </CardContent>
        </Card>
        
        <div className="flex flex-col gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>2. Set Title & Generate</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4">
                    <Input
                        value={newsletterTitle}
                        onChange={(e) => setNewsletterTitle(e.target.value)}
                        placeholder="Enter newsletter title..."
                        className="flex-1"
                    />
                    <Button onClick={handleGenerate} disabled={isGenerating || selectedSources.size === 0} className="w-full sm:w-auto">
                        {isGenerating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Generate
                    </Button>
                </CardContent>
            </Card>

            <Card className="flex-1 flex flex-col">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>3. Review Draft</CardTitle>
                    <Button variant="outline" size="sm" onClick={handleCopyToClipboard} disabled={!generatedDraft}>
                        <Clipboard className="mr-2 h-4 w-4" />
                        Copy
                    </Button>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                    {isGenerating && (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                                <p className="text-muted-foreground">AI is drafting your newsletter...</p>
                            </div>
                        </div>
                    )}
                    {!isGenerating && !generatedDraft && (
                        <div className="flex-1 flex items-center justify-center">
                            <p className="text-muted-foreground">Your generated newsletter will appear here.</p>
                        </div>
                    )}
                    {generatedDraft && (
                        <Textarea
                            readOnly
                            value={generatedDraft}
                            className="flex-1 w-full h-full min-h-[300px] resize-none"
                        />
                    )}
                </CardContent>
            </Card>
        </div>
      </main>
    </>
  );
}
