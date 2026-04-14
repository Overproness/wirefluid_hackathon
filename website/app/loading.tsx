import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#020617]">
      {/* Navbar skeleton */}
      <div className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#020617]/80 border-b border-[rgba(134,148,138,0.1)]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-8 w-36 bg-[#191f31] rounded-lg" />
          <Skeleton className="h-8 w-48 bg-[#191f31] rounded-lg" />
        </div>
      </div>

      {/* Page skeleton */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <Skeleton className="h-10 w-64 bg-[#191f31] rounded-lg" />
        <Skeleton className="h-48 w-full bg-[#191f31] rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 bg-[#191f31] rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full bg-[#191f31] rounded-xl" />
      </main>
    </div>
  );
}
