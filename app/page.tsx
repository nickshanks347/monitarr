'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Film, Moon, Sun, Tv, RefreshCw, Clock } from 'lucide-react'
import { useTheme } from 'next-themes'
import { DownloadType } from '@/types/Download'

const fetchDownloads = async (endpoint: string): Promise<DownloadType[]> => {
  const response = await fetch(endpoint)
  if (!response.ok) {
    throw new Error('Failed to fetch data')
  }
  return response.json()
}

const triggerQueueRefresh = async (endpoint: string) => {
  const response = await fetch(endpoint, { method: 'POST' })
  if (!response.ok) {
    throw new Error('Failed to trigger queue refresh')
  }
}

const DownloadItem = ({ download }: { download: DownloadType }) => (
  <Card className="mb-4">
    <CardContent className="pt-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">{download.title}</h3>
        <span className="text-sm text-muted-foreground">{download.progress}%</span>
      </div>
      <Progress value={download.progress} className="mb-2" />
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>{download.size}</span>
        <span>{download.speed}</span>
        <span>{download.timeRemaining}</span>
      </div>
    </CardContent>
  </Card>
)

export default function DownloadDashboard() {
  const [sonarrDownloads, setSonarrDownloads] = useState<DownloadType[]>([])
  const [radarrDownloads, setRadarrDownloads] = useState<DownloadType[]>([])
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number | null>(null)
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const refreshDownloads = useCallback((type: 'sonarr' | 'radarr' | 'both') => {
    if (type === 'sonarr' || type === 'both') {
      triggerQueueRefresh('/api/sonarr/downloads/refresh').catch(console.error)
      fetchDownloads('/api/sonarr/downloads').then(setSonarrDownloads).catch(console.error)
    }
    if (type === 'radarr' || type === 'both') {
      triggerQueueRefresh('/api/radarr/downloads/refresh').catch(console.error)
      fetchDownloads('/api/radarr/downloads').then(setRadarrDownloads).catch(console.error)
    }
  }, [])

  useEffect(() => {
    refreshDownloads('both')
  }, [refreshDownloads])

  useEffect(() => {
    if (autoRefreshInterval) {
      setIsAutoRefreshing(true)
      const intervalId = setInterval(() => refreshDownloads('both'), autoRefreshInterval * 1000)
      return () => {
        clearInterval(intervalId)
        setIsAutoRefreshing(false)
      }
    }
  }, [autoRefreshInterval, refreshDownloads])

  const handleAutoRefreshChange = (value: string) => {
    const interval = parseInt(value, 10)
    setAutoRefreshInterval(interval || null)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="container mx-auto p-4 min-h-screen bg-background text-foreground">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">monitarr</h1>
        <div className="flex items-center space-x-4">
          <Select onValueChange={handleAutoRefreshChange} value={autoRefreshInterval?.toString() || ''}>
            <SelectTrigger className={`w-[180px] ${isAutoRefreshing ? 'border-primary' : ''}`}>
              <SelectValue placeholder="Auto-refresh" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="disabled">Disabled</SelectItem>
              <SelectItem value="5">Every 5 seconds</SelectItem>
              <SelectItem value="15">Every 15 seconds</SelectItem>
              <SelectItem value="30">Every 30 seconds</SelectItem>
              <SelectItem value="60">Every 1 minute</SelectItem>
              <SelectItem value="300">Every 5 minutes</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} 
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
          </Button>
        </div>
      </div>
      <Tabs defaultValue="sonarr">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sonarr" className="flex items-center justify-center">
            <Tv className="mr-2 h-4 w-4" />
            Sonarr (TV Shows)
          </TabsTrigger>
          <TabsTrigger value="radarr" className="flex items-center justify-center">
            <Film className="mr-2 h-4 w-4" />
            Radarr (Movies)
          </TabsTrigger>
        </TabsList>
        <TabsContent value="sonarr">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Download className="mr-2 h-5 w-5" />
                  Sonarr Downloads
                </div>
                <div className="flex items-center space-x-2">
                  {isAutoRefreshing && (
                    <Clock className="h-4 w-4 text-primary animate-pulse" />
                  )}
                  <Button variant="ghost" size="sm" onClick={() => refreshDownloads('sonarr')} disabled={isAutoRefreshing}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sonarrDownloads.length === 0 ? (
                <p className="text-center text-muted-foreground">No active downloads</p>
              ) : (
                sonarrDownloads.map(download => (
                  <DownloadItem key={download.id} download={download} />
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="radarr">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center">
                  <Download className="mr-2 h-5 w-5" />
                  Radarr Downloads
                </div>
                <div className="flex items-center space-x-2">
                  {isAutoRefreshing && (
                    <Clock className="h-4 w-4 text-primary animate-pulse" />
                  )}
                  <Button variant="ghost" size="sm" onClick={() => refreshDownloads('radarr')} disabled={isAutoRefreshing}>
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {radarrDownloads.length === 0 ? (
                <p className="text-center text-muted-foreground">No active downloads</p>
              ) : (
                radarrDownloads.map(download => (
                  <DownloadItem key={download.id} download={download} />
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}