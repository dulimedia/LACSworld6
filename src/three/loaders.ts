
/**
 * Configures an existing GLTFLoader instance with KTX2, Draco, and Meshopt support.
 */
export function configureGLTFLoader(loader: GLTFLoader, renderer?: THREE.WebGLRenderer): void {
    // Setup Draco
    if (ENABLE_DRACO) {
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath(assetUrl('draco/'));
        dracoLoader.setDecoderConfig({ type: 'js' }); // Use JS decoder for broader compatibility
        loader.setDRACOLoader(dracoLoader);
    }

    // Setup KTX2
    if (ENABLE_KTX2 && renderer) {
        const ktx2Loader = new KTX2Loader();
        ktx2Loader.setTranscoderPath('/basis/');
        ktx2Loader.detectSupport(renderer);
        loader.setKTX2Loader(ktx2Loader);
    }

    // Setup Meshopt
    if (ENABLE_MESHOPT) {
        loader.setMeshoptDecoder(MeshoptDecoder);
    }
}

/**
 * Creates a configured GLTFLoader with optional compression support.
 * @param renderer - Required for KTX2 texture detection
 */
export function createGLTFLoader(renderer?: THREE.WebGLRenderer): GLTFLoader {
    const loader = new GLTFLoader();
    configureGLTFLoader(loader, renderer);
    return loader;
}
