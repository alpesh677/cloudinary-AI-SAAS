"use client"
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react'
import { motion } from "framer-motion"

export default function VideoUpload() {

    const [file, setFile] = useState<File | null>(null)
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("")
    const [isUploading, setIsUploading] = useState(false)

    const router = useRouter();

    const MAX_FILE_SIZE = 1024 * 1024 * 60;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            //TODO: use notification instead of alert
            alert("File is too large");
        }

        setIsUploading(true);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("title", title);
        formData.append("description", description);
        formData.append("originalSize", file.size.toString());


        try {
            const response = await axios.post("/api/video-upload", formData)
            if (response.status === 200) {
                router.push("/")
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
            className='container mx-auto p-2'>
            <h1 className="text-2xl font-semibold mb-4">Upload Video</h1>
            <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                    <label>
                        <span className="label-text">Title</span>
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="input input-bordered w-full"
                        required
                    />
                </div>
                <div>
                    <label>
                        <span className="label-text">Description</span>
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="textarea textarea-bordered w-full"
                        required
                    />
                </div>
                <div>
                    <label>
                        <span className="label-text">Description</span>
                    </label>
                    <input
                        type='file'
                        accept='video/*'
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="file-input file-input-bordered w-full"
                        required
                    />
                </div>
                <button
                    className='btn btn-primary w-full'
                    type='submit'
                    disabled={isUploading}
                >
                    {isUploading ? "Uploading..." : "Upload"}
                </button>
            </form>
        </motion.div>
    )
}
