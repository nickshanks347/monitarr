// RadarrQueue.ts

interface Language {
  id: number;
  name: string;
}

interface Quality {
  id: number;
  name: string;
  source: string;
  resolution: number;
  modifier: string;
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

interface RadarrRecord {
  movieId: number;
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
  id: number;
}

export interface RadarrQueue {
  page: number;
  pageSize: number;
  sortKey: string;
  sortDirection: string;
  totalRecords: number;
  records: RadarrRecord[];
}