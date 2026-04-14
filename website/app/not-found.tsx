import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center px-4">
      <div className="glass-card rounded-xl p-8 max-w-md w-full text-center">
        <p className="font-display text-7xl text-[#4edea3] mb-4">404</p>
        <h2 className="font-heading text-2xl font-bold text-[#dce1fb] mb-2">
          Page Not Found
        </h2>
        <p className="text-sm text-[#bbcabf] mb-6">
          This page doesn&apos;t exist on the CricketChain arena.
        </p>
        <Link href="/">
          <Button className="primary-gradient text-white">Back to Home</Button>
        </Link>
      </div>
    </div>
  );
}
