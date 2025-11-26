import { PerfFlags } from '../perf/PerfFlags';

const isMobile = PerfFlags.tier === 'mobileLow';

export const ASSETS = {
  env: {
    // Use 1K HDRI for mobile, 2K for desktop
    main: isMobile
      ? '/textures/kloofendal_48d_partly_cloudy_puresky_1k.hdr'
      : '/textures/kloofendal_48d_partly_cloudy_puresky_2k.hdr',
  },

  models: {
    // Site model - same file for now, can be split later
    site: isMobile
      ? '/models/site.glb'
      : '/models/site.glb',
  },

  textures: {
    // Example PBR textures - mobile gets lower res
    concreteAlbedo: isMobile
      ? '/textures/concrete_albedo_1k.jpg'
      : '/textures/concrete_albedo_2k.jpg',
  },

  floorplans: {
    suite: (id: string) => `/floorplans/${id}.png`,
  },
};
