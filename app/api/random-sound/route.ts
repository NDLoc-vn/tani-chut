import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const fileName = url.searchParams.get("file");

  if (!fileName) {
    return new NextResponse("File not found", { status: 404 });
  }

  const soundsDir = path.join(process.cwd(), "sounds");
  const filePath = path.join(soundsDir, fileName);

  const fileBuffer = fs.readFileSync(filePath);

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": "audio/mpeg",
    },
  });
}
