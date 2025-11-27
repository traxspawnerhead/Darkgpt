'use client';

import { Button } from '@/components/ui/button';
import { SettingsPopover } from './settings-popover';
import { LogOut, PlusCircle, Trash2 } from 'lucide-react';
import { useAuth, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import Link from 'next/link';
import { collection, getDocs, writeBatch } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

export function ChatHeader() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const handleLogout = () => {
    if (auth) {
      auth.signOut();
    }
  };

  const handleNewChat = async () => {
    if (!firestore || !user) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de démarrer une nouvelle conversation.',
      });
      return;
    }

    const messagesCollectionRef = collection(firestore, 'users', user.uid, 'messages');
    
    try {
      const querySnapshot = await getDocs(messagesCollectionRef);
      if (querySnapshot.empty) {
        toast({ description: "La conversation est déjà vide."});
        return;
      }

      const batch = writeBatch(firestore);
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      toast({
        title: 'Nouvelle conversation',
        description: 'Votre conversation a été effacée.',
      });
    } catch (error) {
      console.error('Error clearing chat:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de supprimer les messages.',
      });
    }
  };

  return (
    <header className="flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur-sm rounded-t-xl">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-headline font-bold text-primary">
          DarkGPT
        </h1>
      </div>
      <div className="flex items-center gap-2">
        {isUserLoading ? (
          <div className="w-20 h-8 bg-muted animate-pulse rounded-md" />
        ) : user ? (
          <>
            <Button variant="ghost" size="icon" onClick={handleNewChat} title="Nouvelle conversation">
              <PlusCircle className="h-5 w-5" />
            </Button>
            <SettingsPopover />
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Déconnexion">
              <LogOut className="h-5 w-5" />
            </Button>
          </>
        ) : (
          <>
            <Button asChild variant="ghost">
              <Link href="/login">Connexion</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">S'inscrire</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
