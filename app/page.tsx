"use client";
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
    const response = await fetch("/api/counter", {
      method: "POST",
    });
    const data = await response.json();
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen overflow-hidden">
      <h1 className="text-6xl">
        <strong>{globalCounter.toLocaleString()}</strong>
      </h1>
      <p className="mb-16">Global Chụt Counter</p>
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
      <p className="mt-3 mb-8">
        <strong>Chụt Counter: </strong>
        {localCounter}
      </p>
      <p className="">
        Subscribe to{" "}
        <a
          href="https://www.youtube.com/@tani_kami"
          className="relative pb-0 after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[1px] after:bg-current"
        >
          Tani Kami【LuAmi】
        </a>
      </p>
      <p className="text-xs mt-1 text-gray-900">
        Made by{" "}
        <a href="" className="">
          Y_Chan
        </a>
      </p>
    </main>
  );
}
