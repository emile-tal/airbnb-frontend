'use client';

import { useCallback, useState } from 'react';

import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';

interface ImageUploadProps {
    onChange: (value: string) => void;
    value: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onChange, value }) => {
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!e.target.files || !e.target.files[0]) return;

            const file = e.target.files[0];
            setIsUploading(true);

            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload image');
            }

            const data = await response.json();
            onChange(data.url);
        } catch (error) {
            console.error('Error uploading image:', error);
        } finally {
            setIsUploading(false);
        }
    }, [onChange]);

    return (
        <div className="space-y-4">
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 p-6 rounded-md relative">
                {value ? (
                    <div className="relative w-full h-64">
                        <Image
                            src={value}
                            alt="Uploaded image"
                            fill
                            style={{ objectFit: 'cover' }}
                            className="rounded-md"
                        />
                        <button
                            onClick={() => onChange('')}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                            type="button"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                ) : (
                    <div className="text-center">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                        </svg>
                        <div className="mt-4 flex text-sm text-gray-600">
                            <label
                                htmlFor="file-upload"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-[#FF385C] hover:text-[#E61E4D] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#FF385C]"
                            >
                                <span>{isUploading ? 'Uploading...' : 'Upload an image'}</span>
                                <input
                                    id="file-upload"
                                    name="file-upload"
                                    type="file"
                                    className="sr-only"
                                    accept="image/*"
                                    onChange={handleUpload}
                                    disabled={isUploading}
                                />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImageUpload; 