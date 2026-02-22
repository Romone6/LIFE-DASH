"use client";

import { useEffect, useRef } from "react";

export default function TwinCanvas() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let renderer: any;
    let animation: number | null = null;

    const init = async () => {
      const THREE = await import("three");
      const width = ref.current?.clientWidth ?? 300;
      const height = ref.current?.clientHeight ?? 300;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.z = 4;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      ref.current?.appendChild(renderer.domElement);

      const geometry = new THREE.IcosahedronGeometry(1.2, 1);
      const material = new THREE.MeshStandardMaterial({
        color: 0x5b6bff,
        wireframe: true
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      const light = new THREE.PointLight(0x8ffcff, 1, 100);
      light.position.set(5, 5, 5);
      scene.add(light);

      const animate = () => {
        mesh.rotation.y += 0.002;
        renderer.render(scene, camera);
        animation = requestAnimationFrame(animate);
      };
      animate();
    };

    init().catch(() => undefined);

    return () => {
      if (animation) cancelAnimationFrame(animation);
      if (renderer && ref.current?.firstChild) {
        ref.current.removeChild(ref.current.firstChild);
      }
    };
  }, []);

  return <div ref={ref} style={{ width: "100%", height: "220px" }} />;
}
