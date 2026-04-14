import { Skeleton } from '@/components/ui/skeleton';

export default function TicketsLoading() {
  return (
    <div className="min-h-screen bg-[#020617]">
      <div className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#020617]/80 border-b border-[rgba(134,148,138,0.1)]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-36 bg-[#191f31] rounded-lg" />
          <Skeleton className="h-8 w-48 bg-[#191f31] rounded-lg" />
        </div>
      </div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-12 w-56 bg-[#191f31] rounded-lg" />
        <Skeleton className="h-10 w-80 bg-[#191f31] rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-64 bg-[#191f31] rounded-xl" />
          ))}
        </div>
      </main>
    </div>
  );
}
