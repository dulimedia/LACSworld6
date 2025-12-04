import { useEffect, useState, useRef } from 'react';
import { useGLBState } from '../store/glbState';

export const TransitionMask = () => {
  const { selectedUnit, selectedBuilding, selectedFloor } = useGLBState();
  const [showMask, setShowMask] = useState(false);
  const lastSelectionRef = useRef<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Create a selection signature
    const currentSelection = `${selectedBuilding || ''}-${selectedFloor || ''}-${selectedUnit || ''}`;
    
    // If selection changed (and it's not just initial load)
    if (currentSelection !== lastSelectionRef.current && lastSelectionRef.current !== '') {
      console.log('🎭 Transition mask: Covering potential flash');
      
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      // Show dark overlay immediately
      setShowMask(true);
      
      // Hide it after a very short duration (just enough to cover the flash)
      timeoutRef.current = setTimeout(() => {
        setShowMask(false);
        console.log('✅ Transition mask: Flash window covered');
      }, 80); // 80ms should cover any flash
    }
    
    lastSelectionRef.current = currentSelection;
  }, [selectedUnit, selectedBuilding, selectedFloor]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Don't render if mask isn't active
  if (!showMask) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.2)', // Very subtle dark overlay
        zIndex: 9997, // Below loading overlay but above everything else
        pointerEvents: 'none',
        transition: 'opacity 0.05s ease-out',
      }}
    >
      {/* Optional debug indicator */}
      <div
        style={{
          position: 'absolute',
          top: 10,
          left: 10,
          background: 'rgba(0,0,0,0.7)',
          color: 'white',
          padding: '2px 6px',
          borderRadius: '3px',
          fontSize: '10px',
          fontFamily: 'monospace',
          opacity: 0.5,
        }}
      >
        🎭 MASK
      </div>
    </div>
  );
};