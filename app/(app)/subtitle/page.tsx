'use client'
import axios from 'axios';
import React, { useState } from 'react'
import { motion } from "framer-motion"
import { FileUpload } from '@/components/ui/file-upload';
import { source } from "@cloudinary/url-gen/actions/overlay";
import { subtitles } from "@cloudinary/url-gen/qualifiers/source";
import { AdvancedVideo } from '@cloudinary/react';
import { Cloudinary } from "@cloudinary/url-gen";


const cld = new Cloudinary({
    cloud: {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    }
});

export default function Page() {
    const [isUploading, setIsUploading] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);

    const MAX_FILE_SIZE = 1024 * 1024 * 60;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            return;
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const respopnse = await axios.post("/api/subtitle", formData);
            if (respopnse.status === 201) {
                const fullPath = respopnse.data.public_id;
                const publicId = fullPath.split("/").pop();
                console.log(publicId);
                setUploadedVideo(publicId);
            }
        } catch (error) {
            console.log(error)
        } finally {
            setIsUploading(false);
        }
    }

    return (
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
            className='container mx-auto p-2'
        >
            <h1 className="text-2xl font-semibold mb-4">Upload Video</h1>
            {
                !uploadedVideo ? (
                    <form onSubmit={handleSubmit} className='space-y-4'>
                        <div>
                            <label>
                                <span className="label-text">Upload Video :</span>
                            </label>
                            <FileUpload onChange={(files) => setFile(files[0] || null)} />
                        </div>
                        <button
                            className='btn btn-primary w-full'
                            type='submit'
                            disabled={isUploading}
                        >
                            {isUploading ? "Uploading..." : "Upload"}
                        </button>
                    </form>
                ) : (
                    <AdvancedVideo
                        cldVid={cld.video(uploadedVideo ?? '').overlay(source(subtitles(`${uploadedVideo}.srt`)))}
                        plugins={[]}
                    />
                )
            }
        </motion.div>
    )
}
