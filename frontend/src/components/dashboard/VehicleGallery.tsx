"use client";

import { useState, useEffect, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import api from "@/lib/api";
import { Loader2, Plus, Trash2, X, Image as ImageIcon } from "lucide-react";

interface VehicleImage {
    id: number;
    vehicle_id: number;
    image_path: string;
    is_primary: boolean;
    created_at: string;
}

interface Props {
    vehicleId: number;
    onClose: () => void;
}

export default function VehicleGallery({ vehicleId, onClose }: Props) {
    const [images, setImages] = useState<VehicleImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const ASSET_URL = process.env.NEXT_PUBLIC_ASSET_URL || "http://127.0.0.1:8000";

    const fetchImages = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/vehicles/${vehicleId}/images`);
            if (res.data.success) {
                setImages(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch vehicle images", error);
        } finally {
            setLoading(false);
        }
    }, [vehicleId]);

    useEffect(() => {
        fetchImages();
    }, [fetchImages]);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) return;
        setUploading(true);

        const file = acceptedFiles[0];
        const formData = new FormData();
        formData.append("image", file);

        try {
            await api.post(`/vehicles/${vehicleId}/images`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            fetchImages();
        } catch (error) {
            console.error("Failed to upload image", error);
        } finally {
            setUploading(false);
        }
    }, [vehicleId, fetchImages]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        maxFiles: 1,
        maxSize: 10 * 1024 * 1024 // 10MB
    });

    const deleteImage = async (imageId: number) => {
        if (!confirm("Remove this image from your gallery?")) return;
        try {
            await api.delete(`/vehicles/${vehicleId}/images/${imageId}`);
            setImages(images.filter(img => img.id !== imageId));
        } catch (error) {
            console.error("Failed to delete image", error);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-8 border-b border-slate-100 bg-slate-50/50">
                    <div>
                        <h3 className="text-2xl font-black text-[#003366] uppercase tracking-tighter">Vehicle Gallery</h3>
                        <p className="text-sm font-medium text-slate-500 italic">Manage photos of your vehicle</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white border border-slate-200 text-slate-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto flex-grow bg-slate-50/30">
                    {/* Dropzone */}
                    <div
                        {...getRootProps()}
                        className={`mb-10 w-full rounded-[32px] border-2 border-dashed p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300
                            ${isDragActive ? 'border-red-500 bg-red-50/50' : 'border-slate-200 hover:border-[#003366]/30 hover:bg-slate-50'}
                            ${uploading ? 'opacity-50 pointer-events-none' : ''}
                        `}
                    >
                        <input {...getInputProps()} />
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-slate-100 mb-6 group-hover:scale-110 transition-transform">
                            {uploading ? (
                                <Loader2 size={24} className="animate-spin text-red-600" />
                            ) : (
                                <Plus size={24} className="text-[#003366]" />
                            )}
                        </div>
                        <h4 className="text-sm font-black text-[#003366] uppercase tracking-widest mb-2">
                            {uploading ? 'Uploading Image...' : 'Drop Vehicle Photo Here'}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">or click to browse files (Max 10MB)</p>
                    </div>

                    {/* Gallery Grid */}
                    {loading ? (
                        <div className="flex justify-center p-10">
                            <Loader2 size={32} className="animate-spin text-slate-300" />
                        </div>
                    ) : images.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                            {images.map(img => (
                                <div key={img.id} className="group relative rounded-[24px] overflow-hidden aspect-video bg-slate-100 shadow-sm border border-slate-200/50">
                                    <img
                                        src={img.image_path.startsWith('http') ? img.image_path : `${ASSET_URL}/${img.image_path}`}
                                        alt="Vehicle"
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteImage(img.id); }}
                                            className="self-end w-10 h-10 bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20 transition-all translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    {img.is_primary && (
                                        <div className="absolute top-4 left-4 bg-[#003366] text-white px-3 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg shadow-md">
                                            Primary
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-[32px] border border-slate-100">
                            <ImageIcon size={48} className="text-slate-200 mb-4" />
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No images uploaded yet</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
