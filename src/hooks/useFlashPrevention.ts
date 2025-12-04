import { useEffect, useState, useRef } from 'react';
import { useGLBState } from '../store/glbState';

export const useFlashPrevention = () => {
  const { selectedUnit, selectedBuilding, selectedFloor } = useGLBState();
  const [preventFlash, setPreventFlash] = useState(false);
  const lastSelectionRef = useRef<string>('');

  useEffect(() => {
    // Create a selection signature
    const currentSelection = `${selectedBuilding || ''}-${selectedFloor || ''}-${selectedUnit || ''}`;
    
    // If selection changed (and it's not just initial load)
    if (currentSelection !== lastSelectionRef.current && lastSelectionRef.current !== '') {
      console.log('🚨 SELECTION CHANGE DETECTED - Activating flash prevention');
      console.log('Previous:', lastSelectionRef.current);
      console.log('Current:', currentSelection);
      
      // Activate freeze-frame immediately
      setPreventFlash(true);
      
      // Deactivate after flash window
      setTimeout(() => {
        setPreventFlash(false);
        console.log('✅ Flash prevention window ended');
      }, 500); // 500ms should cover any flash duration
    }
    
    lastSelectionRef.current = currentSelection;
  }, [selectedUnit, selectedBuilding, selectedFloor]);

  return {
    preventFlash,
    activateFlashPrevention: () => setPreventFlash(true)
  };
};