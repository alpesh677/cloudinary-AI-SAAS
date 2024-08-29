"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion"
import { FileUpload } from "@/components/ui/file-upload";
import { CldImage } from "next-cloudinary";
import axios from "axios";

export default function Component() {
    const [itemToRecolor, setItemToRecolor] = useState("");
    const [replacementColor, setReplacementColor] = useState("#FFFFFF");
    const [isUploading, setIsuploading] = useState(false)
    const [uploadedImage, setUploadedImage] = useState<string | null>(null)
    const imgRef = useRef<HTMLImageElement>(null);
    const [isTransforming, setIsTransforming] = useState(false)
    const [error, setError] = useState<string | null>(null);
    const [width, setWidth] = useState(null);
    const [height, setHeight] = useState(null);


    useEffect(() => {
        if (uploadedImage && (itemToRecolor || replacementColor)) {
            setIsTransforming(true);
        }
    }, [itemToRecolor, uploadedImage, replacementColor])

    const handleItemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setItemToRecolor(e.target.value);
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setReplacementColor(e.target.value);
    };

    const handleSubmit = async (files: File[]) => {

        if (files.length === 0) {
            return;
        }
        const file = files[0];

        setIsuploading(true)

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await axios.post("/api/image-upload", formData)
            // console.log(response)

            if (response.status === 201) {
                const publicId = response.data.public_id;
                setHeight(response.data.height);
                setWidth(response.data.width);
                // console.log("Uploaded image public ID:", publicId);
                setUploadedImage(publicId);
            }
        } catch (error) {
            console.error("Image upload error:", error);
            setError("Image upload failed. Please try again.");
        } finally {
            setIsuploading(false)
        }
    }

    const handleImageError = (err: any) => {
        console.error("CldImage error:", err);
        setError("Failed to load the image. Please check the image ID and try again.");
    };


    const handleDownload = () => {
        if (!imgRef.current) return

        fetch(imgRef.current.src)
            .then((response) => response.blob())
            .then((blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `recolored-${itemToRecolor}-}.png`;;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            })
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className='container px-4 max-w-4xl mx-auto'>
            <h1 className='text-3xl font-bold text-center mb-1 p-4'>
                Recolor & Preview
            </h1>

            <motion.div
                initial={{
                    opacity: 0,
                    y: 100,
                }}
                whileInView={{
                    y: 0,
                    opacity: 0.8
                }}
                transition={{
                    type: "ease-in",
                    duration: 0.3,
                }}
                className='card p-4'>
                <div className={`card-body ${uploadedImage ? 'hidden' : ''}`}>
                    <h2 className="card-title mb-4">Upload an Image</h2>
                    <div className="form-control">
                        <label htmlFor="" className="label">
                            <span className='label-text'>Choose an Image File</span>
                        </label>
                        <FileUpload onChange={handleSubmit} />
                    </div>
                </div>
                {
                    isUploading && (
                        <div className="mt-4">
                            <progress className="progress progress-primary w-full"></progress>
                        </div>
                    )
                }
                {error && (
                    <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
                        {error}
                    </div>
                )}

                {
                    uploadedImage && (
                        <div className="mt-6">
                            <h2 className="card-title mb-4">Select Social Media Format</h2>
                            <div className="flex space-y-6 flex-col">
                                <div className="flex flex-col space-y-2">
                                    <label htmlFor="item-to-recolor">Item to recolor : </label>
                                    <input
                                        id="item-to-recolor"
                                        type="text"
                                        placeholder="Enter item name"
                                        value={itemToRecolor}
                                        onChange={handleItemChange}
                                        className="input input-bordered w-full"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="replacement-color">Replacement color</label>
                                    <div className="flex space-x-2">
                                        <input
                                            id="replacement-color"
                                            type="text"
                                            value={replacementColor}
                                            onChange={handleColorChange}
                                            className="input input-bordered w-full"
                                        />
                                        <input
                                            type="color"
                                            value={replacementColor}
                                            onChange={handleColorChange}
                                            className="p-0 w-15 h-19"
                                        />
                                    </div>
                                </div>


                                <div className='mt-6'>
                                    <h3 className="text-2xl font-semibold mb-2">Preview</h3>
                                    <div className="flex justify-center">
                                        {isTransforming && (
                                            <div className='flex items-center justify-center min-h-screen'>
                                                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
                                            </div>
                                        )}
                                        <CldImage
                                            ref={imgRef}
                                            height={height ?? 500}
                                            width={width ?? 500}
                                            src={uploadedImage}
                                            alt="Uploaded Image"
                                            sizes='100vw'
                                            crop='fill'
                                            gravity='auto'
                                            recolor={itemToRecolor && replacementColor ? [itemToRecolor, replacementColor.replace('#', '')] : undefined}
                                            onError={handleImageError}
                                            onLoad={() => setIsTransforming(false)}
                                            className={`${isTransforming ? 'hidden' : 'opacity-100'} transition-opacity duration-300`}
                                        />
                                    </div>
                                </div>

                                <div className='card-actions justify-end mt-4'>
                                    <motion.button
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ type: "spring", duration: 0.8, bounce: 0.25 }}
                                        className='btn btn-primary'
                                        onClick={handleDownload}
                                    >
                                        Download Image
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    )
                }
            </motion.div>
        </motion.div >
    );
}
