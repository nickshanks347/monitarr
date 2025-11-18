import { NextResponse } from 'next/server';
import { SonarrHealthItem } from '@/types/Sonarr';

const PAGE_SIZE = 1000;

export async function GET() {
  const radarrResponse = await fetch(`${process.env.RADARR_URL}/api/v3/health?apikey=${process.env.RADARR_API_KEY}&pageSize=${PAGE_SIZE}&includeSeries=true`);
  const radarrHealthData: SonarrHealthItem[] = await radarrResponse.json();

  console.log("Radarr Health Data:", radarrHealthData);

  if (!radarrHealthData.length) {
    return NextResponse.json([], { status: 200 });
  }

  return NextResponse.json(radarrHealthData, { status: 200 });
}