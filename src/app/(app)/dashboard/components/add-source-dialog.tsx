'use client';

import * as React from 'react';
import { Loader2, Sparkles, UploadCloud, FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Source } from '@/lib/types';
import { processDocumentAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AddSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSourceAdded: (source: Source) => void;
}

export function AddSourceDialog({ open, onOpenChange, onSourceAdded }: AddSourceDialogProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      // For now, we only support single file uploads
      const selectedFile = files[0];
      if (selectedFile.type === 'text/plain' || selectedFile.type === 'text/markdown' || selectedFile.type === 'application/pdf' || selectedFile.type.startsWith('text/')) {
        setFile(selectedFile);
      } else {
        toast({
            variant: 'destructive',
            title: 'Unsupported File Type',
            description: 'Please upload a plain text, markdown or PDF file.',
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
  
  const handleReset = () => {
    setFile(null);
    setIsProcessing(false);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      handleReset();
    }
    onOpenChange(isOpen);
  }

  async function handleSubmit() {
    if (!file) return;

    setIsProcessing(true);

    const reader = new FileReader();
    reader.readAsText(file, 'UTF-8');
    reader.onload = async (evt) => {
        const content = evt.target?.result as string;
        const { processedSource, error } = await processDocumentAction(content);
        
        setIsProcessing(false);

        if (error || !processedSource) {
            toast({
                variant: 'destructive',
                title: 'Processing Failed',
                description: error || 'An unknown error occurred.',
            });
            return;
        }

        const newSource: Source = {
            id: crypto.randomUUID(),
            ...processedSource,
            createdAt: new Date().toISOString(),
        };

        onSourceAdded(newSource);
        toast({
            title: "Source Added",
            description: `"${newSource.title}" has been processed and added.`
        });
        handleOpenChange(false);
    };
    reader.onerror = () => {
        setIsProcessing(false);
        toast({
            variant: 'destructive',
            title: 'File Read Error',
            description: 'Could not read the selected file.',
        });
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Add New Source from Document</DialogTitle>
          <DialogDescription>
            Upload a document. The AI will automatically extract the title, category, and summary.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
            {!file ? (
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
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
                    <p className="text-xs text-muted-foreground">TXT, MD, or PDF files</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={(e) => handleFileChange(e.target.files)}
                        accept=".txt,.md,.pdf,text/*"
                    />
                </div>
            ) : (
                <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                    <div className="flex items-center gap-3">
                        <FileText className="w-6 h-6 text-primary" />
                        <div className="flex flex-col">
                            <span className="text-sm font-medium">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                                {(file.size / 1024).toFixed(2)} KB
                            </span>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleReset} className="h-7 w-7 rounded-full">
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>

        <DialogFooter className="pt-4">
          <Button onClick={handleSubmit} disabled={isProcessing || !file}>
            {isProcessing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Process & Add Source
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
