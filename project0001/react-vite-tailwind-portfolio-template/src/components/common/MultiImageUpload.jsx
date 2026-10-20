import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Film, Plus } from 'lucide-react';
import { useUploadMediaMutation } from '../../features/Api/adminApi';

const MultiImageUpload = ({ onUploadComplete, initialMedia = [], label = "Media Gallery", className = "" }) => {
    const [uploadMedia, { isLoading }] = useUploadMediaMutation();
    const [mediaList, setMediaList] = useState(initialMedia); // Array of { id, url, type }
    const [error, setError] = useState(null);
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        setError(null);

        for (const file of files) {
            if (file.size > 10 * 1024 * 1024) {
                setError(`File ${file.name} is too large (max 10MB)`);
                continue;
            }

            try {
                const formData = new FormData();
                formData.append('file', file);

                const result = await uploadMedia(formData).unwrap();

                if (result && result.media) {
                    const newMedia = {
                        id: result.media.id,
                        url: result.media.url,
                        type: result.media.type
                    };

                    setMediaList(prev => {
                        const updated = [...prev, newMedia];
                        // We will call onUploadComplete OUTSIDE of this functional update
                        return updated;
                    });

                    // Since setMediaList uses the functional update above, we can't reliably get the "new" list here 
                    // without closure issues or using a ref.
                    // But wait, I can just use the latest state if I'm careful or use a temporary array.
                }
            } catch (err) {
                console.error("Upload failed:", err);
                setError(`Failed to upload ${file.name}`);
            }
        }

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Use useEffect to sync back to parent
    React.useEffect(() => {
        onUploadComplete(mediaList.map(m => m.id));
    }, [mediaList]);

    const handleRemove = (id) => {
        setMediaList(prev => prev.filter(m => m.id !== id));
    };

    return (
        <div className={`space-y-3 ${className}`}>
            <label className="text-xs font-bold text-gray-500 uppercase block">{label}</label>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {/* Previews */}
                {mediaList.map((media) => (
                    <div key={media.id} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 group border border-gray-200 dark:border-gray-700">
                        {media.type === 'video' ? (
                            <div className="w-full h-full flex items-center justify-center">
                                <Film className="w-8 h-8 text-gray-400" />
                            </div>
                        ) : (
                            <img
                                src={media.url}
                                alt="Gallery"
                                className="w-full h-full object-cover"
                            />
                        )}
                        <button
                            type="button"
                            onClick={() => handleRemove(media.id)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}

                {/* Upload Button */}
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-green-500 hover:bg-green-50/10 transition-all"
                >
                    {isLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                    ) : (
                        <>
                            <Plus className="w-6 h-6 text-gray-400" />
                            <span className="text-[10px] font-bold text-gray-500 uppercase">Add More</span>
                        </>
                    )}
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                accept="image/*,video/*"
                onChange={handleFileSelect}
            />

            {error && (
                <p className="text-xs text-red-500 mt-1">{error}</p>
            )}
        </div>
    );
};

export default MultiImageUpload;
