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
}

export interface SonarrQueue {
  page: number;
  pageSize: number;
  sortKey: string;
  sortDirection: string;
  totalRecords: number;
  records: SonarrRecord[];
}