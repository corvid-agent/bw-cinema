import { Injectable } from '@angular/core';

export interface StreamingSource {
  type: 'internet-archive' | 'youtube';
  embedUrl: string;
  externalUrl: string;
  label: string;
}

@Injectable({ providedIn: 'root' })
export class StreamingService {
  getSource(internetArchiveId: string | null, youtubeId: string | null): StreamingSource | null {
    if (internetArchiveId) {
      return {
        type: 'internet-archive',
        embedUrl: `https://archive.org/embed/${internetArchiveId}`,
        externalUrl: `https://archive.org/details/${internetArchiveId}`,
        label: 'Internet Archive',
      };
    }
    if (youtubeId) {
      return {
        type: 'youtube',
        embedUrl: `https://www.youtube-nocookie.com/embed/${youtubeId}`,
        externalUrl: `https://www.youtube.com/watch?v=${youtubeId}`,
        label: 'YouTube',
      };
    }
    return null;
  }
}
