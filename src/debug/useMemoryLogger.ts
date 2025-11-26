import { useFrame, useThree } from '@react-three/fiber';
import { PerfFlags } from '../perf/PerfFlags';

let frameCounter = 0;

export function useMemoryLogger() {
  const { gl } = useThree();

  useFrame(() => {
    if (!PerfFlags.isMobile) return;
    frameCounter++;

    // Log roughly once per second at 60fps
    if (frameCounter % 60 === 0) {
      const info = gl.info;

      console.log('[MEM]', {
        geometries: info.memory.geometries,
        textures: info.memory.textures,
        programs: info.programs?.length,
      });
    }
  });
}
