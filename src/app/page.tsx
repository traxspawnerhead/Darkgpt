import { MainLayout } from '@/components/main-layout';
import { MatrixRainingLetters } from '@/components/matrix-raining-letters';

export default function Home() {
  return (
    <main className="flex h-screen flex-col items-center justify-center p-0 sm:p-4">
      <MatrixRainingLetters />
      <div className="z-10 h-full w-full">
        <MainLayout />
      </div>
    </main>
  );
}
