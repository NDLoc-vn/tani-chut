import { NextResponse } from "next/server";

export async function GET() {
  const YOUTUBE_API_KEY = process.env.NEXT_YOUTUBE_API_KEY;
  const CHANNEL_ID = process.env.NEXT_YOUTUBE_CHANNEL_ID;
  const PLAYLIST_ID = `UU${CHANNEL_ID?.slice(2)}`;
  const API_URL = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${PLAYLIST_ID}&maxResults=5&key=${YOUTUBE_API_KEY}`;

  try {
    const response = await fetch(API_URL, { next: { revalidate: 300 } });
    if (!response.ok) {
      throw new Error("Failed to fetch playlist items");
    }

    const data = await response.json();

    // Lấy thông tin chi tiết từng video từ API /videos
    const videos = await Promise.all(
      data.items.map(async (item: any) => {
        const videoId = item.snippet.resourceId.videoId;

        // Lấy thông tin live streaming details
        const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=liveStreamingDetails,contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`;
        const detailsResponse = await fetch(detailsUrl);
        const detailsData = await detailsResponse.json();

        const liveDetails = detailsData.items?.[0]?.liveStreamingDetails || {};
        const contentDetails = detailsData.items?.[0]?.contentDetails || {};

        // Phân loại video (shorts, upcoming, live)
        const duration = contentDetails.duration || "";
        const isShorts = /PT[0-9]{1,2}S/.test(duration); // Shorts có duration <= 60 giây

        return {
          id: videoId,
          title: item.snippet.title,
          thumbnail: item.snippet.thumbnails.high.url,
          scheduledStartTime: liveDetails.scheduledStartTime || null,
          actualStartTime: liveDetails.actualStartTime || null,
          actualEndTime: liveDetails.actualEndTime || null,
          isLiveNow:
            !!liveDetails.actualStartTime && !liveDetails.actualEndTime, // Đang live nếu có actualStartTime và chưa có actualEndTime
          isShorts, // true nếu là shorts
        };
      })
    );

    console.log(videos);

    // Lọc video đang live và sắp phát (loại bỏ những video đã kết thúc)
    const upcomingAndLiveVideos = videos.filter(
      (video) =>
        // Giữ lại video live đang phát hoặc video sắp phát
        (video.isLiveNow && !video.actualEndTime) ||
        (video.scheduledStartTime && !video.actualStartTime)
    );

    // Lọc video shorts và lấy chỉ video mới nhất
    const latestShort = videos
      .filter((video) => video.isShorts)
      .sort(
        (a, b) =>
          new Date(b.scheduledStartTime || 0).getTime() -
          new Date(a.scheduledStartTime || 0).getTime()
      )[0];

    // Kết hợp tất cả video live, upcoming và 1 video shorts mới nhất
    const finalVideos = [
      ...upcomingAndLiveVideos,
      latestShort ? latestShort : null,
    ].filter(Boolean); // Loại bỏ giá trị null và undefined

    return NextResponse.json(finalVideos);
  } catch (error: any) {
    console.error("Error fetching playlist videos:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch playlist videos" },
      { status: 500 }
    );
  }
}
