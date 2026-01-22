"use client";

/**
 * QR Code Modal Component
 * 
 * Displays a QR code for a short link with download options.
 * Uses Portal to render at document root for proper positioning.
 */

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { X, Download, Copy, Check, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  slug: string;
}

export function QRCodeModal({ isOpen, onClose, url, slug }: QRCodeModalProps) {
  const [copied, setCopied] = useState(false);
  const [size, setSize] = useState<"sm" | "md" | "lg">("md");
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Wait for client-side mount before using portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const sizes = {
    sm: 128,
    md: 200,
    lg: 300,
  };

  const currentSize = sizes[size];

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("URL copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPNG = () => {
    const canvas = canvasRef.current?.querySelector("canvas");
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `qr-${slug}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("QR code downloaded!");
  };

  const handleDownloadSVG = () => {
    const svg = document.getElementById("qr-svg");
    if (!svg) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);
    const blob = new Blob([svgString], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.download = `qr-${slug}.svg`;
    link.href = URL.createObjectURL(blob);
    link.click();
    toast.success("QR code downloaded!");
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-modal-title"
        className="relative z-10 w-full max-w-md mx-4 bg-card border border-border rounded-2xl shadow-2xl shadow-tangerine/10 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-tangerine/20 to-rust/20 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-tangerine" />
            </div>
            <h3 id="qr-modal-title" className="font-display font-semibold">QR Code</h3>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* QR Code Display */}
          <div className="flex flex-col items-center">
            {/* SVG version (visible) */}
            <div className="p-4 bg-white rounded-xl mb-4">
              <QRCodeSVG
                id="qr-svg"
                value={url}
                size={currentSize}
                level="H"
                includeMargin={false}
                fgColor="#0E0503"
                bgColor="#FFFFFF"
              />
            </div>

            {/* Canvas version (hidden, for PNG download) */}
            <div ref={canvasRef} className="hidden">
              <QRCodeCanvas
                value={url}
                size={currentSize * 2}
                level="H"
                includeMargin={true}
                fgColor="#0E0503"
                bgColor="#FFFFFF"
              />
            </div>

            {/* Size selector */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-muted-foreground">Size:</span>
              <div className="flex rounded-lg border border-border overflow-hidden">
                {(["sm", "md", "lg"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`px-3 py-1 text-sm font-medium transition-colors ${
                      size === s
                        ? "bg-primary text-primary-foreground"
                        : "bg-background hover:bg-accent"
                    }`}
                  >
                    {s.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* URL display */}
            <div className="w-full bg-muted rounded-lg p-3 flex items-center justify-between gap-2 mb-4">
              <code className="text-sm text-tangerine truncate flex-1">
                {url}
              </code>
              <Button variant="ghost" size="icon-sm" onClick={handleCopyUrl}>
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>

            {/* Download buttons */}
            <div className="flex items-center gap-2 w-full">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleDownloadPNG}
              >
                <Download className="w-4 h-4 mr-2" />
                PNG
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleDownloadSVG}
              >
                <Download className="w-4 h-4 mr-2" />
                SVG
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-muted/50 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Scan this QR code to open the link. Works with any camera app.
          </p>
        </div>
      </div>
    </div>
  );

  // Render modal in portal at document body
  return createPortal(modalContent, document.body);
}

/**
 * QR Code Button with integrated modal
 */
interface QRCodeButtonProps {
  url: string;
  slug: string;
  variant?: "outline" | "ghost";
  size?: "sm" | "default";
  showLabel?: boolean;
}

export function QRCodeButton({ 
  url, 
  slug, 
  variant = "outline", 
  size = "sm",
  showLabel = true 
}: QRCodeButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant={variant} size={size} onClick={() => setIsOpen(true)}>
        <QrCode className="w-4 h-4" />
        {showLabel && <span className="ml-1">QR</span>}
      </Button>
      <QRCodeModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        url={url}
        slug={slug}
      />
    </>
  );
}