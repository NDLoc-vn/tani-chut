import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.NEXT_YOUTUBE_API_KEY;
  const channelId = process.env.NEXT_YOUTUBE_CHANNEL_ID;

  if (!apiKey || !channelId) {
    return NextResponse.json(
      { error: "API key or Channel ID is missing" },
      { status: 400 }
    );
  }

  try {
    const upcomingVideosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=upcoming&type=video&key=${apiKey}`
    );

    const upcomingVideosData = await upcomingVideosResponse.json();

    if (!upcomingVideosData.items || upcomingVideosData.items.length === 0) {
      return NextResponse.json(
        { error: "No live or upcoming videos found" },
        { status: 404 }
      );
    }

    // const allVideos = [...upcomingVideosData.items];

    const videoIds = upcomingVideosData.items
      .map((video: any) => video.id.videoId)
      .join(",");
    const detailedVideosResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails&id=${videoIds}&key=${apiKey}`
    );
    const detailedVideosData = await detailedVideosResponse.json();

    if (!detailedVideosData.items || detailedVideosData.items.length === 0) {
      return NextResponse.json(
        { error: "No detailed video information found" },
        { status: 404 }
      );
    }

    const sortedVideos = detailedVideosData.items.sort((a: any, b: any) => {
      const aLiveDetails = a.liveStreamingDetails;
      const bLiveDetails = b.liveStreamingDetails;

      if (aLiveDetails?.actualStartTime && !aLiveDetails?.actualEndTime) {
        return -1;
      } else if (
        bLiveDetails?.actualStartTime &&
        !bLiveDetails?.actualEndTime
      ) {
        return 1;
      }

      const aScheduledStartTime = aLiveDetails?.scheduledStartTime
        ? new Date(aLiveDetails.scheduledStartTime).getTime()
        : Infinity;
      const bScheduledStartTime = bLiveDetails?.scheduledStartTime
        ? new Date(bLiveDetails.scheduledStartTime).getTime()
        : Infinity;

      return aScheduledStartTime - bScheduledStartTime;
    });

    return NextResponse.json(sortedVideos);
  } catch (err) {
    console.error("Error fetching YouTube data:", err);
    return NextResponse.json(
      { error: "Failed to fetch YouTube data" },
      { status: 500 }
    );
  }
}
