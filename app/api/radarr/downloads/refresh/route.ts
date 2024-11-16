import { NextResponse } from 'next/server';

export async function POST() {
    const triggerCommand = await fetch(`${process.env.RADARR_URL}/api/v3/command?apikey=${process.env.RADARR_API_KEY}`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify({
        name: 'RefreshMonitoredDownloads'
        })
    })
    const triggerCommandData = await triggerCommand.json()
    const commandId = triggerCommandData.id

    const getCommandStatus = await fetch(`${process.env.RADARR_URL}/api/v3/command/${commandId}?apikey=${process.env.RADARR_API_KEY}`)
    const getCommandStatusData = await getCommandStatus.json()

  return NextResponse.json(getCommandStatusData, { status: 200 });
}
