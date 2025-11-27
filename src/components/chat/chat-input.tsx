'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, Send, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

const formSchema = z.object({
  message: z.string(),
  image: z.string().optional(),
});

interface ChatInputProps {
  onSendMessage: (message: string, image?: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [tokenCount, setTokenCount] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
      image: '',
    },
  });

  const messageValue = form.watch('message');
  const imageValue = form.watch('image');

  useEffect(() => {
    const words = messageValue.trim().split(/\s+/).filter(Boolean);
    setTokenCount(words.length);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [messageValue]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { message, image } = values;
    if (isLoading || (!message.trim() && !image)) return;

    onSendMessage(message, image);
    form.reset();
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) { // 4MB limit
        toast({
          variant: 'destructive',
          title: 'Fichier trop volumineux',
          description: "L'image ne doit pas dépasser 4 Mo.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('image', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    form.setValue('image', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const canSubmit = !isLoading && (!!messageValue.trim() || !!imageValue);

  return (
    <div className="p-4 border-t border-border bg-card/80 backdrop-blur-sm rounded-b-xl">
      {imageValue && (
        <div className="relative mb-2 w-24 h-24 rounded-md overflow-hidden border">
          <Image src={imageValue} alt="Aperçu de l'image" layout="fill" objectFit="cover" />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 h-6 w-6 bg-black/50 hover:bg-black/75 text-white"
            onClick={clearImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="relative">
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    ref={textareaRef}
                    placeholder="Tapez votre message ou joignez une image..."
                    className="pr-28 min-h-[48px] max-h-48 resize-none bg-background/80"
                    onKeyDown={handleKeyDown}
                    rows={1}
                    disabled={isLoading}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/png, image/jpeg, image/gif, image/webp"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              disabled={isLoading}
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-5 w-5" />
              <span className="sr-only">Joindre une image</span>
            </Button>
            <Button type="submit" size="icon" disabled={!canSubmit} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Send className="h-5 w-5" />
              <span className="sr-only">Envoyer</span>
            </Button>
          </div>
        </form>
      </Form>
      <div className="text-xs text-muted-foreground text-right mt-2 pr-2">
        Jetons: {tokenCount}
      </div>
    </div>
  );
}
