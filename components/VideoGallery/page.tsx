"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Video = {
  id: string;
  title: string;
  thumbnail: string;
  scheduledStartTime?: string;
  isLiveNow: boolean;
  isShorts: boolean;
};

export default function VideoGallery() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 1;

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/youtube");
        if (!response.ok) {
          throw new Error("Failed to fetch videos");
        }
        const data = await response.json();

        // Sử dụng trực tiếp trường thumbnail từ dữ liệu trả về
        const formattedVideos = data.map((video: any) => {
          return {
            id: video.id,
            title: video.title,
            thumbnail: video.thumbnail, // Trực tiếp lấy thumbnail từ dữ liệu
            scheduledStartTime: video.scheduledStartTime,
            isLiveNow: video.isLiveNow,
            isShorts: video.isShorts,
          };
        });

        setVideos(formattedVideos);
      } catch (err: any) {
        setError(err.message || "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPage((prevPage) =>
        (prevPage + 1) * itemsPerPage < videos.length ? prevPage + 1 : 0
      );
    }, 5000);
    return () => clearInterval(interval);
  }, [videos]);

  if (loading)
    return (
      <div className="flex items-center justify-center">
        <span className="animate-spin inline-block mx-2">🐹</span> Loading...
      </div>
    );
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto pl-2 pr-2">
      <div className="w-full flex justify-start mb-2">
        <p className="text-sm font-semibold">Next Stream / Newest Shorts:</p>
      </div>
      <div className="relative overflow-hidden w-full">
        <div
          className="flex transition-transform duration-1000 ease-in-out"
          style={{
            transform: `translateX(-${currentPage * (100 / videos.length)}%)`,
            width: `${videos.length * 100}%`,
          }}
        >
          {videos.map((video) => (
            <div key={video.id} className="w-full flex flex-col items-center">
              {/* Wrap image and title with Link */}
              <Link
                href={`https://www.youtube.com/watch?v=${video.id}`}
                className="flex flex-col items-center text-center"
              >
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="h-32 w-auto rounded-lg cursor-pointer mx-auto"
                />
                <h2 className="mt-2 text-sm font-semibold pl-4 pr-4">
                  {video.title}
                </h2>
              </Link>
              {video.isLiveNow ? (
                <p className="text-red-500 font-bold">Live Now</p>
              ) : video.isShorts ? (
                <p className="text-blue-500 font-bold">Shorts</p>
              ) : (
                <p className="text-gray-500 text-xs">
                  Scheduled:{" "}
                  {video.scheduledStartTime
                    ? new Date(video.scheduledStartTime).toLocaleString()
                    : "N/A"}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between w-full mt-1">
        <button
          onClick={() =>
            setCurrentPage((prevPage) => Math.max(prevPage - 1, 0))
          }
          disabled={currentPage === 0}
          className="group p-2 bg-yellow-200 hover:bg-yellow-300 rounded-full disabled:bg-gray-200"
        >
          <span className="group-hover:-rotate-90 inline-block transition-transform duration-300">
            🐹
          </span>{" "}
          Prev
        </button>
        <button
          onClick={() =>
            setCurrentPage((prevPage) =>
              (prevPage + 1) * itemsPerPage < videos.length ? prevPage + 1 : 0
            )
          }
          disabled={(currentPage + 1) * itemsPerPage >= videos.length}
          className="group p-2 bg-yellow-200 hover:bg-yellow-300 rounded-full disabled:bg-gray-200"
        >
          Next{" "}
          <span className="group-hover:rotate-90 inline-block transition-transform duration-300">
            🐹
          </span>
        </button>
      </div>
    </div>
  );
}
