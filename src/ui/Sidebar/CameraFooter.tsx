import React from 'react';
import { useGLBState } from '../../store/glbState';
import { Home, ZoomIn, ZoomOut, RotateCw, RotateCcw } from 'lucide-react';

export function CameraFooter() {
  const { cameraControlsRef } = useGLBState();

  const handleReset = () => {
    if (cameraControlsRef?.current) {
      cameraControlsRef.current.reset(true);
    }
  };

  const handleZoomIn = () => {
    if (cameraControlsRef?.current) {
      cameraControlsRef.current.dolly(0.85, true);
    }
  };

  const handleZoomOut = () => {
    if (cameraControlsRef?.current) {
      cameraControlsRef.current.dolly(-0.35, true);
    }
  };

  const handleRotateLeft = () => {
    if (cameraControlsRef?.current) {
      cameraControlsRef.current.rotate(-Math.PI / 8, 0, true);
    }
  };

  const handleRotateRight = () => {
    if (cameraControlsRef?.current) {
      cameraControlsRef.current.rotate(Math.PI / 8, 0, true);
    }
  };

  return (
    <div className="absolute bottom-0 left-0 right-0 border-t border-black/5 bg-white/90 backdrop-blur px-3 py-2">
      <label className="block text-xs font-semibold uppercase tracking-wide text-black/40 mb-2">
        Camera
      </label>
      <div className="grid grid-cols-5 gap-2">
        <button
          className="rounded-lg border border-black/10 bg-white px-2 py-1.5 text-xs shadow-sm hover:shadow transition flex items-center justify-center"
          onClick={handleRotateLeft}
          title="Rotate Left"
        >
          <RotateCcw size={14} />
        </button>
        <button
          className="rounded-lg border border-black/10 bg-white px-2 py-1.5 text-xs shadow-sm hover:shadow transition flex items-center justify-center"
          onClick={handleRotateRight}
          title="Rotate Right"
        >
          <RotateCw size={14} />
        </button>
        <button
          className="rounded-lg border border-black/10 bg-white px-2 py-1.5 text-xs shadow-sm hover:shadow transition flex items-center justify-center"
          onClick={handleZoomIn}
          title="Zoom In"
        >
          <ZoomIn size={14} />
        </button>
        <button
          className="rounded-lg border border-black/10 bg-white px-2 py-1.5 text-xs shadow-sm hover:shadow transition flex items-center justify-center"
          onClick={handleZoomOut}
          title="Zoom Out"
        >
          <ZoomOut size={14} />
        </button>
        <button
          className="rounded-lg border border-black/10 bg-white px-2 py-1.5 text-xs shadow-sm hover:shadow transition flex items-center justify-center"
          onClick={handleReset}
          title="Reset View"
        >
          <Home size={14} />
        </button>
      </div>
    </div>
  );
}
