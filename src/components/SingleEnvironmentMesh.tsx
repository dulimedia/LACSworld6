import React, { useEffect } from 'react';
import * as THREE from 'three';
import { useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { configureGLTFLoader } from '../three/loaders';
import { RendererConfig } from '../config/RendererConfig';
import { makeFacesBehave } from '../utils/makeFacesBehave';
import { optimizeMeshForMobile } from '../utils/simplifyGeometry';
import { applyPolygonOffset } from '../materials/applyPolygonOffset';
import { assetUrl } from '../lib/assets';
import { optimizeMaterialTextures } from '../utils/textureUtils';

interface SingleEnvironmentMeshProps {
  tier: string;
}

function useDracoGLTF(path: string) {
  const { gl } = useThree();
  return useLoader(GLTFLoader, path, (loader) => configureGLTFLoader(loader, gl));
}

export function SingleEnvironmentMesh({ tier }: SingleEnvironmentMeshProps) {
  const { gl } = useThree();

  const isMobile = (tier === 'mobile-low');

  console.log('🌍 SingleEnvironmentMesh - Tier:', tier, 'isMobile:', isMobile);
  console.log('🔄 Loading Consolidated Environment: full environment .glb');

  // LOAD SINGLE CONSOLIDATED ASSET
  const fullEnv = useDracoGLTF(assetUrl('models/environment/one/full environment .glb'));

  const shadowsEnabled = gl && (gl as any).shadowMap?.enabled !== false;

  useEffect(() => {
    if (fullEnv.scene) {
      const scene = fullEnv.scene;
      console.log('✅ Processing Consolidated Environment Scene...');

      // 1. Geometry Fixes
      makeFacesBehave(scene, true);

      // ---------------------------------------------------------
      // PASS 1: ANALYSIS - Find "Latest" Version of Each Material
      // ---------------------------------------------------------
      const latestMaterials = new Map<string, THREE.Material>();

      const getBaseNameAndId = (name: string) => {
        // Matches "SomeMat.001", "Road.005", "Wall"
        const match = name.match(/^(.*)\.(\d+)$/);
        if (match) {
          return { base: match[1], ver: parseInt(match[2], 10) };
        }
        return { base: name, ver: 0 };
      };

      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

          materials.forEach((m: any) => {
            if (!m.name) return;
            const { base, ver } = getBaseNameAndId(m.name);
            const currentBest = latestMaterials.get(base);

            if (!currentBest) {
              latestMaterials.set(base, m);
            } else {
              const { ver: currentVer } = getBaseNameAndId(currentBest.name);
              if (ver > currentVer) {
                latestMaterials.set(base, m);
              }
            }
          });
        }
      });

      // ---------------------------------------------------------
      // PASS 2: ASSIGNMENT - Upgrade All Meshes to "Winner"
      // ---------------------------------------------------------
      let meshCount = 0;
      scene.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          meshCount++;

          // Mobile Geometry Simplification
          if (isMobile && mesh.geometry && mesh.geometry.attributes.position) {
            optimizeMeshForMobile(mesh);
          }

          // Shadow Logic
          if (shadowsEnabled) {
            const meshNameLower = (mesh.name || '').toLowerCase();
            // Basic Exclusions
            if (meshNameLower.includes('transparent') || meshNameLower.includes('glass')) {
              mesh.castShadow = false;
              mesh.receiveShadow = false;
            } else {
              mesh.castShadow = true;
              mesh.receiveShadow = true;
            }
          }

          // Material Replacement / Upgrade Helper
          const upgradeMaterial = (m: any) => {
            const { base } = getBaseNameAndId(m.name);
            const winner = latestMaterials.get(base) || m;

            // Check if this material (or its base type) is one of the "broken" ones we want to fix
            const lowerBase = base.toLowerCase();
            const shouldFix = lowerBase.includes('raw') ||
              lowerBase.includes('concrete') ||
              lowerBase.includes('sidewalk') ||
              lowerBase.includes('palm') ||
              lowerBase.includes('road') ||
              lowerBase.includes('wall') ||
              lowerBase.includes('stage');

            if (shouldFix) {
              // Create CLEAN Standard Material from Winner's Props
              // This removes junk like 'blending' but KEEPS the texture (map)
              const newMat = new THREE.MeshStandardMaterial({
                name: winner.name + '_OPTIMIZED',
                color: winner.color || 0xffffff,
                map: winner.map, // RESTORED TEXTURE from winner
                transparent: winner.transparent,
                opacity: winner.opacity,
                side: THREE.DoubleSide
              });

              // Apply basic optimizations to the texture immediately
              if (newMat.map) {
                newMat.map.minFilter = THREE.LinearMipMapLinearFilter;
                newMat.map.anisotropy = gl.capabilities.getMaxAnisotropy();
              }

              return newMat;
            }

            // Return original if not targeted for fix, but check polygon offset
            return m;
          };

          // Apply Upgrade
          if (mesh.material) {
            if (Array.isArray(mesh.material)) {
              mesh.material = mesh.material.map(upgradeMaterial);
            } else {
              mesh.material = upgradeMaterial(mesh.material);
            }
          }

          // Shadows on Material & Polygon Offsetting
          if (mesh.material) {
            const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
            mats.forEach((m: any) => {
              if (shadowsEnabled) m.shadowSide = THREE.FrontSide;

              // Polygon Offset for ground-like meshes to prevent z-fighting
              const meshNameLower = (mesh.name || '').toLowerCase();
              if (meshNameLower.includes('road') || meshNameLower.includes('plaza') ||
                meshNameLower.includes('roof') || meshNameLower.includes('floor') ||
                meshNameLower.includes('ground') || meshNameLower.includes('deck')) {
                applyPolygonOffset(m);
              }

              // Mobile reductions
              if (isMobile) {
                m.envMapIntensity = RendererConfig.materials.envMapIntensity;
                if (m.normalMap) m.normalMap = null;
              } else {
                m.envMapIntensity = RendererConfig.materials.envMapIntensity;
              }

              m.needsUpdate = true;
            });
          }

        }
      });

      console.log(`✨ Environment Configured. Deduplicated & Upgraded ${meshCount} meshes.`);

      // Cleanup for Mobile
      if (isMobile) {
        if ((window as any).gc) (window as any).gc();
      }
    }
  }, [fullEnv.scene, isMobile, shadowsEnabled]);

  return (
    <>
      {fullEnv.scene && <primitive object={fullEnv.scene} />}
    </>
  );
}
