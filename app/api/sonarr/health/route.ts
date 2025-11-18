import { NextResponse } from 'next/server';
import { SonarrHealthItem } from '@/types/Sonarr';

const PAGE_SIZE = 1000;

export async function GET() {
  const sonarrResponse = await fetch(`${process.env.SONARR_URL}/api/v3/health?apikey=${process.env.SONARR_API_KEY}&pageSize=${PAGE_SIZE}&includeSeries=true`);
  const sonarrHealthData: SonarrHealthItem[] = await sonarrResponse.json();

  if (!sonarrHealthData.length) {
    return NextResponse.json([], { status: 200 });
  }

  return NextResponse.json(sonarrHealthData, { status: 200 });
}