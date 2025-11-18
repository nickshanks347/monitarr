'use client'

import { useState, useEffect, useCallback, Fragment } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Film, Moon, Sun, Tv, RefreshCw, Clock, ArrowUp, ArrowDown, TriangleAlert, Info, Check } from 'lucide-react'
import { useTheme } from 'next-themes'
import { DownloadType } from '@/types/Download'
import { MessageType, SonarrHealthItem, SonarrWantedType } from '@/types/Sonarr'
import { RadarrWantedType } from '@/types/Radarr'

const fetchData = async <T,>(endpoint: string): Promise<T[]> => {
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

const WantedItem = ({ wanted }: { wanted: RadarrWantedType | SonarrWantedType}) => (
  <Card className="mb-4 w-full">
    <CardContent className="pt-6 flex items-center justify-between">
      <h3 className="text-lg font-semibold">{wanted.title}</h3>
      <span>{(wanted.airDate || (wanted as RadarrWantedType).releaseDate)?.slice(0, 10)}</span>
    </CardContent>
  </Card>
)

export const DashboardView = () => {
  const [sonarrDownloads, setSonarrDownloads] = useState<DownloadType[]>([])
  const [sonarrWanted, setSonarrWanted] = useState<SonarrWantedType[]>([])
  const [radarrWanted, setRadarrWanted] = useState<RadarrWantedType[]>([])
  const [radarrDownloads, setRadarrDownloads] = useState<DownloadType[]>([])
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number | null>(null)
  const [isAutoRefreshing, setIsAutoRefreshing] = useState(false)
  const [sortCriteria, setSortCriteria] = useState('title')
  const [isSortAscending, setIsSortAscending] = useState(true)
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [expandedSeriesIds, setExpandedSeriesIds] = useState<number[]>([])
  const [sonarrHealthData, setSonarrHealthData] = useState<SonarrHealthItem[]>([]);
  const [isSonarrHealthExpanded, setIsSonarrHealthExpanded] = useState(false);
  const [radarrHealthData, setRadarrHealthData] = useState<SonarrHealthItem[]>([]);
  const [isRadarrHealthExpanded, setIsRadarrHealthExpanded] = useState(false);

  const groupWantedBySeriesToArr = (wantedList: SonarrWantedType[]) => {
    const seriesMap: { [key: number]: { seriesTitle: string; items: SonarrWantedType[] } } = {}

    wantedList.forEach((item) => {
      if (!seriesMap[item.seriesId]) {
        seriesMap[item.seriesId] = { seriesTitle: item.seriesTitle, items: [] }
      }
      seriesMap[item.seriesId].items.push(item)
    })

    return Object.entries(seriesMap).map(([seriesId, data]) => ({
      seriesId: parseInt(seriesId, 10),
      seriesTitle: data.seriesTitle,
      items: data.items
    }))
  }

  type WantedGroup = ReturnType<typeof groupWantedBySeriesToArr>[number]

  const sortGroups = (groups: WantedGroup[]) => {
    return groups.sort((a, b) => b.items.length - a.items.length)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  const refreshDownloads = useCallback((type: 'sonarr' | 'radarr' | 'both') => {
    if (type === 'sonarr' || type === 'both') {
      triggerQueueRefresh('/api/sonarr/downloads/refresh').catch(console.error)
      fetchData<DownloadType>('/api/sonarr/downloads').then(setSonarrDownloads).catch(console.error)
      fetchData<SonarrWantedType>('/api/sonarr/wanted').then(setSonarrWanted).catch(console.error)
      fetchData<SonarrHealthItem>('/api/sonarr/health').then(setSonarrHealthData).catch(console.error)
    }
    if (type === 'radarr' || type === 'both') {
      triggerQueueRefresh('/api/radarr/downloads/refresh').catch(console.error)
      fetchData<DownloadType>('/api/radarr/downloads').then(setRadarrDownloads).catch(console.error)
      fetchData<RadarrWantedType>('/api/radarr/wanted').then(setRadarrWanted).catch(console.error)
      fetchData<SonarrHealthItem>('/api/radarr/health').then(setRadarrHealthData).catch(console.error)
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

  const handleSortChange = (value: string) => {
    setSortCriteria(value)
  }

  const toggleSortOrder = () => {
    setIsSortAscending(!isSortAscending)
  }

  const sortDownloads = (downloads: DownloadType[]) => {
    return [...downloads].sort((a, b) => {
      let comparison = 0
      if (sortCriteria === 'title') {
        comparison = a.title.localeCompare(b.title)
      } else if (sortCriteria === 'size') {
        comparison = parseFloat(a.size) - parseFloat(b.size)
      } else if (sortCriteria === 'timeRemaining') {
        comparison = parseFloat(a.timeRemaining) - parseFloat(b.timeRemaining)
      } else if (sortCriteria === 'progress') {
        comparison = a.progress - b.progress
      }
      return isSortAscending ? comparison : -comparison
    })
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
          <Select onValueChange={handleSortChange} value={sortCriteria}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="size">Size</SelectItem>
              <SelectItem value="timeRemaining">Time Remaining</SelectItem>
              <SelectItem value="progress">Progress</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={toggleSortOrder} aria-label="Toggle sort order">
            {isSortAscending ? <ArrowUp className="h-[1.2rem] w-[1.2rem]" /> : <ArrowDown className="h-[1.2rem] w-[1.2rem]" />}
          </Button>
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
          <div className='flex flex-col gap-4'>
            {!!sonarrHealthData.length && (
              <Card>
                <CardHeader>
                  <CardTitle
                    className="flex items-center justify-between hover:underline"
                    onClick={() => setIsSonarrHealthExpanded(prev => !prev)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="flex items-center">
                      {isSonarrHealthExpanded ? <>▼ </> : <>▶ </>}
                      Sonarr Health ({sonarrHealthData.length})
                    </div>
                  </CardTitle>
                </CardHeader>
                {isSonarrHealthExpanded && (
                  <CardContent>
                    {sonarrHealthData.map((item) => (
                      <div key={item.id} className="mb-2 flex items-center gap-2">
                        {getIcon(item.type)}
                        <p className="text-sm text-muted-foreground">{item.message}</p>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            )}
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Download className="mr-2 h-5 w-5" />
                    Sonarr Wanted
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
                {sonarrWanted.length === 0 ? (
                  <p className="text-center text-muted-foreground">No active wanted items</p>
                ) : (
                  sortGroups(groupWantedBySeriesToArr(sonarrWanted)).map(group => {
                    const isExpanded = expandedSeriesIds.includes(group.seriesId)
                    const isSingleItem = group.items.length === 1

                    if (isSingleItem) {
                      return <WantedItem key={group.items[0].id} wanted={group.items[0]} />
                    }

                    if (!isExpanded) {
                      return (<div key={group.seriesId}>
                        <Button variant="link" onClick={() => setExpandedSeriesIds([...expandedSeriesIds, group.seriesId])}>
                          ▶ {group.seriesTitle} ({group.items.length} items)
                        </Button>
                      </div>)
                    }

                    return (
                      <div key={group.seriesId} className='flex flex-col gap-2 w-full items-start'>
                        <Button variant="link" onClick={() => setExpandedSeriesIds(expandedSeriesIds.filter(id => id !== group.seriesId))}>
                          ▼ {group.seriesTitle} ({group.items.length} items)
                        </Button>
                        {group.items.map(wanted => (
                          <WantedItem key={wanted.id} wanted={wanted} />
                        ))}
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="radarr">
          <div className='flex flex-col gap-4'>
            {!!radarrHealthData.length && (
              <Card>
                <CardHeader>
                  <CardTitle
                    className="flex items-center justify-between hover:underline"
                    onClick={() => setIsRadarrHealthExpanded(prev => !prev)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="flex items-center">
                      {isRadarrHealthExpanded ? <>▼ </> : <>▶ </>}
                      Radarr Health ({radarrHealthData.length})
                    </div>
                  </CardTitle>
                </CardHeader>
                {isRadarrHealthExpanded && (
                  <CardContent>
                    {radarrHealthData.map((item, index) => (
                      <Fragment key={item.id}>
                        {!!index && <div className='w-full h-[1px] bg-gray-50/10 mb-2'/>}
                        <div key={item.id} className="mb-2 flex items-center gap-2">
                          {getIcon(item.type)}
                          <p className="text-sm text-muted-foreground">{item.message}</p>
                        </div>
                      </Fragment>
                    ))}
                  </CardContent>
                )}
              </Card>
            )}
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
                  sortDownloads(radarrDownloads).map(download => (
                    <DownloadItem key={download.id} download={download} />
                  ))
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Download className="mr-2 h-5 w-5" />
                    Radarr Wanted
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
                {radarrWanted.length === 0 ? (
                  <p className="text-center text-muted-foreground">No active wanted items</p>
                ) : (
                  radarrWanted.map(wanted => (
                    <WantedItem key={wanted.id} wanted={wanted} />
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

const getIcon = (type: MessageType) => {
  switch (type) {
    case 'error':
      return <TriangleAlert className="min-h-5 min-w-5 text-red-600" />
    case 'warning':
      return <TriangleAlert className="min-h-5 min-w-5 text-yellow-600" />
    case 'notice':
      return <Info className="min-h-5 min-w-5 text-blue-600" />
    case 'ok':
    default:
      return <Check className="min-h-5 min-w-5 text-green-600" />
  }
}