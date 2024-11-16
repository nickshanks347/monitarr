import { NextResponse } from 'next/server';
import { DownloadType } from '@/types/Download';
import { SonarrQueue } from '@/types/SonarrQueue';

export async function GET() {
  const response = await fetch(`${process.env.SONARR_URL}/api/v3/queue?apikey=${process.env.SONARR_API_KEY}`);
  const sonarrData: SonarrQueue = await response.json();

  if (!sonarrData.records) {
    return NextResponse.json([], { status: 200 });
  }

  const responseObject: DownloadType[] = []

  const fetchPromises = sonarrData.records.map(async(record) => {
    const episodeId = record.episodeId;
    const response = await fetch(`${process.env.SONARR_URL}/api/v3/episode/${episodeId}?apikey=${process.env.SONARR_API_KEY}`);
    const episodeData = await response.json();

    const id = record.id;
    const seasonNumber = episodeData.seasonNumber;
    const episodeNumber = episodeData.episodeNumber;
    const seriesName = episodeData.series.title;
    const fqTitle = `${seriesName} - S${seasonNumber}E${episodeNumber}`;
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
      title: fqTitle,
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