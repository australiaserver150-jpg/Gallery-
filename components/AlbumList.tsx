
import React from 'react';
import { Album } from '../types';

interface AlbumListProps {
  albums: Album[];
  onAlbumClick: (albumName: string) => void;
}

const AlbumList: React.FC<AlbumListProps> = ({ albums, onAlbumClick }) => {
  if (albums.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full opacity-60 p-12 text-center">
        <h3 className="text-xl font-medium">No albums created</h3>
        <p className="mt-2 text-sm">Organize your media into folders to see them here.</p>
      </div>
    );
  }

  return (
    <div className="p-4 grid grid-cols-2 gap-4 pb-24">
      {albums.map((album) => (
        <div 
          key={album.name} 
          onClick={() => onAlbumClick(album.name)}
          className="flex flex-col cursor-pointer group"
        >
          <div className="aspect-square rounded-2xl overflow-hidden bg-gray-200 dark:bg-stone-800 mb-2 relative">
            <img 
              src={album.coverUrl} 
              alt={album.name} 
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
          <h3 className="font-bold text-sm truncate">{album.name}</h3>
          <p className="text-xs text-gray-500">{album.itemCount} items</p>
        </div>
      ))}
    </div>
  );
};

export default AlbumList;
