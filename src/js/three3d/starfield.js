import * as THREE from "three";

/**
 * Builds a 3-layer parallax starfield + nebula sky for a 3D scene.
 * Stars are large THREE.Points clouds positioned far from origin.
 */
export function createStarfield(scene) {
  // Distant stars (white/blue)
  const geom = new THREE.BufferGeometry();
  const COUNT = 1500;
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i += 1) {
    const r = 200 + Math.random() * 600;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);
    positions.set([x, y, z], i * 3);
    const c = 0.6 + Math.random() * 0.4;
    colors.set([c, c, Math.min(1, c + 0.15)], i * 3);
  }
  geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geom.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const mat = new THREE.PointsMaterial({
    size: 1.6,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
  });
  const stars = new THREE.Points(geom, mat);
  scene.add(stars);

  // Closer dust layer
  const geom2 = new THREE.BufferGeometry();
  const COUNT2 = 600;
  const positions2 = new Float32Array(COUNT2 * 3);
  for (let i = 0; i < COUNT2; i += 1) {
    positions2.set(
      [
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200,
        -Math.random() * 400,
      ],
      i * 3,
    );
  }
  geom2.setAttribute("position", new THREE.BufferAttribute(positions2, 3));
  const mat2 = new THREE.PointsMaterial({
    color: 0xa8c8ff,
    size: 0.8,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.55,
  });
  const dust = new THREE.Points(geom2, mat2);
  scene.add(dust);

  // Set deep-space fog/clear color
  scene.background = new THREE.Color(0x05060d);
  scene.fog = new THREE.Fog(0x05060d, 60, 220);

  return { stars, dust };
}
