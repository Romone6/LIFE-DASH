"use client";

import { useEffect, useRef } from "react";
import { getRecoveryColor } from "../lib/recoveryColor";

type TwinCanvasProps = {
  recoveryHours?: number;
};

export default function TwinCanvas({ recoveryHours = 96 }: TwinCanvasProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = ref.current;
    if (!mount) return;

    let renderer: any;
    let animation: number | null = null;

    const init = async () => {
      const THREE = await import("three");
      const width = mount.clientWidth ?? 300;
      const height = mount.clientHeight ?? 300;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      camera.position.z = 4;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width, height);
      mount.appendChild(renderer.domElement);

      const geometry = new THREE.IcosahedronGeometry(1.2, 1);
      const material = new THREE.MeshStandardMaterial({
        color: new THREE.Color(getRecoveryColor(recoveryHours)),
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
      if (renderer && mount.firstChild) {
        mount.removeChild(mount.firstChild);
      }
    };
  }, [recoveryHours]);

  return <div ref={ref} style={{ width: "100%", height: "220px" }} />;
}
