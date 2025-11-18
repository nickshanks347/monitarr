interface Language {
  id: number;
  name: string;
}

interface Quality {
  id: number;
  name: string;
  source: string;
  resolution: number;
}

interface Revision {
  version: number;
  real: number;
  isRepack: boolean;
}

interface QualityDetail {
  quality: Quality;
  revision: Revision;
}

interface CustomFormat {
  id: number;
  name: string;
}

interface SonarrRecord {
  seriesId: number;
  episodeId: number;
  seasonNumber: number;
  languages: Language[];
  quality: QualityDetail;
  customFormats: CustomFormat[];
  customFormatScore: number;
  size: number;
  title: string;
  sizeleft: number;
  timeleft: string;
  estimatedCompletionTime: string;
  added: string;
  status: string;
  trackedDownloadStatus: string;
  trackedDownloadState: string;
  statusMessages: string;
  downloadId: string;
  protocol: string;
  downloadClient: string;
  downloadClientHasPostImportCategory: boolean;
  indexer: string;
  episodeHasFile: boolean;
  id: number;
  episodeNumber: number;
  airDate: string;
  series: {
    id: number;
    title: string;
  }
}

export interface SonarrQueue {
  page: number;
  pageSize: number;
  sortKey: string;
  sortDirection: string;
  totalRecords: number;
  records: SonarrRecord[];
}

export type SonarrWantedType = {
  id: number
  seriesId: number
  airDate: string;
  seriesTitle: string;
  title: string
}

interface WikiUrl {
  fullUri: string | null;
  scheme: string | null;
  host: string | null;
  port: number | null;
  path: string | null;
  query: string | null;
  fragment: string | null;
}

export type MessageType = "ok" | "notice" | "warning" | "error";

export interface SonarrHealthItem {
  id: number;
  source: string | null;
  type: MessageType;
  message: string | null;
  wikiUrl: WikiUrl;
}