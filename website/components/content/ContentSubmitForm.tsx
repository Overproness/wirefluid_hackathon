"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitContent } from "@/hooks/useContent";
import { useState } from "react";

export function ContentSubmitForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [metadataURI, setMetadataURI] = useState("");
  const { submitContent, isPending, isSuccess } = useSubmitContent();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !metadataURI) return;
    submitContent(metadataURI, title, description);
  };

  if (isSuccess) {
    return (
      <div className="glass-card rounded-xl p-8 text-center max-w-xl mx-auto">
        <p className="text-4xl mb-4">✅</p>
        <h3 className="font-heading text-xl font-bold text-[#dce1fb]">
          Content Submitted!
        </h3>
        <p className="text-sm text-[#bbcabf] mt-2">
          A moderator will review your submission. You&apos;ll earn 50 XP upon
          approval.
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-4 primary-gradient text-white"
        >
          Submit Another
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="glass-card rounded-xl p-6">
        <h3 className="font-heading text-lg font-bold text-[#dce1fb] mb-4">
          Submit Content
        </h3>
        <p className="text-sm text-[#bbcabf] mb-6">
          Share cricket highlights, analysis, memes, or fan art. Approved
          content earns XP and can receive tips & sponsorships.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-sm text-[#bbcabf]">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Best catches of PSL Season 9"
              className="bg-[#191f31] border-[rgba(134,148,138,0.15)] text-[#dce1fb] mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="description" className="text-sm text-[#bbcabf]">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your content..."
              className="bg-[#191f31] border-[rgba(134,148,138,0.15)] text-[#dce1fb] mt-1 min-h-[100px]"
              required
            />
          </div>

          <div>
            <Label htmlFor="uri" className="text-sm text-[#bbcabf]">
              Content URI
            </Label>
            <Input
              id="uri"
              value={metadataURI}
              onChange={(e) => setMetadataURI(e.target.value)}
              placeholder="ipfs://... or https://..."
              className="bg-[#191f31] border-[rgba(134,148,138,0.15)] text-[#dce1fb] mt-1"
              required
            />
            <p className="text-[10px] text-[#86948a] mt-1">
              Link to your content (IPFS, YouTube, etc.)
            </p>
          </div>

          <Button
            type="submit"
            disabled={isPending}
            className="w-full primary-gradient text-white"
          >
            {isPending ? "Submitting…" : "Submit Content"}
          </Button>
        </form>
      </div>
    </div>
  );
}
