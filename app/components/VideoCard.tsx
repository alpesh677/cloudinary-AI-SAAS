import React, { useState, useEffect, useCallback } from 'react'
import dayjs from 'dayjs'
import relativeTime from "dayjs/plugin/relativeTime"
import { getCldImageUrl, getCldVideoUrl } from 'next-cloudinary'
import { Video } from '@/types'
import { filesize } from 'filesize'
import { Clock, Download, FileDown, FileUp } from 'lucide-react'

dayjs.extend(relativeTime);

interface VideoCardProps {
    video: Video
    onDownload: (url: string, title: string) => void
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onDownload }) => {

    const [isHovered, setIsHovered] = useState(false)
    const [previewError, setPreviewError] = useState(false);

    const getThumnailUrl = useCallback((public_id: string) => {
        return getCldImageUrl({
            src: public_id,
            width: 300,
            height: 200,
            assetType: "video",
            format: "jpg",
            crop: 'fill',
            gravity: "auto"

        })
    }, []);

    const getVideoURl = useCallback((public_id: string) => {
        return getCldVideoUrl({
            src: public_id,
            height: 1080,
            width: 1920,
        })
    }, [])

    const getPreviewVideoUrl = useCallback((public_id: string) => {
        return getCldVideoUrl({
            src: public_id,
            height: 400,
            width: 225,
            rawTransformations: ["e_preview:duration_15:max_seg_9:min_seg_dur_1"]
        })
    }, []);

    const formatSize = (size: number) => {
        return filesize(size);
    }

    const formatDuration = useCallback((seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
    }, [])

    const compressionPercentage = Math.round(
        (1 - Number(video.compressedSize) / Number(video.originalSize)) * 100
    )

    useEffect(() => {
        setPreviewError(false)
    }, [isHovered])

    const handlePreviewError = () => {
        setPreviewError(true)
    }

    return (
        <div className='card bg-base-100 transition-all shadow-2xl hover:shadow-xl duration-200'
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <figure className='aspect-video relative'>
                {
                    isHovered ? (
                        previewError ? (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                                <p className="text-red-500">Preview not available</p>
                            </div>
                        ) : (
                            <video
                                src={getPreviewVideoUrl(video.publicId)}
                                autoPlay
                                muted
                                loop
                                className="w-full h-full object-cover"
                                onError={handlePreviewError}
                            />
                        )
                    ) : (
                        <img
                            src={getThumnailUrl(video.publicId)}
                            alt={video.title}
                            className='w-full h-full object-cover'
                        />
                    )
                }

                <div className="absolute bg-base-100 bottom-2 right-2 bg-opacity-70 px-2 py-1 rounded-lg text-sm flex items-center">
                    <Clock
                        size={16}
                        className='mr-1'
                    />
                </div>
            </figure>

            <div className='card-body p-4'>
                <h2 className='card-title text-lg font-bold'>{video.title}</h2>
                <p className='text-sm text-base-content opacity-70 mb-4'>
                    {video.description}
                </p>
                <p className='text-sm text-base-content opacity-70 mb-4'>
                    Uploaded {dayjs(video.createdAt).fromNow()}
                </p>

                <div className='grid grid-cols-2 gap-4 text-sm'>
                    <div className="flex items-center">
                        <FileUp size={18} className="mr-2 text-primary" />
                        <div>
                            <div className="font-semibold">Original</div>
                            <div>{formatSize(Number(video.originalSize))}</div>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <FileDown size={18} className="mr-2 text-secondary" />
                        <div>
                            <div className="font-semibold">Compressed</div>
                            <div>{formatSize(Number(video.compressedSize))}</div>
                        </div>
                    </div>
                </div>
                <div className="flex justify-between items-center mt-4">
                    <div className="text-sm font-semibold">
                        Compression:{" "}
                        <span className="text-accent">{compressionPercentage}%</span>
                    </div>
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={() =>
                            onDownload(getVideoURl(video.publicId), video.title)
                        }
                    >
                        <Download size={16} />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default VideoCard;