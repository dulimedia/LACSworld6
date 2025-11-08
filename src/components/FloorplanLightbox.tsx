import React from 'react';

export function FloorplanLightbox({ 
  src, 
  alt, 
  open, 
  onClose 
}: {
  src: string; 
  alt?: string; 
  open: boolean; 
  onClose: () => void;
}) {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-40 bg-black/80 flex items-center justify-center p-4">
      <button 
        aria-label="Close" 
        onClick={onClose}
        className="absolute top-4 right-4 rounded-full bg-white/90 px-4 py-2 text-sm font-medium shadow-lg hover:bg-white transition"
      >
        Close
      </button>
      <img 
        src={src} 
        alt={alt || 'Floorplan'} 
        className="max-w-[96vw] max-h-[90vh] object-contain rounded-lg shadow-2xl" 
      />
    </div>
  );
}
