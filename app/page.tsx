"use client";
import VideoGallery from "@/components/VideoGallery/page";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function Home() {
  const [globalCounter, setGlobalCounter] = useState(0);
  const [targetCounter, setTargetCounter] = useState(0);
  const [localCounter, setLocalCounter] = useState(0);

  useEffect(() => {
    const fetchCounter = async () => {
      const response = await fetch("/api/counter");
      const data = await response.json();
      setGlobalCounter(data.count);
      setTargetCounter(data.count);
    };

    fetchCounter();
    const intervalId = setInterval(async () => {
      const response = await fetch("/api/counter");
      const data = await response.json();
      setTargetCounter(data.count);
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (globalCounter < targetCounter) {
      const incrementId = setInterval(() => {
        setGlobalCounter((prevCounter) => {
          if (prevCounter < targetCounter) {
            return prevCounter + 1;
          } else {
            clearInterval(incrementId);
            return prevCounter;
          }
        });
      }, 20);
      return () => clearInterval(incrementId);
    }
  }, [targetCounter]);

  const handleImageClick = async () => {
    setLocalCounter((prevCounter) => prevCounter + 1);
    setGlobalCounter((prevCounter) => prevCounter + 1);

    const file = `?file=moa-${Math.floor(Math.random() * 18) + 1}.mp3`;
    const url = `/api/random-sound${file}`;

    const cache = await caches.open("sound-cache");
    const cachedResponse = await cache.match(url);
    if (cachedResponse) {
      const audioBlob = await cachedResponse.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
    } else {
      const audioResponse = await fetch(url);
      const audioBlob = await audioResponse.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      cache.put(url, new Response(audioBlob));
      const audio = new Audio(audioUrl);
      audio.play();
    }

    await fetch("/api/counter", {
      method: "POST",
    });
  };

  return (
    <main className="flex flex-col items-center justify-between min-h-screen">
      <div className="flex flex-col items-center justify-center flex-1">
        <h1 className="text-6xl">
          <strong>{globalCounter.toLocaleString()}</strong>
        </h1>
        <p className="mb-10">Global Chụt Counter</p>
        <Image
          src="/tani-chut.gif"
          alt="Tani kiss gif"
          className="grayscale hover:grayscale-0 transition duration-300 cursor-pointer w-[128px] h-[128px] rounded-lg"
          width={128}
          height={128}
          priority
          style={{ cursor: "url('/kiss-icon.png'), auto" }}
          onClick={handleImageClick}
        />
        <p className="mt-3">
          <strong>Chụt Counter: </strong>
          {localCounter}
        </p>
      </div>

      <div className="flex flex-col items-center w-full mb-2">
        <VideoGallery />
        <p>
          Subscribe to{" "}
          <a
            href="https://www.youtube.com/@tani_kami"
            className="relative pb-0 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[1px] after:bg-current"
          >
            Tani Kami【LuAmi】
          </a>
        </p>
        <p className="text-xs mt-1 text-gray-900">
          Created by{" "}
          <a href="https://x.com/YChan4383/status/1831346823556223151">
            Y_Chan
          </a>
        </p>
        <p className="text-xs text-gray-500">
          Idea from{" "}
          <a href="https://faunaraara.com/" className="underline">
            faunaraara.com
          </a>
        </p>
      </div>
    </main>
  );
}
