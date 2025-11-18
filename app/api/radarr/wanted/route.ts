import { NextResponse } from 'next/server';
import { RadarrWantedType } from '@/types/Radarr';
import { RadarrQueue } from '@/types/Radarr';

export async function GET() {
  const response = await fetch(`${process.env.RADARR_URL}/api/v3/wanted/missing?apikey=${process.env.RADARR_API_KEY}`);
  const radarrData: RadarrQueue = await response.json();

  if (!radarrData.records) {
    return NextResponse.json([], { status: 200 });
  }

  const responseObject: RadarrWantedType[] = radarrData.records.map((record) => {
    return {
      id: record.id,
      title: record.title,
      airDate: record.digitalRelease,
      releaseDate: record.releaseDate
    };
  });

  return NextResponse.json(responseObject, { status: 200 });
}