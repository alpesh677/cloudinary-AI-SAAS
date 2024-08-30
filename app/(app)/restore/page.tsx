"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion"
import { FileUpload } from "@/components/ui/file-upload";
import { CldImage } from "next-cloudinary";
import axios from "axios";
import { Cloudinary } from "@cloudinary/url-gen";
import { AdvancedImage } from "@cloudinary/react";
import { generativeRestore } from "@cloudinary/url-gen/actions/effect";
import { Compare } from "@/components/ui/compare";

const cld = new Cloudinary({
    cloud: {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    }
});


export default function GenerativeFill() {
    const [isUploading, setIsuploading] = useState(false)
    const [uploadedImage, setUploadedImage] = useState<string | null>(null)
    const imgRef = useRef<AdvancedImage>(null);
    const [isTransforming, setIsTransforming] = useState(false)
    const [error, setError] = useState<string | null>(null);
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [updatedImage, setUpdatedImage] = useState<string | null>(null);
    const [compareComponent, setCompareComponent] = useState(false);
    const [view, setView] = useState('image');

    useEffect(() => {
        if (uploadedImage) {
            const updatedImgUrl = cld.image(uploadedImage).effect(generativeRestore()).toURL();
            setUpdatedImage(updatedImgUrl);
            // console.log(updatedImgUrl);
        }
    }, [uploadedImage]);

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
            console.log(response)

            if (response.status === 201) {
                const publicId = response.data.public_id;
                console.log("Uploaded image public ID:", publicId);
                setOriginalImage(response.data.secure_url);
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


    const restoredImage = uploadedImage ?
        cld.image(uploadedImage).effect(generativeRestore()) : null;

    const handleShowImage = () => setView('image');
    const handleCompare = () => setView('compare');

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className='container px-4 max-w-4xl mx-auto'>
            <h1 className='text-3xl font-bold text-center mb-1 p-4'>
                Restore your blurry images
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

                {uploadedImage &&
                    <div className="mt-2">
                        <div className='card-actions justify-center mt-4 mb-4'>
                            <button
                                onClick={handleShowImage}
                                className={`btn ${view === 'image' ? 'btn-primary' : 'btn-outline'}`}
                            >
                                Show Image
                            </button>
                            <button
                                onClick={handleCompare}
                                className={`btn ${view === 'compare' ? 'btn-primary' : 'btn-outline'}`}
                            >
                                Compare Image
                            </button>
                            <button className='btn btn-secondary'>
                                Download Image
                            </button>
                        </div>

                        {view === 'compare' ? (
                            <div className="p-4 border rounded-3xl  border-neutral-200 flex px-4 justify-center items-center">
                                <Compare
                                    firstImage={originalImage ?? ""}
                                    secondImage={updatedImage ?? ""}
                                    slideMode="drag"
                                />
                            </div>
                        ) : (
                            <div className="flex justify-center flex-col">
                                <h3 className="text-2xl font-semibold mb-2">Image Preview</h3>
                                {isTransforming && (
                                    <div className='flex items-center justify-center min-h-[200px]'>
                                        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
                                    </div>
                                )}
                                {restoredImage && (
                                    <AdvancedImage
                                        cldImg={restoredImage}
                                        onLoad={() => setIsTransforming(false)}
                                        onError={handleImageError}
                                        ref={imgRef}
                                        className={`${isTransforming ? 'hidden' : 'opacity-100'} transition-opacity duration-300 max-w-full h-auto`}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                }
            </motion.div>
        </motion.div >
    );
}
