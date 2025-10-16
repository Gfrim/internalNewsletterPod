
'use client';

import * as React from 'react';
import { Loader2, Sparkles, UploadCloud, FileText, X, ArrowLeft, FileSignature, FileUp, Paperclip, Image as ImageIcon } from 'lucide-react';
import * as pdfjs from 'pdfjs-dist';
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
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CATEGORIES, CIRCLES } from '@/lib/types';
import { useSource } from '@/context/source-context';
import Image from 'next/image';

// Set up the PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

interface AddSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // onSourceAdded is no longer needed as we write directly to DB
}

type InputMethod = 'upload' | 'form' | null;

export function AddSourceDialog({ open, onOpenChange }: AddSourceDialogProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const manualFileInputRef = React.useRef<HTMLInputElement>(null);
  const [inputMethod, setInputMethod] = React.useState<InputMethod>(null);
  const [formData, setFormData] = React.useState({ title: '', content: '', category: '' as Category, circle: '' as Circle, url: '', imageUrl: '', contributor: '' });
  const [summary, setSummary] = React.useState('');
  const [isSummarizing, setIsSummarizing] = React.useState(false);
  const [isAttaching, setIsAttaching] = React.useState(false);
  const { toast } = useToast();
  const { addSource } = useSource();

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const selectedFile = files[0];
      const allowedTypes = ['application/pdf', 'text/plain', 'text/markdown', 'image/jpeg', 'image/png', 'image/webp'];
      if (allowedTypes.includes(selectedFile.type)) {
        setFile(selectedFile);
      } else {
        toast({
            variant: 'destructive',
            title: 'Unsupported File Type',
            description: 'Please upload a PDF, TXT, MD, JPG, or PNG file.',
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
    setFormData({ title: '', content: '', category: '' as Category, circle: '' as Circle, url: '', imageUrl: '', contributor: '' });
    setSummary('');
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
    if (manualFileInputRef.current) {
        manualFileInputRef.current.value = "";
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

  const fileToDataURI = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
  }


  const extractTextFromFile = async (fileToProcess: File): Promise<string> => {
    let documentContent = '';
    const fileBuffer = await fileToProcess.arrayBuffer();

    if (fileToProcess.type === 'application/pdf') {
      const loadingTask = pdfjs.getDocument(fileBuffer);
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      let fullText = '';
      for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          fullText += textContent.items.map(item => (item as any).str).join(' ');
      }
      documentContent = fullText;
    } else if (fileToProcess.type.startsWith('text/')) {
      documentContent = new TextDecoder().decode(fileBuffer);
    }
    return documentContent;
  }

  const handleManualFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const attachedFile = files[0];
    const allowedTypes = ['application/pdf', 'text/plain', 'text/markdown', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(attachedFile.type)) {
      toast({
          variant: 'destructive',
          title: 'Unsupported File Type',
          description: 'Please attach a PDF, TXT, MD, JPG, or PNG file.',
      });
      return;
    }

    setIsAttaching(true);
    try {
        if (attachedFile.type.startsWith('image/')) {
            const imageUrl = await fileToDataURI(attachedFile);
            setFormData(prev => ({ ...prev, imageUrl }));
            toast({ title: "Image Attached", description: `"${attachedFile.name}" has been attached.` });
        } else {
            const text = await extractTextFromFile(attachedFile);
            setFormData(prev => ({
                ...prev,
                content: prev.content ? `${prev.content}\n\n--- Attached Content ---\n\n${text}` : text
            }));
            toast({ title: "File Attached", description: `Content from "${attachedFile.name}" has been added.` });
        }
    } catch (e: any) {
        console.error(e);
        toast({ variant: 'destructive', title: 'Attachment Error', description: e.message || 'Could not process the attached file.' });
    } finally {
        setIsAttaching(false);
        if (manualFileInputRef.current) {
            manualFileInputRef.current.value = "";
        }
    }
  }


  async function handleUploadSubmit() {
    if (!file) return;
    setIsProcessing(true);

    try {
        let documentContent = '';
        let imageUrl: string | undefined = undefined;

        if (file.type.startsWith('image/')) {
            imageUrl = await fileToDataURI(file);
        } else {
            documentContent = await extractTextFromFile(file);
        }

      const { processedSource, error } = await processFileUploadAction(documentContent, imageUrl);
        
      setIsProcessing(false);
      if (error || !processedSource) {
          toast({ variant: 'destructive', title: 'Processing Failed', description: error || 'An unknown error occurred.' });
          return;
      }

      toast({ title: "Source Added", description: `"${processedSource.title}" has been processed and added.` });
      handleOpenChange(false);
    } catch (e: any) {
        console.error(e);
        setIsProcessing(false);
        toast({ variant: 'destructive', title: 'File Processing Error', description: e.message || 'Could not process the selected file.' });
    }
  }

  async function handleFormSubmit() {
    if ((!formData.title || !formData.category) && (!formData.content && !formData.imageUrl)) {
        toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please fill out title, category, and provide content or an image.' });
        return;
    }
     if (!summary) {
        toast({ variant: 'destructive', title: 'Summary Required', description: 'Please generate a summary before adding the source.' });
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
        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
            <div className="flex items-center gap-3">
                {isImage ? (
                    <Image src={URL.createObjectURL(file)} alt="Preview" width={40} height={40} className="rounded object-cover h-10 w-10" />
                ) : (
                    <Icon className="w-6 h-6 text-primary" />
                )}
                <div className="flex flex-col">
                    <span className="text-sm font-medium">{file.name}</span>
                    <span className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</span>
                </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setFile(null)} className="h-7 w-7 rounded-full">
                <X className="h-4 w-4" />
            </Button>
        </div>
    );
  }
  
  const renderContent = () => {
    if (inputMethod === 'upload') {
      return (
        <>
        <DialogDescription>
            Upload a document (PDF, TXT, MD) or an image (JPG, PNG). The AI will automatically extract the title, category, and summary.
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
                    <p className="text-xs text-muted-foreground">PDF, TXT, MD, JPG, or PNG files</p>
                    <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => handleFileChange(e.target.files)} accept=".pdf,.txt,.md,image/jpeg,image/png,image/webp" />
                </div>
            ) : (
                renderFilePreview()
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
                Fill in the details for your source. You can paste text, attach a file, or upload an image.
            </DialogDescription>
            <div className="grid gap-4 py-4">
                <Input name="title" placeholder="Source Title" value={formData.title} onChange={handleFormChange} />
                {formData.imageUrl && (
                    <div className="relative">
                        <Image src={formData.imageUrl} alt="Attached image" width={500} height={300} className="rounded-md object-contain border max-h-[200px] w-full"/>
                        <Button variant="destructive" size="icon" onClick={() => setFormData(p => ({...p, imageUrl: ''}))} className="absolute top-2 right-2 h-7 w-7 rounded-full">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
                <div className="relative">
                    <Textarea name="content" placeholder="Paste or write your source content here..." value={formData.content} onChange={handleFormChange} className="min-h-[120px] pr-28" />
                    <div className="absolute top-2 right-2 flex flex-col gap-2">
                        <Button size="sm" onClick={() => manualFileInputRef.current?.click()} variant="outline" disabled={isAttaching}>
                            {isAttaching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Paperclip className="mr-2 h-4 w-4" />}
                            Attach
                        </Button>
                         <input ref={manualFileInputRef} type="file" className="hidden" onChange={(e) => handleManualFileChange(e.target.files)} accept=".pdf,.txt,.md,image/jpeg,image/png,image/webp" />
                        <Button size="sm" onClick={handleGenerateSummary} disabled={isSummarizing || (!formData.content && !formData.imageUrl)}>
                            {isSummarizing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Summarize
                        </Button>
                    </div>
                </div>
                <Textarea readOnly placeholder="AI-generated summary will appear here." value={summary} className="min-h-[80px]" />
                <div className="grid grid-cols-2 gap-4">
                    <Select onValueChange={handleCategoryChange} value={formData.category}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                            {CATEGORIES.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select onValueChange={handleCircleChange} value={formData.circle}>
                        <SelectTrigger><SelectValue placeholder="Select circle" /></SelectTrigger>
                        <SelectContent>
                            {CIRCLES.map(cir => <SelectItem key={cir} value={cir}>{cir}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                 <Input name="url" placeholder="Source URL (optional)" value={formData.url} onChange={handleFormChange} />
                 <Input name="contributor" placeholder="Contributor Name (optional)" value={formData.contributor} onChange={handleFormChange} />
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
                <span>Upload File</span>
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
