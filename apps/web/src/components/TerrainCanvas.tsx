"use client";

import { useEffect, useRef } from "react";

export default function TerrainCanvas() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let renderer: any;
    let animation: number | null = null;

    const init = async () => {
      const THREE = await import("three");
      const width = ref.current?.clientWidth ?? 400;
      const height = ref.current?.clientHeight ?? 220;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.set(0, 2, 4);
      camera.lookAt(0, 0, 0);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      ref.current?.appendChild(renderer.domElement);

      const geometry = new THREE.PlaneGeometry(3, 2, 30, 20);
      geometry.rotateX(-Math.PI / 2);
      const material = new THREE.MeshStandardMaterial({ color: 0x1c2b3a, wireframe: true });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      const light = new THREE.PointLight(0xffbf4f, 1, 100);
      light.position.set(2, 4, 2);
      scene.add(light);

      const animate = () => {
        mesh.rotation.y += 0.001;
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
