import { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

export function WebGLRecovery() {
  const { gl } = useThree();
  const [contextLost, setContextLost] = useState(false);
  const [recovering, setRecovering] = useState(false);

  useEffect(() => {
    if (!gl || !gl.domElement) return;

    const canvas = gl.domElement;

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      console.log('🔄 WebGL Recovery: Context lost detected, starting recovery...');
      setContextLost(true);
      setRecovering(true);
    };

    const handleContextRestored = () => {
      console.log('✅ WebGL Recovery: Context restored, recovery complete');
      setContextLost(false);
      setRecovering(false);

      // Force a full scene refresh
      setTimeout(() => {
        if (gl) {
          gl.setSize(gl.domElement.clientWidth, gl.domElement.clientHeight, false);
          gl.render(gl.getContext().scene || new THREE.Scene(), gl.getContext().camera || new THREE.PerspectiveCamera());
        }
      }, 100);
    };

    canvas.addEventListener('webglcontextlost', handleContextLost);
    canvas.addEventListener('webglcontextrestored', handleContextRestored);

    return () => {
      canvas.removeEventListener('webglcontextlost', handleContextLost);
      canvas.removeEventListener('webglcontextrestored', handleContextRestored);
    };
  }, [gl]);

  // Show recovery UI if context is lost
  if (contextLost && recovering) {
    return (
      <Html center>
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: '20px',
            borderRadius: '10px',
            textAlign: 'center',
            minWidth: '200px',
            fontFamily: 'system-ui'
          }}
        >
          <div style={{ marginBottom: '10px', fontSize: '24px' }}>🔄</div>
          <div style={{ fontWeight: 'bold' }}>Recovering WebGL context...</div>
          <div style={{ fontSize: '12px', marginTop: '10px', opacity: 0.7 }}>
            Graphics context was lost, attempting recovery
          </div>
        </div>
      </Html>
    );
  }

  return null;
}