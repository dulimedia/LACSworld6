import { useEffect, useState, useRef } from 'react';
import { useGLBState } from '../store/glbState';

export const useFlashPrevention = () => {
  const { selectedUnit, selectedBuilding, selectedFloor } = useGLBState();
  const [preventFlash, setPreventFlash] = useState(false);
  const lastSelectionRef = useRef<string>('');
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Create a selection signature
    const currentSelection = `${selectedBuilding || ''}-${selectedFloor || ''}-${selectedUnit || ''}`;
    
    if (!currentSelection) {
      // No selection, just clear any pending freeze frame
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setPreventFlash(false);
      lastSelectionRef.current = currentSelection;
      return;
    }

    if (currentSelection !== lastSelectionRef.current) {
      console.log('🚨 SELECTION CHANGE DETECTED - Activating flash prevention');
      console.log('Previous:', lastSelectionRef.current);
      console.log('Current:', currentSelection);

      setPreventFlash(true);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        setPreventFlash(false);
        timeoutRef.current = null;
        console.log('✅ Flash prevention window ended');
      }, 500);
    }

    lastSelectionRef.current = currentSelection;

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [selectedUnit, selectedBuilding, selectedFloor]);

  return {
    preventFlash,
    activateFlashPrevention: () => setPreventFlash(true)
  };
};