"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion"
import { FileUpload } from "@/components/ui/file-upload";
import { CldImage } from "next-cloudinary";
import axios from "axios";
import { Cloudinary } from "@cloudinary/url-gen";
import { pad } from "@cloudinary/url-gen/actions/resize";
import { ar1X1 } from "@cloudinary/url-gen/qualifiers/aspectRatio";
import { ar16X9 } from "@cloudinary/url-gen/qualifiers/aspectRatio";
import { compass } from "@cloudinary/url-gen/qualifiers/gravity";
import { generativeFill } from "@cloudinary/url-gen/qualifiers/background";
import { AdvancedImage } from "@cloudinary/react";

const cld = new Cloudinary({
    cloud: {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    }
});

type Direction = string;
const directionLabels: Record<Direction, string> = {
    nw: 'north_west',
    n: 'north',
    ne: 'north_east',
    w: 'west',
    center: 'center',
    e: 'east',
    sw: 'south_west',
    s: 'south',
    se: 'south_east',
};


const imageFormats = {
    "Square": ar1X1(),
    "Portrait": "9:16",
    "Landscape": ar16X9(),
    "Custom": null
};

type imageFormats = keyof typeof imageFormats

export default function GenerativeFill() {
    const [isUploading, setIsuploading] = useState(false)
    const [uploadedImage, setUploadedImage] = useState<string | null>(null)
    const imgRef = useRef<AdvancedImage>(null);
    const [isTransforming, setIsTransforming] = useState(false)
    const [error, setError] = useState<string | null>(null);
    const [width, setWidth] = useState(null);
    const [height, setHeight] = useState(null);
    const [selectedFormat, setSelectedFormat] = useState<imageFormats>("Square")
    const [selectedDirection, setSelectedDirection] = useState<Direction>('center');
    const [customHeight, setCustomHeight] = useState<number | null>(null);
    const [customWidth, setCustomWidth] = useState<number | null>(null);

    useEffect(() => {
        if (uploadedImage && (selectedDirection || selectedFormat || customHeight || customWidth)) {
            setIsTransforming(true);
        }
    }, [uploadedImage, selectedDirection, selectedFormat, customHeight, customWidth]);

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
                setHeight(response.data.height);
                setWidth(response.data.width);
                console.log("Uploaded image public ID:", publicId);
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

    const handleSelectDirection = (direction: Direction) => {
        setSelectedDirection(direction)
    }


    const img = cld.image(uploadedImage ?? "").resize(
        selectedFormat === "Custom" && customWidth && customHeight
            ? pad()
                .width(customWidth)
                .height(customHeight)
                .gravity(compass(directionLabels[selectedDirection]))
                .background(generativeFill())
            : selectedFormat !== "Custom" && imageFormats[selectedFormat]
                ? pad()
                    .aspectRatio(imageFormats[selectedFormat]!)
                    .gravity(compass(directionLabels[selectedDirection]))
                    .background(generativeFill())
                : pad()
                    .gravity(compass(selectedDirection))
                    .background(generativeFill())
    );

    console.log("Generated Cloudinary URL:", img.toURL());


    const renderDot = (direction: Direction) => {
        const isSelected = selectedDirection === direction
        return (
            <button
                className={[
                    "w-2 h-2 rounded-full",
                    isSelected ? "bg-blue-500" : "bg-gray-300",
                    "hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                ].join(" ")}
                onClick={() => handleSelectDirection(direction)}
                aria-label={`Select ${directionLabels[direction]}`}
                aria-pressed={isSelected}
            />
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className='container px-4 max-w-4xl mx-auto'>
            <h1 className='text-3xl font-bold text-center mb-1 p-4'>
                Generate Background
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
                        <div className="mt-2">
                            <h2 className="card-title mb-4">Select Aspect Ratio</h2>

                            <div className="form-control flex flex-row sm:flex-col gap-6 items-start">
                                <div className="flex flex-col w-full sm:w-full">
                                    <label htmlFor="formatSelect" className="label">
                                        <span className="label-text">Select aspect ratio</span>
                                    </label>
                                    <select
                                        id="formatSelect"
                                        className='select select-bordered w-full'
                                        value={selectedFormat}
                                        onChange={(e) => setSelectedFormat(e.target.value as imageFormats)}
                                    >
                                        {
                                            Object.keys(imageFormats).map((key) => (
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
                                {selectedFormat === "Custom" && (
                                    <div className="flex flex-col gap-4 mt-4">
                                        <div>
                                            <label className="label">
                                                <span className="label-text">Custom Width</span>
                                            </label>
                                            <input
                                                type="number"
                                                className="input input-bordered"
                                                placeholder="Enter width"
                                                value={customWidth ?? ""}
                                                onChange={(e) => setCustomWidth(Number(e.target.value))}
                                            />
                                        </div>
                                        <div>
                                            <label className="label">
                                                <span className="label-text">Custom Height</span>
                                            </label>
                                            <input
                                                type="number"
                                                className="input input-bordered"
                                                placeholder="Enter height"
                                                value={customHeight ?? ""}
                                                onChange={(e) => setCustomHeight(Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col items-center space-y-4">
                                    <label className="label">
                                        <span className="label-text">Focus on which direction</span>
                                    </label>
                                    <div className="grid grid-cols-3 gap-2 p-2 bg-white border border-gray-200 rounded-md shadow-sm w-18 h-18">
                                        {renderDot('nw')}
                                        {renderDot('n')}
                                        {renderDot('ne')}
                                        {renderDot('w')}
                                        {renderDot('center')}
                                        {renderDot('e')}
                                        {renderDot('sw')}
                                        {renderDot('s')}
                                        {renderDot('se')}
                                    </div>
                                </div>
                            </div>
                            <div className="flex space-y-6 flex-col">
                                <div className='mt-6'>
                                    <h3 className="text-2xl font-semibold mb-2">Preview</h3>
                                    <div className="flex justify-center">
                                        {isTransforming && (
                                            <div className='flex items-center justify-center min-h-screen'>
                                                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
                                            </div>
                                        )}
                                        {img && (
                                            <AdvancedImage
                                                cldImg={img}
                                                onLoad={() => setIsTransforming(false)}
                                                onError={handleImageError}
                                                ref={imgRef}
                                                className={`${isTransforming ? 'hidden' : 'opacity-100'} transition-opacity duration-300`}
                                            />
                                        )}
                                    </div>
                                </div>

                                <div className='card-actions justify-end mt-4'>
                                    <motion.button
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ type: "spring", duration: 0.8, bounce: 0.25 }}
                                        whileOnHover={{ scale: 1.1 }}
                                        whileOnTap={{ scale: 0.9 }}
                                        className='btn btn-primary'

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
