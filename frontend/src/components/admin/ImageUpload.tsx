"use client";

import React, { useState, useRef } from 'react';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImageUploadProps {
    value: string | File | null;
    onChange: (file: File | null) => void;
    previewUrl?: string; // Initial expected URL (e.g. from the backend)
    className?: string;
    label?: string;
}

export function ImageUpload({ value, onChange, previewUrl, className = '', label = 'Feature Image' }: ImageUploadProps) {
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState<string | null>(previewUrl || null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Derive preview from value if it's a file
    React.useEffect(() => {
        if (value instanceof File) {
            const objectUrl = URL.createObjectURL(value);
            setPreview(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else if (typeof value === 'string' && value) {
            // If it's a new string from the backend
            setPreview(value);
        } else if (!value) {
            setPreview(null);
        }
    }, [value]);


    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/')) {
                onChange(file);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type.startsWith('image/')) {
                onChange(file);
            }
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onChange(null);
        if (inputRef.current) {
            inputRef.current.value = '';
        }
    };

    const onButtonClick = (e: React.MouseEvent) => {
        e.preventDefault();
        inputRef.current?.click();
    };

    return (
        <div className={`space-y-3 ${className}`}>
            {label && <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{label}</label>}
            <div
                className={`relative flex flex-col items-center justify-center w-full h-64 rounded-2xl border-2 border-dashed transition-all overflow-hidden ${dragActive
                        ? 'border-red-600 bg-red-600/5'
                        : preview ? 'border-transparent bg-slate-50' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleChange}
                    className="hidden"
                />

                {preview ? (
                    <div className="relative w-full h-full group">
                        <img
                            src={preview.startsWith('http') || preview.startsWith('blob:') || preview.startsWith('/images') ? preview : `${process.env.NEXT_PUBLIC_ASSET_URL || ''}${preview}`}
                            alt="Preview"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                            <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={handleRemove}
                                className="font-black text-[10px] uppercase tracking-widest rounded-full px-6"
                            >
                                <X size={14} className="mr-2" /> Remove Image
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg shadow-slate-200/50 mb-6 group-hover:scale-110 transition-transform">
                            <UploadCloud size={24} className="text-red-600" />
                        </div>
                        <p className="text-sm font-bold text-[#003366] mb-2">
                            <span className="text-red-600 cursor-pointer hover:underline" onClick={onButtonClick}>Click to browse</span> or drag and drop
                        </p>
                        <p className="text-xs text-slate-400 font-medium">SVG, PNG, JPG or GIF (max. 5MB)</p>
                    </div>
                )}
            </div>
        </div>
    );
}
