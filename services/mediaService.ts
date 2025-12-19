
import { MediaItem, Album } from '../types';

export class MediaService {
  /**
   * Simulates the MediaStore API by converting browser File objects into MediaItem objects.
   */
  static async processFiles(files: FileList): Promise<MediaItem[]> {
    const mediaItems: MediaItem[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith('video/');
      const isImage = file.type.startsWith('image/');
      
      if (!isImage && !isVideo) continue;

      const url = URL.createObjectURL(file);
      
      // Basic heuristic for album names (folder name if available)
      const pathParts = file.webkitRelativePath ? file.webkitRelativePath.split('/') : [];
      const albumName = pathParts.length > 1 ? pathParts[pathParts.length - 2] : 'Camera';

      // We need dimensions. For images we use Image, for videos we'd need a video element metadata load
      let width = 0;
      let height = 0;

      if (isImage) {
        const dimensions = await this.getImageDimensions(url);
        width = dimensions.width;
        height = dimensions.height;
      }

      mediaItems.push({
        id: Math.random().toString(36).substr(2, 9),
        url,
        type: isImage ? 'image' : 'video',
        name: file.name,
        date: file.lastModified,
        size: file.size,
        width,
        height,
        album: albumName,
      });
    }

    return mediaItems.sort((a, b) => b.date - a.date);
  }

  private static getImageDimensions(url: string): Promise<{width: number, height: number}> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => resolve({ width: 0, height: 0 });
      img.src = url;
    });
  }

  static groupIntoAlbums(items: MediaItem[]): Album[] {
    const albumMap = new Map<string, { count: number, cover: string }>();
    
    items.forEach(item => {
      const existing = albumMap.get(item.album) || { count: 0, cover: item.url };
      albumMap.set(item.album, {
        count: existing.count + 1,
        cover: existing.cover
      });
    });

    return Array.from(albumMap.entries()).map(([name, data]) => ({
      name,
      coverUrl: data.cover,
      itemCount: data.count
    }));
  }

  static formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  static formatDate(timestamp: number): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(timestamp));
  }
}
