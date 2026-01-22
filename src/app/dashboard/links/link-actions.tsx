// ============================================================
// FICHIER 4: src/app/dashboard/links/link-actions.tsx (REMPLACER)
// Correction: Menu dropdown fonctionnel + Copy + QR
// ============================================================

"use client";

import { useState } from "react";
import Link from "next/link";
import { Copy, Check, MoreHorizontal, Pencil, Trash2, BarChart3, Power, PowerOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { QRCodeButton } from "@/components/qr-code-modal";

interface LinkActionsProps {
  shortUrl: string;
  slug: string;
  linkId: string;
  isActive: boolean;
}

export function LinkActions({ shortUrl, slug, linkId, isActive }: LinkActionsProps) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const handleToggleActive = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/links/${linkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      if (res.ok) {
        toast.success(isActive ? "Link disabled" : "Link enabled");
        // Recharger la page pour voir les changements
        window.location.reload();
      } else {
        toast.error("Failed to update link");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this link? This action cannot be undone.")) {
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/links/${linkId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Link deleted");
        window.location.reload();
      } else {
        toast.error("Failed to delete link");
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Bouton Copy */}
      <Button variant="outline" size="sm" onClick={handleCopy}>
        {copied ? (
          <Check className="w-4 h-4 mr-1 text-green-500" />
        ) : (
          <Copy className="w-4 h-4 mr-1" />
        )}
        Copy
      </Button>

      {/* Bouton QR */}
      <QRCodeButton url={shortUrl} slug={slug} />

      {/* Menu dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" disabled={loading}>
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/analytics?link=${linkId}`}>
              <BarChart3 className="w-4 h-4 mr-2" />
              View Analytics
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/dashboard/links/${linkId}/edit`}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit Link
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleToggleActive}>
            {isActive ? (
              <>
                <PowerOff className="w-4 h-4 mr-2" />
                Disable Link
              </>
            ) : (
              <>
                <Power className="w-4 h-4 mr-2" />
                Enable Link
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Link
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}