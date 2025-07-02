import React, { useRef } from "react";
import { useFrame, InstancedMesh } from "@react-three/fiber";
import * as THREE from "three";

const ParticleSystem = () => {
  const particles = useRef<THREE.InstancedMesh>(null!);

  useFrame(() => {
    for (let i = 0; i < particles.current.count; i++) {
      const matrix = new THREE.Matrix4();
      matrix.setPosition(
        Math.random() * 10,
        Math.random() * 10,
        Math.random() * 10
      );
      particles.current.setMatrixAt(i, matrix);
    }
    particles.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={particles} args={[null, null, 100]}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial color="white" />
    </instancedMesh>
  );
};

export default ParticleSystem;
