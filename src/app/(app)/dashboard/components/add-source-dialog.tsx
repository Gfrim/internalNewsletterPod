'use client';

import * as React from 'react';
import { Loader2, Sparkles, UploadCloud, FileText, X, ArrowLeft, FileSignature, FileUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Category, Source } from '@/lib/types';
import { processDocumentAction, getSummaryAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIES } from '@/lib/types';
import { UnstructuredClient } from "unstructured-client";

interface AddSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSourceAdded: (source: Source) => void;
}

type InputMethod = 'upload' | 'form' | null;

export function AddSourceDialog({ open, onOpenChange, onSourceAdded }: AddSourceDialogProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [inputMethod, setInputMethod] = React.useState<InputMethod>(null);
  const [formData, setFormData] = React.useState({ title: '', content: '', category: '' as Category, url: '' });
  const [summary, setSummary] = React.useState('');
  const [isSummarizing, setIsSummarizing] = React.useState(false);
  const { toast } = useToast();

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const selectedFile = files[0];
      const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown'];
      if (allowedTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.docx')) {
        setFile(selectedFile);
      } else {
        toast({
            variant: 'destructive',
            title: 'Unsupported File Type',
            description: 'Please upload a PDF, DOCX, TXT or MD file.',
        })
      }
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileChange(e.dataTransfer.files);
  };
  
  const resetState = () => {
    setIsProcessing(false);
    setFile(null);
    setInputMethod(null);
    setFormData({ title: '', content: '', category: '' as Category, url: '' });
    setSummary('');
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      resetState();
    }
    onOpenChange(isOpen);
  }
  
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  const handleCategoryChange = (value: Category) => {
    setFormData(prev => ({ ...prev, category: value }));
  }

  const handleGenerateSummary = async () => {
    if (!formData.content) return;
    setIsSummarizing(true);
    const { summary: generatedSummary, error } = await getSummaryAction(formData.content);
    if (error) {
      toast({ variant: 'destructive', title: 'Summarization Failed', description: error });
    } else {
      setSummary(generatedSummary);
      toast({ title: 'Summary Generated!', description: 'The AI has summarized your content.' });
    }
    setIsSummarizing(false);
  }

  async function handleUploadSubmit() {
    if (!file) return;
    setIsProcessing(true);

    try {
        const client = new UnstructuredClient({
            // The API proxy is exposed at /api/unstructured
            // and is responsible for adding the API key.
            // We pass a relative URL and the browser will resolve it.
            serverURL: "/api/unstructured",
            // The API key is not needed when using a proxy.
            apiKey: "",
        });

        const resp = await client.general.partition({
            files: {
                content: file,
                fileName: file.name,
            }
        });

        const content = resp.elements.map(el => el.text).join('\n\n');

        const { processedSource, error } = await processDocumentAction(content);
        
        setIsProcessing(false);
        if (error || !processedSource) {
            toast({ variant: 'destructive', title: 'Processing Failed', description: error || 'An unknown error occurred.' });
            return;
        }

        const newSource: Source = {
            id: crypto.randomUUID(),
            ...processedSource,
            createdAt: new Date().toISOString(),
        };

        onSourceAdded(newSource);
        toast({ title: "Source Added", description: `"${newSource.title}" has been processed and added.` });
        handleOpenChange(false);
    } catch (e) {
        console.error(e);
        setIsProcessing(false);
        toast({ variant: 'destructive', title: 'File Processing Error', description: 'Could not extract text from the selected file.' });
    }
  }

  async function handleFormSubmit() {
    if (!formData.title || !formData.content || !formData.category || !summary) {
        toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please fill out all fields and generate a summary.' });
        return;
    }
    setIsProcessing(true);
    const newSource: Source = {
        id: crypto.randomUUID(),
        ...formData,
        summary,
        createdAt: new Date().toISOString(),
    };
    onSourceAdded(newSource);
    toast({ title: "Source Added", description: `"${newSource.title}" has been added.` });
    setIsProcessing(false);
    handleOpenChange(false);
  }
  
  const renderContent = () => {
    if (inputMethod === 'upload') {
      return (
        <>
        <DialogDescription>
            Upload a document (PDF, DOCX, TXT). The AI will automatically extract the title, category, and summary.
        </DialogDescription>
        <div className="py-4">
            {!file ? (
                <div
                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                        "relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer bg-muted/50 hover:bg-muted/75 transition-colors",
                        dragActive && "border-primary bg-primary/10"
                    )}
                >
                    <UploadCloud className="w-10 h-10 text-muted-foreground mb-2" />
                    <p className="mb-2 text-sm text-muted-foreground">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">PDF, DOCX, TXT, or MD files</p>
                    <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => handleFileChange(e.target.files)} accept=".txt,.md,text/*,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" />
                </div>
            ) : (
                <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                    <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-primary" />
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">{file.name}</span>
                            <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</span>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="h-7 w-7 rounded-full">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
        <DialogFooter className="pt-4">
            <Button onClick={handleUploadSubmit} disabled={isProcessing || !file}>
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Process & Add Source
            </Button>
        </DialogFooter>
        </>
      );
    }
    
    if (inputMethod === 'form') {
        return (
            <>
            <DialogDescription>
                Fill in the details for your source manually. The AI can help you summarize the content.
            </DialogDescription>
            <div className="grid gap-4 py-4">
                <Input name="title" placeholder="Source Title" value={formData.title} onChange={handleFormChange} />
                <div className="relative">
                    <Textarea name="content" placeholder="Paste or write your source content here..." value={formData.content} onChange={handleFormChange} className="min-h-[120px]" />
                    <Button size="sm" onClick={handleGenerateSummary} disabled={isSummarizing || !formData.content} className="absolute bottom-2 right-2">
                        {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Summarize
                    </Button>
                </div>
                <Textarea readOnly placeholder="AI-generated summary will appear here." value={summary} className="min-h-[80px]" />
                <div className="grid grid-cols-2 gap-4">
                    <Select onValueChange={handleCategoryChange} value={formData.category}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                            {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Input name="url" placeholder="Source URL (optional)" value={formData.url} onChange={handleFormChange} />
                </div>
            </div>
            <DialogFooter className="pt-4">
                <Button onClick={handleFormSubmit} disabled={isProcessing || !formData.title || !summary}>
                    {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Add Source
                </Button>
            </DialogFooter>
            </>
        );
    }
    
    return (
        <>
        <DialogDescription>
            Choose how you want to add a new content source to your repository.
        </DialogDescription>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6">
            <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setInputMethod('upload')}>
                <FileUp className="w-8 h-8" />
                <span>Upload Document</span>
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2" onClick={() => setInputMethod('form')}>
                <FileSignature className="w-8 h-8" />
                <span>Manual Entry</span>
            </Button>
        </div>
        </>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
            {inputMethod && (
                <Button variant="ghost" size="sm" className="absolute left-4 top-4 h-7 w-auto px-2 text-muted-foreground" onClick={() => setInputMethod(null)}>
                    <ArrowLeft className="h-4 w-4 mr-1"/>
                    Back
                </Button>
            )}
          <DialogTitle className="text-center">Add New Source</DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
}
