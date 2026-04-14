'use client';

import { useState } from 'react';
import { useRegister } from '@/hooks/useProfile';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function RegistrationPrompt() {
  const [username, setUsername] = useState('');
  const { register, isPending } = useRegister();

  const handleRegister = () => {
    if (!username.trim()) {
      toast.error('Username cannot be empty');
      return;
    }
    register(username.trim());
  };

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="glass-card rounded-xl p-8 max-w-md w-full text-center">
        <div className="mx-auto h-16 w-16 rounded-full bg-[#F59E0B]/10 flex items-center justify-center mb-4">
          <UserPlus className="h-8 w-8 text-[#F59E0B]" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-[#dce1fb] mb-2">
          Register as a Fan
        </h2>
        <p className="text-[#bbcabf] text-sm mb-6">
          Create your on-chain PSL identity. One transaction, free gas on testnet.
          Start earning XP immediately!
        </p>
        <div className="space-y-4">
          <Input
            placeholder="Choose your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-[#0c1324] border-[rgba(134,148,138,0.15)] text-[#dce1fb] placeholder:text-[#86948a] focus:border-[#4edea3]"
            onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
          />
          <Button
            className="w-full primary-gradient text-white font-semibold hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all"
            onClick={handleRegister}
            disabled={isPending || !username.trim()}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Registering...
              </>
            ) : (
              'Register & Enter Arena'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
