import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Film } from 'lucide-react';
import { useUploadMediaMutation } from '../../features/Api/adminApi';

const ImageUpload = ({ onUploadComplete, initialMediaId, label = "Featured Media", className = "" }) => {
    const [uploadMedia, { isLoading }] = useUploadMediaMutation();
    const [preview, setPreview] = useState(null); // URL or object
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Reset states
        setError(null);

        // Basic validation
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            setError("File size must be less than 10MB");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);

            const result = await uploadMedia(formData).unwrap();

            // Expected result: { media: { id, url, type, ... } }
            if (result && result.media) {
                setPreview({
                    url: result.media.url,
                    type: result.media.type
                });
                onUploadComplete(result.media.id);
            }
        } catch (err) {
            console.error("Upload failed details:", {
                status: err.status,
                data: err.data,
                message: err.message
            });
            const errorMessage = err.data?.error || err.data?.message || "Failed to upload file. Please try again.";
            setError(errorMessage);
        }
    };

    const handleClear = () => {
        setPreview(null);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onUploadComplete(null);
    };

    return (
        <div className={`space-y-2 ${className}`}>
            <label className="text-xs font-bold text-gray-500 uppercase block">{label}</label>

            <div className={`relative border-2 border-dashed rounded-xl overflow-hidden transition-colors ${error ? 'border-red-300 bg-red-50' : 'border-gray-200 dark:border-gray-700 hover:border-green-500'
                }`}>

                {isLoading ? (
                    <div className="h-48 flex flex-col items-center justify-center gap-3 bg-gray-50 dark:bg-gray-800">
                        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                        <span className="text-sm text-gray-500">Uploading...</span>
                    </div>
                ) : preview ? (
                    <div className="relative h-48 w-full bg-black/5 dark:bg-black/20 group">
                        {preview.type === 'video' ? (
                            <video
                                src={preview.url}
                                className="h-full w-full object-contain"
                                controls
                            />
                        ) : (
                            <img
                                src={preview.url}
                                alt="Preview"
                                className="h-full w-full object-contain"
                            />
                        )}

                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div
                        className="h-48 flex flex-col items-center justify-center gap-3 cursor-pointer bg-gray-50 dark:bg-gray-800/50"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="p-3 bg-white dark:bg-gray-700 rounded-full shadow-sm">
                            <Upload className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="text-center px-4">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                Click to upload
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                SVG, PNG, JPG or Video (max. 10MB)
                            </p>
                        </div>
                    </div>
                )}

                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                />
            </div>

            {error && (
                <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
        </div>
    );
};

export default ImageUpload;
