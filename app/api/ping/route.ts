import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'pong' }, { status: 200 });
}