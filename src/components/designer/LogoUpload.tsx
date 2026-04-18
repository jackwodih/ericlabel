'use client';

import React, { useRef, useState } from 'react';
import { ImageIcon, X, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface LogoUploadProps {
  onUpload: (url: string) => void;
  onRemove: () => void;
  value?: string;
  label?: string;
  description?: string;
}

export function LogoUpload({ 
  onUpload, 
  onRemove, 
  value, 
  label = "Ajouter un Logo",
  description = "PNG, JPG ou SVG (Max 10Mo)"
}: LogoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'labeleric');
    formData.append('folder', 'logos');

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      if (data.secure_url) {
        onUpload(data.secure_url);
      }
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      alert('Erreur lors de l\'upload de l\'image.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {value ? (
        <div className="relative w-32 h-32 rounded-lg border border-white/10 bg-white/5 overflow-hidden group">
          <Image 
            src={value} 
            alt="Logo" 
            fill
            className="object-contain p-2"
          />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-1 right-1 p-1 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4 text-white" />
          </button>
        </div>
      ) : (
        <>
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full h-32 rounded-xl border-2 border-dashed border-white/20 hover:border-orange-500/50 bg-white/5 hover:bg-white/10 transition-all flex flex-col items-center justify-center gap-2 group disabled:opacity-50"
          >
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
              {isUploading ? (
                <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
              ) : (
                <ImageIcon className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-white">
                {isUploading ? 'Chargement...' : label}
              </p>
              <p className="text-xs text-gray-500">{description}</p>
            </div>
          </button>
        </>
      )}
    </div>
  );
}
