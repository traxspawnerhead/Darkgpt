'use client';

import { useState, useEffect, useMemo } from 'react';
import { ChatMessages } from './chat-messages';
import { ChatInput } from './chat-input';
import type { Message } from '@/lib/types';
import { generateChatResponse } from '@/ai/flows/generate-chat-response';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase';
import {
  collection,
  query,
  orderBy,
  limit,
  serverTimestamp,
} from 'firebase/firestore';
import { useCollection } from '@/firebase/firestore/use-collection';
import { addDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useRouter } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function ChatLayout() {
  const [isLoading, setIsLoading] = useState(false);
  const [isExpertMode, setIsExpertMode] = useState(false);
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const { toast } = useToast();
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [isUserLoading, user, router]);

  const messagesCollectionRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, 'users', user.uid, 'messages');
  }, [firestore, user]);

  const messagesQuery = useMemoFirebase(() => {
    if (!messagesCollectionRef) return null;
    return query(messagesCollectionRef, orderBy('createdAt', 'asc'), limit(50));
  }, [messagesCollectionRef]);

  const { data: firestoreMessages, isLoading: isLoadingMessages } = useCollection<Message>(messagesQuery);
  
  const initialMessage: Message = useMemo(() => (
    {
      id: '1',
      role: 'assistant',
      content: "Je suis DarkGPT. Comment puis-je vous aider aujourd'hui?",
      createdAt: new Date(Date.now() - 1000 * 60 * 5),
    }
  ), []);

  useEffect(() => {
    if (firestoreMessages) {
      if (firestoreMessages.length > 0) {
        setLocalMessages(firestoreMessages);
      } else {
        setLocalMessages([initialMessage]);
      }
    } else if (!isLoadingMessages) {
        setLocalMessages([initialMessage]);
    }
  }, [firestoreMessages, isLoadingMessages, initialMessage]);

  const handleSendMessage = async (messageContent: string, image?: string) => {
    if (!user || !firestore || !messagesCollectionRef) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "L'utilisateur ou la base de données n'est pas disponible.",
      });
      return;
    }

    setIsLoading(true);

    const newMessage: Omit<Message, 'id' | 'createdAt'> = {
      role: 'user',
      content: messageContent,
      userId: user.uid,
      image: image,
    };
    
    addDocumentNonBlocking(messagesCollectionRef, {
      ...newMessage,
      createdAt: serverTimestamp(),
    });
    
    const tempMessage: Message = {
      ...newMessage,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    
    // Optimistic UI update
    const updatedLocalMessages = [...localMessages, tempMessage];
    setLocalMessages(updatedLocalMessages);


    try {
      const chatHistory = updatedLocalMessages
          .map(m => `${m.role}: ${m.image ? '[IMAGE] ' : ''}${m.content}`)
          .join('\n');
          
      const result = await generateChatResponse({ chatHistory, image, useWebSearch: isExpertMode });
      
      const aiResponse: Omit<Message, 'id'| 'createdAt'> = {
        role: 'assistant',
        content: result.response,
        userId: user.uid,
      };

      addDocumentNonBlocking(messagesCollectionRef, {
        ...aiResponse,
        createdAt: serverTimestamp(),
      });

    } catch (error: any) {
      console.error('Failed to get AI response:', error);
      toast({
        variant: 'destructive',
        title: "Erreur de l'IA",
        description: error.message || "Désolé, je n'ai pas pu traiter votre demande.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isUserLoading || !user) {
    return (
       <div className="flex h-full w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
        <div className="flex items-center justify-end space-x-2 p-2 border-b border-primary/20">
          <Label htmlFor="expert-mode">Mode Expert</Label>
          <Switch
            id="expert-mode"
            checked={isExpertMode}
            onCheckedChange={setIsExpertMode}
            disabled={isLoading}
          />
        </div>
      <div className="flex-1 overflow-y-auto">
        <ChatMessages messages={localMessages} isLoading={isLoading || (isLoadingMessages && localMessages.length === 0)} />
      </div>
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
}
