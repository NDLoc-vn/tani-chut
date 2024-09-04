import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function GET() {
  const soundsDir = path.join(process.cwd(), "sounds");
  const files = fs.readdirSync(soundsDir);
  const randomFile = files[Math.floor(Math.random() * files.length)];
  const filePath = path.join(soundsDir, randomFile);

  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-control": "no-store",
    },
  });
}
