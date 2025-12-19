
export type MediaType = 'image' | 'video';

export interface MediaItem {
  id: string;
  url: string;
  type: MediaType;
  name: string;
  date: number;
  size: number;
  width: number;
  height: number;
  album: string;
  thumbnail?: string;
}

export interface Album {
  name: string;
  coverUrl: string;
  itemCount: number;
}

export enum NavigationTab {
  PHOTOS = 'photos',
  ALBUMS = 'albums',
  SEARCH = 'search'
}
