import { Object3D, MeshStandardMaterial } from 'three';

export function logMaterials(root: Object3D, label = 'MODEL') {
  const materials = new Set<MeshStandardMaterial>();

  root.traverse((child: any) => {
    if (child.isMesh && child.material) {
      if (Array.isArray(child.material)) {
        child.material.forEach((m) => materials.add(m));
      } else {
        materials.add(child.material);
      }
    }
  });

  console.log(`[MAT-AUDIT] ${label}`, {
    count: materials.size,
  });

  materials.forEach((mat, idx) => {
    const mapSrc = (mat.map as any)?.image?.src;
    const normalSrc = (mat.normalMap as any)?.image?.src;
    const roughSrc = (mat.roughnessMap as any)?.image?.src;

    console.log(`[MAT-AUDIT] mat#${idx}`, {
      name: mat.name,
      colorMap: mapSrc,
      normalMap: normalSrc,
      roughnessMap: roughSrc,
    });
  });
}
