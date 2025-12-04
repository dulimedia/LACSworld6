import { useEffect, useRef } from 'react';
import { useGLBState } from '../store/glbState';
import * as THREE from 'three';
import { createGlowMaterial } from '../materials/glowMaterial';

export const UnitGlowHighlightFixed = () => {
  const { selectedUnit, selectedBuilding, selectedFloor, hoveredUnit, getGLBByUnit, glbNodes } = useGLBState();
  const glowGroupRef = useRef<THREE.Group>(null);
  const currentGlowMeshesRef = useRef<THREE.Mesh[]>([]);
  const glowMaterialRef = useRef<THREE.Material | null>(null);
  const isProcessingRef = useRef<boolean>(false);

  // Create the blue glow material once with proper depth settings
  useEffect(() => {
    if (!glowMaterialRef.current) {
      glowMaterialRef.current = createGlowMaterial(0x3b82f6); // Blue glow
      console.log('✨ Created selective glow material with depthTest:false');
    }
  }, []);

  // Helper function to safely create glow mesh from a single unit
  const createGlowMeshFromUnit = (unitGLB: any): THREE.Mesh[] => {
    const glowMeshes: THREE.Mesh[] = [];
    
    if (!unitGLB?.object || !glowMaterialRef.current) {
      console.warn('❌ Cannot create glow: missing unit object or material');
      return glowMeshes;
    }

    let meshCount = 0;
    unitGLB.object.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        try {
          // Safety check: skip if geometry is too large (likely environment mesh)
          const vertexCount = child.geometry.attributes.position?.count || 0;
          if (vertexCount > 10000) {
            console.warn(`⚠️ Skipping large mesh with ${vertexCount} vertices (likely environment)`);
            return;
          }

          // Clone the geometry and material to prevent sharing corruption
          const clonedGeometry = child.geometry.clone();
          const clonedMaterial = glowMaterialRef.current!.clone();
          const glowMesh = new THREE.Mesh(clonedGeometry, clonedMaterial);
          
          // Copy transform from original mesh
          glowMesh.position.copy(child.position);
          glowMesh.rotation.copy(child.rotation);
          glowMesh.scale.copy(child.scale);
          
          // Key settings for glow-through effect
          glowMesh.renderOrder = 999; // Render on top of everything
          glowMesh.visible = true; // Visible when created
          
          // Store metadata
          glowMesh.userData.unitKey = unitGLB.key;
          glowMesh.userData.originalMesh = child.uuid;
          glowMesh.userData.isGlowMesh = true;
          
          glowMeshes.push(glowMesh);
          meshCount++;
        } catch (error) {
          console.error('❌ Failed to clone geometry for glow:', error);
        }
      }
    });

    console.log(`✅ Created ${meshCount} glow meshes for unit ${unitGLB.key}`);
    return glowMeshes;
  };

  // Clear existing glow meshes with proper material disposal
  const clearGlowMeshes = () => {
    if (glowGroupRef.current && !isProcessingRef.current) {
      isProcessingRef.current = true; // Prevent re-entry during cleanup
      
      currentGlowMeshesRef.current.forEach(mesh => {
        glowGroupRef.current?.remove(mesh);
        // Dispose cloned geometry
        mesh.geometry?.dispose();
        // Dispose cloned material to prevent corruption
        if (mesh.material && Array.isArray(mesh.material)) {
          mesh.material.forEach(mat => mat.dispose());
        } else if (mesh.material) {
          mesh.material.dispose();
        }
      });
      
      currentGlowMeshesRef.current = [];
      isProcessingRef.current = false;
    }
  };

  // Update glow for selected unit ONLY
  useEffect(() => {
    if (!glowGroupRef.current || !glowMaterialRef.current || isProcessingRef.current) return;
    
    console.log('[SELECTIVE GLOW] selectedUnit =', selectedUnit, 'selectedBuilding =', selectedBuilding, 'selectedFloor =', selectedFloor);
    
    // RACE CONDITION PROTECTION: Prevent overlapping glow operations
    if (isProcessingRef.current) {
      console.log('[SELECTIVE GLOW] ⚡ Skipping glow update - processing in progress');
      return;
    }
    
    // Clear any existing glow meshes first
    clearGlowMeshes();

    // Create glow for selected unit only
    if (selectedUnit && selectedBuilding && selectedFloor !== null && selectedFloor !== undefined) {
      const unitGLB = getGLBByUnit(selectedBuilding, selectedFloor, selectedUnit);
      console.log('[SELECTIVE GLOW MATCH]', unitGLB ? 'Found GLB for' : 'No GLB found for', selectedUnit);
      
      if (unitGLB) {
        try {
          const glowMeshes = createGlowMeshFromUnit(unitGLB);
          
          glowMeshes.forEach(mesh => {
            glowGroupRef.current?.add(mesh);
          });
          
          currentGlowMeshesRef.current = glowMeshes;
          
          if (glowMeshes.length > 0) {
            console.log(`🔵 Applied selective blue glow to ${selectedUnit} (${glowMeshes.length} meshes)`);
          }
        } catch (error) {
          console.error(`❌ Error creating selective glow for ${selectedUnit}:`, error);
        }
      }
    }
    
    // Also handle hover when no selection (optional)
    else if (hoveredUnit && !selectedUnit) {
      const hoveredUnitGLB = glbNodes.get(hoveredUnit);
      if (hoveredUnitGLB) {
        try {
          const glowMeshes = createGlowMeshFromUnit(hoveredUnitGLB);
          
          glowMeshes.forEach(mesh => {
            glowGroupRef.current?.add(mesh);
          });
          
          currentGlowMeshesRef.current = glowMeshes;
          
          if (glowMeshes.length > 0) {
            console.log(`🔵 Applied selective blue glow to hovered ${hoveredUnit}`);
          }
        } catch (error) {
          console.error(`❌ Error creating selective glow for hovered ${hoveredUnit}:`, error);
        }
      }
    }
  }, [selectedUnit, selectedBuilding, selectedFloor, hoveredUnit, getGLBByUnit, glbNodes]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearGlowMeshes();
      if (glowMaterialRef.current) {
        glowMaterialRef.current.dispose();
      }
    };
  }, []);

  return (
    <group ref={glowGroupRef}>
      {/* Selective glow meshes are added dynamically only for selected unit */}
    </group>
  );
};