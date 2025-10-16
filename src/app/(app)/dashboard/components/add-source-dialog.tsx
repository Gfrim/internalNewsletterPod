
'use client';

import * as React from 'react';
import { Loader2, Sparkles, X, Paperclip, Image as ImageIcon, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Category, Circle } from '@/lib/types';
import { processFileUploadAction, getSummaryAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIES, CIRCLES } from '@/lib/types';
import { useSource } from '@/context/source-context';
import Image from 'next/image';

interface AddSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddSourceDialog({ open, onOpenChange }: AddSourceDialogProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isSummarizing, setIsSummarizing] = React.useState(false);
  const [formData, setFormData] = React.useState({ title: '', content: '', category: '' as Category, circle: '' as Circle, url: '', imageUrl: '', contributor: '' });
  const [summary, setSummary] = React.useState('');
  const [file, setFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const { addSource } = useSource();

  const resetState = () => {
    setIsProcessing(false);
    setIsSummarizing(false);
    setFile(null);
    setFormData({ title: '', content: '', category: '' as Category, circle: '' as Circle, url: '', imageUrl: '', contributor: '' });
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

  const handleCircleChange = (value: Circle) => {
    setFormData(prev => ({ ...prev, circle: value }));
  }
  
  const fileToDataURI = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
  }

  const handleFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const selectedFile = files[0];
    
    // Allow any file type but we will handle it later
    setFile(selectedFile);
    
    setIsProcessing(true); // Show loading state while processing file
    try {
        const fileUrl = await fileToDataURI(selectedFile);
        
        // If it is an image, we can show a preview immediately
        if (selectedFile.type.startsWith('image/')) {
            setFormData(prev => ({ ...prev, imageUrl: fileUrl }));
        } else {
             // For non-image files like PDFs, we'll just hold onto the data URL
             // and show a generic file preview. The AI will process it.
             setFormData(prev => ({ ...prev, imageUrl: fileUrl }));
        }

        // Auto-process if no manual content
        if (!formData.content) {
            const { processedSource, error } = await processFileUploadAction(formData.content, fileUrl);
            if (error || !processedSource) {
                toast({ variant: 'destructive', title: 'AI Processing Failed', description: error || "Could not extract details from file."});
            } else {
                setFormData(prev => ({
                    ...prev,
                    title: processedSource.title,
                    category: processedSource.category,
                    circle: processedSource.circle,
                }));
                setSummary(processedSource.summary);
                toast({ title: 'AI File Analysis Complete!', description: 'Title, summary, and categories have been filled in.'});
            }
        } else {
            toast({ title: "File Attached", description: `"${selectedFile.name}" is ready to be submitted with your content.`});
        }
    } catch(e: any) {
        console.error("Error handling file attachment", e);
        toast({ variant: 'destructive', title: 'File Error', description: 'Could not read the attached file.'});
        setFile(null);
    } finally {
        setIsProcessing(false);
    }
  }

  const handleGenerateSummary = async () => {
    if (!formData.content && !formData.imageUrl) return;
    setIsSummarizing(true);
    const { summary: generatedSummary, error } = await getSummaryAction(formData.content, formData.imageUrl);
    if (error) {
      toast({ variant: 'destructive', title: 'Summarization Failed', description: error });
    } else {
      setSummary(generatedSummary);
      toast({ title: 'Summary Generated!', description: 'The AI has summarized your content.' });
    }
    setIsSummarizing(false);
  }

  async function handleFormSubmit() {
    if ((!formData.title || !formData.category) && (!formData.content && !formData.imageUrl)) {
        toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please fill out title, category, and provide content or an image.' });
        return;
    }
     if (!summary) {
        toast({ variant: 'destructive', title: 'Summary Required', description: 'Please generate or write a summary before adding the source.' });
        return;
    }

    setIsProcessing(true);
    
    await addSource({
        title: formData.title,
        content: formData.content,
        category: formData.category,
        circle: formData.circle,
        url: formData.url,
        summary,
        imageUrl: formData.imageUrl,
        contributor: formData.contributor,
    });

    toast({ title: "Source Added", description: `"${formData.title}" has been added.` });
    setIsProcessing(false);
    handleOpenChange(false);
  }

  const renderFilePreview = () => {
    if (!file) return null;

    const isImage = file.type.startsWith('image/');
    const Icon = isImage ? ImageIcon : FileText;

    return (
        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
            <div className="flex items-center gap-3 overflow-hidden">
                {isImage && formData.imageUrl ? (
                    <Image src={formData.imageUrl} alt="Preview" width={32} height={32} className="rounded object-cover h-8 w-8" />
                ) : (
                    <Icon className="w-5 h-5 text-primary shrink-0" />
                )}
                <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium truncate">{file.name}</span>
                    <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</span>
                </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => {
                setFile(null);
                setFormData(p => ({...p, imageUrl: ''}));
                if (fileInputRef.current) fileInputRef.current.value = "";
            }} className="h-7 w-7 rounded-full shrink-0">
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Source</DialogTitle>
           <DialogDescription>
                Fill in the details, attach a file/image, and let the AI generate a summary.
            </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
            <Input name="title" placeholder="Source Title" value={formData.title} onChange={handleFormChange} disabled={isProcessing}/>
            
            {file ? renderFilePreview() : null}
            
            <div className="relative">
                <Textarea name="content" placeholder="Paste or write your source content here... (optional if file is attached)" value={formData.content} onChange={handleFormChange} className="min-h-[120px] pr-28" disabled={isProcessing} />
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                    <Button size="sm" onClick={() => fileInputRef.current?.click()} variant="outline" disabled={isProcessing}>
                        <Paperclip className="mr-2 h-4 w-4" />
                        Attach
                    </Button>
                     <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => handleFileChange(e.target.files)} accept="image/*,application/pdf,.txt,.md" />
                    <Button size="sm" onClick={handleGenerateSummary} disabled={isSummarizing || isProcessing || (!formData.content && !formData.imageUrl)}>
                        {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Summarize
                    </Button>
                </div>
            </div>
            <Textarea name="summary" placeholder="AI-generated or manual summary will appear here." value={summary} onChange={(e) => setSummary(e.target.value)} className="min-h-[80px]" disabled={isProcessing}/>
            <div className="grid grid-cols-2 gap-4">
                <Select onValueChange={handleCategoryChange} value={formData.category} disabled={isProcessing}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                        {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select onValueChange={handleCircleChange} value={formData.circle} disabled={isProcessing}>
                    <SelectTrigger><SelectValue placeholder="Select circle" /></SelectTrigger>
                    <SelectContent>
                        {CIRCLES.map(cir => <SelectItem key={cir} value={cir}>{cir}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
             <Input name="url" placeholder="Source URL (optional)" value={formData.url} onChange={handleFormChange} disabled={isProcessing}/>
             <Input name="contributor" placeholder="Contributor Name (optional)" value={formData.contributor} onChange={handleFormChange} disabled={isProcessing}/>
        </div>
        <DialogFooter className="pt-4">
            <Button onClick={handleFormSubmit} disabled={isProcessing || isSummarizing || !formData.title || !summary}>
                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Add Source
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
