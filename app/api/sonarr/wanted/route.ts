import { NextResponse } from 'next/server';
import { SonarrQueue } from '@/types/Sonarr';

const PAGE_SIZE = 1000;

export async function GET() {
  const sonarrResponse = await fetch(`${process.env.SONARR_URL}/api/v3/wanted/missing?apikey=${process.env.SONARR_API_KEY}&pageSize=${PAGE_SIZE}&includeSeries=true`);
  const sonarrData: SonarrQueue = await sonarrResponse.json();

  if (!sonarrData.records) {
    return NextResponse.json([], { status: 200 });
  }

  const response = sonarrData.records.map(record => ({
    id: record.id,
    title: `${record.series.title} - S${record.seasonNumber}E${record.episodeNumber}`,
    seriesTitle: record.series.title,
    releaseDate: record.airDate,
    seriesId: record.seriesId
  }))

  return NextResponse.json(response, { status: 200 });
}