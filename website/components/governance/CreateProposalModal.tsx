'use client';

import { useCreateProposal } from '@/hooks/useGovernance';
import { PROPOSAL_TYPES } from '@/lib/constants';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface CreateProposalModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateProposalModal({ open, onClose }: CreateProposalModalProps) {
  const { createProposal, isPending, isSuccess } = useCreateProposal();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [proposalType, setProposalType] = useState('0');
  const [options, setOptions] = useState(['', '']);
  const [duration, setDuration] = useState('86400'); // 1 day default

  const addOption = () => setOptions([...options, '']);
  const removeOption = (i: number) => setOptions(options.filter((_, idx) => idx !== i));
  const updateOption = (i: number, val: string) => {
    const updated = [...options];
    updated[i] = val;
    setOptions(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const filtered = options.filter((o) => o.trim());
    if (!title || !description || filtered.length < 2) return;
    createProposal(parseInt(proposalType), title, description, filtered, parseInt(duration));
  };

  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="bg-[#0c1324] border-[rgba(134,148,138,0.08)] text-[#dce1fb]">
          <div className="text-center py-6">
            <p className="text-4xl mb-4">🗳️</p>
            <h3 className="font-heading text-xl font-bold">Proposal Created!</h3>
            <p className="text-sm text-[#bbcabf] mt-2">Community members can now vote on your proposal.</p>
            <Button onClick={onClose} className="mt-4 primary-gradient text-white">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#0c1324] border-[rgba(134,148,138,0.08)] text-[#dce1fb] max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">Create Proposal</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm text-[#bbcabf]">Proposal Type</Label>
            <Select value={proposalType} onValueChange={(v) => v && setProposalType(v)}>
              <SelectTrigger className="bg-[#191f31] border-[rgba(134,148,138,0.15)] text-[#dce1fb] mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#191f31] border-[rgba(134,148,138,0.15)] text-[#dce1fb]">
                {PROPOSAL_TYPES.map((type, i) => (
                  <SelectItem key={i} value={String(i)}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm text-[#bbcabf]">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. PSL Season 9 MVP"
              className="bg-[#191f31] border-[rgba(134,148,138,0.15)] text-[#dce1fb] mt-1"
              required
            />
          </div>

          <div>
            <Label className="text-sm text-[#bbcabf]">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the proposal..."
              className="bg-[#191f31] border-[rgba(134,148,138,0.15)] text-[#dce1fb] mt-1 min-h-[80px]"
              required
            />
          </div>

          <div>
            <Label className="text-sm text-[#bbcabf]">Voting Duration</Label>
            <Select value={duration} onValueChange={(v) => v && setDuration(v)}>
              <SelectTrigger className="bg-[#191f31] border-[rgba(134,148,138,0.15)] text-[#dce1fb] mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#191f31] border-[rgba(134,148,138,0.15)] text-[#dce1fb]">
                <SelectItem value="3600">1 Hour</SelectItem>
                <SelectItem value="86400">1 Day</SelectItem>
                <SelectItem value="259200">3 Days</SelectItem>
                <SelectItem value="604800">7 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm text-[#bbcabf]">Options (min 2)</Label>
            <div className="space-y-2 mt-1">
              {options.map((opt, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    value={opt}
                    onChange={(e) => updateOption(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    className="bg-[#191f31] border-[rgba(134,148,138,0.15)] text-[#dce1fb]"
                  />
                  {options.length > 2 && (
                    <button type="button" onClick={() => removeOption(i)} className="text-red-400 hover:text-red-300 p-2">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
              {options.length < 10 && (
                <button
                  type="button"
                  onClick={addOption}
                  className="flex items-center gap-1 text-xs text-[#38BDF8] hover:text-[#7bd0ff]"
                >
                  <Plus className="h-3 w-3" /> Add Option
                </button>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-[rgba(134,148,138,0.15)] text-[#bbcabf]">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="flex-1 primary-gradient text-white">
              {isPending ? 'Creating…' : 'Create Proposal'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
