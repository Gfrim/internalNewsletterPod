
'use client';

import * as React from 'react';
import { Loader2, Plus, Sparkles, Upload, X, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Category, Circle } from '@/lib/types';
import { processFileUploadAction, getSummaryAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIES, CIRCLES } from '@/lib/types';
import * as pdfjsLib from 'pdfjs-dist';
import { useSource } from '@/context/source-context';
import { cn } from '@/lib/utils';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface AddSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Helper to extract text from various file types
async function extractTextFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        if (file.type === 'application/pdf') {
            const reader = new FileReader();
            reader.onload = async (event) => {
                if (event.target?.result) {
                    try {
                        const pdf = await pdfjsLib.getDocument({ data: event.target.result as ArrayBuffer }).promise;
                        let content = '';
                        for (let i = 1; i <= pdf.numPages; i++) {
                            const page = await pdf.getPage(i);
                            const textContent = await page.getTextContent();
                            content += textContent.items.map(item => (item as any).str).join(' ');
                        }
                        resolve(content);
                    } catch (e) {
                        console.error("Error parsing PDF", e);
                        reject('Could not parse the PDF file.');
                    }
                }
            };
            reader.readAsArrayBuffer(file);
        } else if (file.type === 'text/plain' || file.type === 'text/markdown') {
            const reader = new FileReader();
            reader.onload = (event) => {
                resolve(event.target?.result as string);
            };
            reader.readAsText(file);
        } else {
            reject('Unsupported file type. Please upload a PDF, TXT, or MD file.');
        }
    });
}


