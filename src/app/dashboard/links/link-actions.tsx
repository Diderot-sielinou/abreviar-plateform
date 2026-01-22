"use client";

/**
 * Link Actions Component
 * 
 * Client component for interactive actions: Copy URL, QR Code
 */

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { QRCodeButton } from "@/components/qr-code-modal";

interface LinkActionsProps {
  shortUrl: string;
  slug: string;
}

export function LinkActions({ shortUrl, slug }: LinkActionsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleCopy}>
        {copied ? (
          <Check className="w-4 h-4 mr-1 text-green-500" />
        ) : (
          <Copy className="w-4 h-4 mr-1" />
        )}
        Copy
      </Button>
      <QRCodeButton url={shortUrl} slug={slug} />
    </>
  );
}
