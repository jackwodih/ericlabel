'use client';

import React from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import { ImageIcon, X } from 'lucide-react';
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
        <CldUploadWidget 
          uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || 'label_designs'}
          onSuccess={(results) => {
            const info = results.info as any; // Still cast but avoid any in signature
            if (info && info.secure_url) {
              onUpload(info.secure_url);
            }
          }}
          options={{
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            maxFiles: 1,
            sources: ['local', 'url'],
            folder: 'logos',
            clientAllowedFormats: ['png', 'jpg', 'jpeg', 'svg'],
          }}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              className="w-full h-32 rounded-xl border-2 border-dashed border-white/20 hover:border-orange-500/50 bg-white/5 hover:bg-white/10 transition-all flex flex-col items-center justify-center gap-2 group"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ImageIcon className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-white">{label}</p>
                <p className="text-xs text-gray-500">{description}</p>
              </div>
            </button>
          )}
        </CldUploadWidget>
      )}
    </div>
  );
}