export function AddSourceDialog({ open, onOpenChange }: AddSourceDialogProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isSummarizing, setIsSummarizing] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('manual');
  
  // Manual form state
  const [manualForm, setManualForm] = React.useState({ title: '', content: '', category: '' as Category, circle: '' as Circle, url: '', contributor: '' });
  const [manualSummary, setManualSummary] = React.useState('');
  const [manualFile, setManualFile] = React.useState<File | null>(null);


  // File upload state
  const [file, setFile] = React.useState<File | null>(null);
  const [fileInfo, setFileInfo] = React.useState<{ title: string; summary: string; category: Category; circle: Circle; content: string, url: string, contributor: string } | null>(null);

  const { toast } = useToast();
  const { addSource } = useSource();

  const resetState = () => {
    setIsProcessing(false);
    setIsSummarizing(false);
    setManualForm({ title: '', content: '', category: '' as Category, circle: '' as Circle, url: '', contributor: '' });
    setManualSummary('');
    setManualFile(null);
    setFile(null);
    setFileInfo(null);
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetState();
    }
    onOpenChange(isOpen);
  }
  
  const handleManualFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setManualForm(prev => ({ ...prev, [name]: value }));
  }

  const handleManualCategoryChange = (value: Category) => {
    setManualForm(prev => ({ ...prev, category: value }));
  }

  const handleManualCircleChange = (value: Circle) => {
    setManualForm(prev => ({ ...prev, circle: value }));
  }
  
  const handleManualFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const selectedFile = files[0];
      if (selectedFile.size > 1 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'Please upload files under 1MB.',
        });
        return;
      }
      setManualFile(selectedFile);
    }
  };

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const selectedFile = files[0];
       // Limit file size to 1MB
      if (selectedFile.size > 1 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'Please upload files under 1MB due to database limitations.',
        });
        return;
      }
      setFile(selectedFile);
      setFileInfo(null); // Reset previous file info
    }
  };

  const handleProcessFile = async () => {
    if (!file) return;
    setIsProcessing(true);
    
    try {
        const fileText = await extractTextFromFile(file);
        processTextContent(fileText);
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'File Error', description: error });
        setIsProcessing(false);
    }
  };

  const processTextContent = async (text: string) => {
    const { processedSource, error } = await processFileUploadAction(text);
    if (error || !processedSource) {
      toast({ variant: 'destructive', title: 'AI Processing Failed', description: error || "Could not extract details from file."});
    } else {
      setFileInfo({
        title: processedSource.title,
        summary: processedSource.summary,
        category: processedSource.category,
        circle: processedSource.circle,
        content: text,
        url: '',
        contributor: '',
      });
      toast({ title: 'AI Analysis Complete!', description: 'Title, summary, and categories have been extracted.'});
    }
    setIsProcessing(false);
  }

  const handleGenerateSummary = async () => {
    let combinedContent = manualForm.content;
    setIsSummarizing(true);
    
    try {
        if (manualFile) {
            const fileText = await extractTextFromFile(manualFile);
            combinedContent += `\n\n--- Attached File Content ---\n\n${fileText}`;
        }

        if (!combinedContent.trim()) {
            toast({ variant: 'destructive', title: 'No Content', description: 'Please provide content or attach a file to summarize.' });
            setIsSummarizing(false);
            return;
        }

        const { summary, error } = await getSummaryAction(combinedContent);
        if (error) {
            toast({ variant: 'destructive', title: 'Summarization Failed', description: error });
        } else {
            setManualSummary(summary);
            setManualForm(prev => ({...prev, content: combinedContent})); // Save combined content
            toast({ title: 'Summary Generated!', description: 'The AI has summarized your content.' });
        }
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error processing file', description: error });
    } finally {
        setIsSummarizing(false);
    }
  }


  async function handleFormSubmit() {
    setIsProcessing(true);
    let sourceData;

    if (activeTab === 'manual') {
      if (!manualForm.title || !manualForm.category || !manualSummary) {
        toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please fill out title, category, and generate a summary.' });
        setIsProcessing(false);
        return;
      }
      sourceData = { ...manualForm, summary: manualSummary };
    } else { // File upload tab
      if (!fileInfo) {
        toast({ variant: 'destructive', title: 'File Not Processed', description: 'Please process the file first.' });
        setIsProcessing(false);
        return;
      }
      sourceData = { ...fileInfo };
    }
    
    await addSource(sourceData);

    toast({ title: "Source Added", description: `"${sourceData.title}" has been added.` });
    setIsProcessing(false);
    handleOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Source</DialogTitle>
          <DialogDescription>
            Add a new piece of content to the repository. You can either enter it manually or upload a document.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="upload">File Upload</TabsTrigger>
          </TabsList>
          
          {/* Manual Entry Tab */}
          <TabsContent value="manual">
            <div className="grid gap-4 py-4">
              <Input name="title" placeholder="Source Title" value={manualForm.title} onChange={handleManualFormChange} />
              <div className="relative">
                <Textarea name="content" placeholder="Paste or write your source content here..." value={manualForm.content} onChange={handleManualFormChange} className={cn("min-h-[120px]", manualFile ? 'pb-10' : '')} />
                <Button size="sm" onClick={handleGenerateSummary} disabled={isSummarizing || (!manualForm.content && !manualFile)} className="absolute bottom-2 right-2">
                  {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Summarize
                </Button>
              </div>

               {/* Manual File Attachment */}
              <div className="flex items-center gap-2">
                <label htmlFor="manual-file-input" className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer hover:text-primary">
                    <Paperclip className="h-4 w-4" />
                    <span>{manualFile ? manualFile.name : "Attach a file..."}</span>
                </label>
                <Input
                  id="manual-file-input"
                  type="file"
                  onChange={(e) => handleManualFileChange(e.target.files)}
                  accept=".pdf,.txt,.md"
                  className="sr-only"
                  disabled={isSummarizing}
                />
                {manualFile && (
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setManualFile(null)}>
                        <X className="h-4 w-4" />
                    </Button>
                )}
              </div>

              <Textarea name="summary" placeholder="AI-generated or manual summary will appear here." value={manualSummary} onChange={(e) => setManualSummary(e.target.value)} />
              <div className="grid grid-cols-2 gap-4">
                  <Select onValueChange={handleManualCategoryChange} value={manualForm.category}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                          {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                      </SelectContent>
                  </Select>
                  <Select onValueChange={handleManualCircleChange} value={manualForm.circle}>
                      <SelectTrigger><SelectValue placeholder="Select circle" /></SelectTrigger>
                      <SelectContent>
                          {CIRCLES.map(cir => <SelectItem key={cir} value={cir}>{cir}</SelectItem>)}
                      </SelectContent>
                  </Select>
              </div>
              <Input name="url" placeholder="Source URL (optional)" value={manualForm.url} onChange={handleManualFormChange} />
              <Input name="contributor" placeholder="Contributor Name (optional)" value={manualForm.contributor} onChange={handleManualFormChange} />
            </div>
          </TabsContent>
          
          {/* File Upload Tab */}
          <TabsContent value="upload">
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  onChange={(e) => handleFileChange(e.target.files)}
                  accept=".pdf,.txt,.md"
                  className="flex-1"
                  disabled={isProcessing}
                />
                <Button onClick={handleProcessFile} disabled={!file || isProcessing}>
                  {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Process
                </Button>
              </div>

              {fileInfo && (
                <div className="mt-4 border rounded-lg p-4 space-y-4 bg-muted/50">
                    <h4 className="font-semibold text-lg">Extracted Information</h4>
                    <p><strong>Title:</strong> {fileInfo.title}</p>
                    <p><strong>Category:</strong> {fileInfo.category}</p>
                    <p><strong>Circle:</strong> {fileInfo.circle}</p>
                    <div>
                        <strong>Summary:</strong>
                        <p className="text-sm text-muted-foreground mt-1 max-h-32 overflow-y-auto">{fileInfo.summary}</p>
                    </div>
                     <Input name="contributor" placeholder="Contributor Name (optional)" value={fileInfo.contributor} onChange={(e) => setFileInfo(prev => prev ? {...prev, contributor: e.target.value } : null)} />
                </div>
              )}
               {file && !fileInfo && (
                <div className="mt-4 text-center text-muted-foreground">
                    <p>Click "Process" to let the AI analyze your document.</p>
                </div>
              )}

            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="pt-4">
          <Button onClick={handleFormSubmit} disabled={isProcessing || isSummarizing}>
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Add Source
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
