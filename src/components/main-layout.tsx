'use client';

import { ChatLayout } from '@/components/chat/chat-layout';
import { ChatHeader } from '@/components/chat/header';

export function MainLayout() {
  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto bg-card/80 backdrop-blur-sm rounded-xl shadow-lg border border-primary/20">
      <ChatHeader />
      <div className="flex-1 overflow-hidden">
        <ChatLayout />
      </div>
    </div>
  );
}
