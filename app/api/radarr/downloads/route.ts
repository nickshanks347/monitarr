import { NextResponse } from 'next/server';
import { DownloadType } from '@/types/Download';
import { RadarrQueue } from '@/types/RadarrQueue';

export async function GET() {
  const response = await fetch(`${process.env.RADARR_URL}/api/v3/queue?apikey=${process.env.RADARR_API_KEY}`);
  const radarrData: RadarrQueue = await response.json();

  if (!radarrData.records) {
    return NextResponse.json([], { status: 200 });
  }

  const responseObject: DownloadType[] = []

  const fetchPromises = radarrData.records.map(async(record) => {
    const movieId = record.movieId;
    const response = await fetch(`${process.env.RADARR_URL}/api/v3/movie/${movieId}?apikey=${process.env.RADARR_API_KEY}`);
    const movieData = await response.json();

    const id = record.id;
    const movieName = movieData.title;
    const progress = Math.round(100 - (record.sizeleft / record.size * 100));
    const size = `${(record.size / 1024 / 1024 / 1024).toFixed(1)} GB`;
    
    const downloadedSize = record.size - record.sizeleft;
    const addedTime = new Date(record.added).getTime(); // convert added time to milliseconds
    const currentTime = Date.now(); // current time in milliseconds
    const elapsedTime = (currentTime - addedTime) / 1000; // elapsed time in seconds
    const speed = (downloadedSize / elapsedTime) / (1024 * 1024); // speed in MB/s

    const timeRemaining = record.timeleft;

    responseObject.push({
      id: id,
      title: movieName,
      progress: progress,
      size: size,
      speed: `${speed.toFixed(2)} MB/s`,
      timeRemaining: timeRemaining
    });
  });
  await Promise.all(fetchPromises);

  responseObject.sort((a, b) => b.progress - a.progress);

  return NextResponse.json(responseObject, { status: 200 });
}