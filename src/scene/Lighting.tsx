import { useEffect, useRef } from "react";
import { useThree } from "@react-three/fiber";
import { DirectionalLight, OrthographicCamera, PCFSoftShadowMap } from "three";
import { detectTier } from "../lib/graphics/tier";
import { useFitDirectionalLightShadow } from "./ShadowFit";
import { logger } from "../utils/logger";

export interface LightingProps {
  shadowBias?: number;
  shadowNormalBias?: number;
  onLightCreated?: (light: DirectionalLight) => void;
}

export function Lighting({ 
  shadowBias = -0.0003, 
  shadowNormalBias = 0.05,
  onLightCreated 
}: LightingProps = {}) {
  const { scene, gl } = useThree();
  const sunRef = useRef<DirectionalLight | null>(null);
  const isMobileRef = useRef<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    detectTier().then((tier) => {
      isMobileRef.current = tier.startsWith('mobile');
      if (cancelled) return;

      const old = scene.children.filter(o => o.userData.__sunLight);
      old.forEach(o => scene.remove(o));

      const isMobile = tier.startsWith('mobile');
      const sun = new DirectionalLight(0xffffff, isMobile ? 3.5 : 6.5);
      sun.position.set(-40, 30, 20);
      sun.castShadow = !isMobile;
      
      const mapSize = tier.startsWith('mobile') ? 1024 : 4096;
      sun.shadow.mapSize.set(mapSize, mapSize);
      sun.shadow.bias = shadowBias;
      sun.shadow.normalBias = shadowNormalBias;
      sun.shadow.radius = 0;
      
      const cam = sun.shadow.camera as OrthographicCamera;
      cam.left = -80;
      cam.right = 80;
      cam.top = 80;
      cam.bottom = -80;
      cam.near = 0.5;
      cam.far = 220;
      cam.updateProjectionMatrix();

      sun.userData.__sunLight = true;
      scene.add(sun);
      sunRef.current = sun;
      
      if (isMobile) {
        const ambient = new (await import('three')).AmbientLight(0xffffff, 1.8);
        ambient.userData.__ambientLight = true;
        scene.add(ambient);
        logger.log('LOADING', '💡', 'Mobile: Added ambient light for fill');
      }

      gl.shadowMap.type = PCFSoftShadowMap;

      onLightCreated?.(sun);

      logger.log('LOADING', '🌅', `Sun shadow initialized: ${mapSize}×${mapSize}, bias=${shadowBias}, normalBias=${shadowNormalBias}, dynamic frustum enabled`);
    });

    return () => { 
      cancelled = true;
      const lights = scene.children.filter(o => o.userData.__sunLight || o.userData.__ambientLight);
      lights.forEach(l => scene.remove(l)); 
      sunRef.current = null;
    };
  }, [scene, gl, shadowBias, shadowNormalBias, onLightCreated]);

  useFitDirectionalLightShadow(
    isMobileRef.current ? null : sunRef.current,
    {
      maxExtent: 100,
      margin: 3,
      mapSize: 4096,
      snap: true
    }
  );

  return null;
}
