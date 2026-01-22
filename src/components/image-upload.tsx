

"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  maxSize?: number; // en MB
}

export function ImageUpload({ value, onChange, maxSize = 2 }: ImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string>(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Vérifier la taille
    if (file.size > maxSize * 1024 * 1024) {
      toast.error(`Image must be less than ${maxSize}MB`);
      return;
    }

    setLoading(true);

    try {
      // Option 1: Convertir en base64 (fonctionne sans serveur externe)
      const base64 = await fileToBase64(file);
      
      // Option 2: Upload vers un service (Cloudinary, etc.)
      // const url = await uploadToCloudinary(file);
      
      setPreview(base64);
      onChange(base64);
      toast.success("Image uploaded!");
    } catch (error) {
      toast.error("Failed to process image");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setPreview("");
    onChange("");
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleUrlInput = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      // Valider l'URL
      try {
        new URL(url);
        setPreview(url);
        onChange(url);
      } catch {
        toast.error("Invalid URL");
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Zone d'upload */}
      {!preview ? (
        <div
          className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-tangerine/50 transition-colors cursor-pointer"
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          
          {loading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-8 h-8 text-tangerine animate-spin" />
              <p className="text-sm text-muted-foreground">Processing...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <Upload className="w-6 h-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Click to upload</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to {maxSize}MB</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden border border-border">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-40 object-cover"
            onError={() => {
              setPreview("");
              toast.error("Failed to load image");
            }}
          />
          <Button
            type="button"
            variant="destructive"
            size="icon-sm"
            className="absolute top-2 right-2"
            onClick={handleRemove}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Actions alternatives */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => inputRef.current?.click()}
          disabled={loading}
        >
          <ImageIcon className="w-4 h-4 mr-1" />
          {preview ? "Change" : "Upload"}
        </Button>
        <span className="text-xs text-muted-foreground">or</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleUrlInput}
          disabled={loading}
        >
          Paste URL
        </Button>
      </div>
    </div>
  );
}

// Convertir fichier en base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

// Optionnel: Upload vers Cloudinary (nécessite configuration)
// async function uploadToCloudinary(file: File): Promise<string> {
//   const formData = new FormData();
//   formData.append("file", file);
//   formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_PRESET!);
//   
//   const res = await fetch(
//     `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD}/image/upload`,
//     { method: "POST", body: formData }
//   );
//   
//   const data = await res.json();
//   return data.secure_url;
// }