'use client';

import * as React from 'react';
import { Send, Loader2, BrainCircuit } from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getAnswerAction } from '@/app/actions';
import { mockSources } from '@/lib/data';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
}

export default function QAPage() {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const { toast } = useToast();
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: crypto.randomUUID(), role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const allContent = mockSources.map((s) => `Title: ${s.title}\nContent: ${s.content}`).join('\n\n---\n\n');
      const { answer, error } = await getAnswerAction(input, allContent);

      if (error) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error,
        });
        const errorMessage: Message = { id: crypto.randomUUID(), role: 'assistant', text: error };
        setMessages((prev) => [...prev, errorMessage]);
      } else {
        const assistantMessage: Message = { id: crypto.randomUUID(), role: 'assistant', text: answer };
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (err) {
      const errorMessage = 'An unexpected error occurred.';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
      const assistantMessage: Message = { id: crypto.randomUUID(), role: 'assistant', text: errorMessage };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <PageHeader
        title="AI-Powered Q&A"
        description="Ask questions about your content repository to find updates quickly."
      />
      <main className="flex-1 flex flex-col overflow-hidden px-4 sm:px-6 md:px-8 pb-4">
        <div className="flex-1 overflow-y-auto rounded-lg border bg-card p-4 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <BrainCircuit className="w-16 h-16 text-primary/50 mb-4" />
              <h2 className="text-xl font-semibold">Welcome to the Q&A Hub</h2>
              <p className="text-muted-foreground">
                Ask me anything about your sources, like "What were the biggest wins last quarter?"
              </p>
            </div>
          )}
          {messages.map((m) => (
            <div key={m.id} className={cn('flex items-start gap-4', m.role === 'user' && 'justify-end')}>
              {m.role === 'assistant' && (
                <Avatar className="h-8 w-8 border">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <BrainCircuit className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-xl rounded-lg px-4 py-2',
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                )}
              >
                <p className="text-sm whitespace-pre-wrap">{m.text}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-4">
              <Avatar className="h-8 w-8 border">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <BrainCircuit className="h-5 w-5" />
                  </AvatarFallback>
              </Avatar>
              <div className="bg-muted rounded-lg px-4 py-3 flex items-center">
                <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="mt-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}
