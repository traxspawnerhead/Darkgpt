'use client';

import type { Message } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEffect, useRef } from 'react';
import Image from 'next/image';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages, isLoading]);


  const onCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      description: 'Message copié dans le presse-papiers.',
    });
  };

  return (
    <ScrollArea className="flex-1" viewportRef={scrollAreaRef}>
      <div className="p-4 flex flex-col gap-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'flex gap-3 animate-in fade-in-0 slide-in-from-bottom-4 duration-500',
              message.role === 'user' ? 'justify-end' : 'justify-start'
            )}
          >
            <div
              className={cn(
                'rounded-lg p-3 max-w-sm md:max-w-md lg:max-w-lg relative group break-words',
                message.role === 'user'
                  ? 'bg-accent text-accent-foreground'
                  : 'bg-background/80 text-card-foreground border border-primary/20'
              )}
            >
              {message.image && (
                 <div className="relative w-full aspect-video rounded-md overflow-hidden mb-2">
                    <Image src={message.image} alt="Image upload" layout="fill" objectFit="contain" />
                 </div>
              )}
              <p className="whitespace-pre-wrap font-body">{message.content}</p>
              <div className="text-xs text-muted-foreground mt-2 text-right">
                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => onCopy(message.content)}
              >
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copier le message</span>
              </Button>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-background/80 text-card-foreground p-3 rounded-lg flex items-center gap-2 border border-primary/20">
              <span style={{ animationDelay: '0ms' }} className="h-2 w-2 bg-primary rounded-full animate-pulse" />
              <span style={{ animationDelay: '200ms' }} className="h-2 w-2 bg-primary rounded-full animate-pulse" />
              <span style={{ animationDelay: '400ms' }} className="h-2 w-2 bg-primary rounded-full animate-pulse" />
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
