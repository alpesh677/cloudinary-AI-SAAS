'use client'
import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import VideoCard from '@/app/components/VideoCard'
import { Video } from '@/types'


export default function Home() {

  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    try {
      const response = await axios.get("/api/video")
      // console.log(response.data)
      if (Array.isArray(response.data)) {
        setVideos(response.data)
      } else {
        throw new Error("Unexpected response format")
      }
    } catch (error) {
      console.log(error)
      setError("failed to fetch videos");
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos])

  const handleDownload = useCallback((url: string, title: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute("download", `${title}.mp4`);
    link.setAttribute("target", "_blank");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [])

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-1">
      <h1 className="text-2xl font-bold mb-4">Videos</h1>
      {videos.length === 0 ? (
        <div className="text-center text-lg text-gray-500">
          No videos available
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {
            videos.map((video) => (
              <VideoCard
                key={video.id}
                video={video}
                onDownload={handleDownload}
              />
            ))
          }
        </div>
      )}
    </div>
  );
}
