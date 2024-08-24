"use client"

import React, { useState, useEffect, useRef } from 'react'
import { CldImage } from 'next-cloudinary';

const socialFormats = {
    "Instagram Square (1:1)": { width: 1080, height: 1080, aspectRatio: "1:1" },
    "Instagram Portrait (4:5)": { width: 1080, height: 1350, aspectRatio: "4:5" },
    "Twitter Post (16:9)": { width: 1200, height: 675, aspectRatio: "16:9" },
    "Twitter Header (3:1)": { width: 1500, height: 500, aspectRatio: "3:1" },
    "Facebook Cover (205:78)": { width: 820, height: 312, aspectRatio: "205:78" },
};

type socialFormats = keyof typeof socialFormats

export default function SocialShare() {
    const [uploadedImage, setUploadedImage] = useState<string | null>(null)
    const [selectedFormat, setSelectedFormat] = useState<socialFormats>("Instagram Square (1:1)")
    const [isUploading, setIsuploading] = useState(false)
    const [isTransforming, setIsTransforming] = useState(false)
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
        if (uploadedImage && !isTransforming)
            setIsTransforming(true)
    }, [selectedFormat, uploadedImage])

    const handleSubmit = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }
        setIsuploading(true)

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/image-upload", {
                method: "POST",
                body: formData
            })

            if (response.ok) {
                const data = await response.json();
                setUploadedImage(data.public_id);
            }
        } catch (error) {
            console.error(error);
            alert("Image upload failed")
        } finally {
            setIsuploading(false)
        }
    }

    const handleDownload = () => {
        if (!imgRef.current) return;

        fetch(imgRef.current.src)
            .then((response) => response.blob())
            .then((blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${selectedFormat
                    .replace(/\s+/g, "_")
                    .toLowerCase()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            })
    }

    return (
        <div className='container px-4 max-w-4xl mx-auto'>
            <h1 className='text-3xl font-bold text-center mb-6 p-4'>
                Social Media Image Creator
            </h1>

            <div className='card p-4'>
                <div className='card-body'>
                    <h2 className="card-title mb-4">Upload an Image</h2>
                    <div className="form-control">
                        <label htmlFor="" className="label">
                            <span className='label-text'>Choose an Image File</span>
                        </label>
                        <input
                            type="file"
                            name="file"
                            onChange={handleSubmit}
                            className="file-input file-input-bordered file-input-primary w-full"
                        />
                    </div>
                </div>
                {
                    isUploading && (
                        <div className="mt-4">
                            <progress className="progress progress-primary w-full"></progress>
                        </div>
                    )
                }

                {
                    uploadedImage && (
                        <div className="mt-6">
                            <h2 className="card-title mb-4">Select Social Media Format</h2>
                            <div className="form-control">
                                <select
                                    className='select select-bordered w-full'
                                    value={selectedFormat}
                                    onChange={(e) => setSelectedFormat(e.target.value as socialFormats)}
                                >
                                    {
                                        Object.keys(socialFormats).map((key) => (
                                            <option
                                                key={key}
                                                value={key}
                                            >
                                                {key}
                                            </option>
                                        ))
                                    }
                                </select>
                            </div>


                            <div className='mt-6'>
                                <h3 className="text-2xl font-semibold mb-2">Preview</h3>
                                <div className="flex justify-center">
                                    {
                                        isTransforming && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-base-100 bg-opacity-50 z-10">
                                                <span className="loading loading-spinner loading-lg"></span>
                                            </div>
                                        )}

                                    <CldImage
                                        height={socialFormats[selectedFormat].height}
                                        width={socialFormats[selectedFormat].width}
                                        src={uploadedImage}
                                        alt="Uploaded Image"
                                        ref={imgRef}
                                        sizes='100vw'
                                        crop='fill'
                                        gravity='auto'
                                        onLoad={() => setIsTransforming(false)}
                                    />
                                </div>
                            </div>

                            <div className='card-actions justify-end mt-4'>
                                <button
                                    className='btn btn-primary'
                                    onClick={handleDownload}>
                                    Download for {selectedFormat}
                                </button>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    )
}
