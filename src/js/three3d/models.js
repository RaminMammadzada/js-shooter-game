import * as THREE from "three";

/**
 * Procedurally builds a player starfighter from primitive geometries.
 * Returns a THREE.Group with the ship pre-oriented (nose toward -Z).
 */
export function createPlayerShip() {
  const group = new THREE.Group();
  group.name = "PlayerShip";

  const hullMat = new THREE.MeshStandardMaterial({
    color: 0x6ed4ff,
    metalness: 0.7,
    roughness: 0.3,
    emissive: 0x0a2a3a,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0xff5ed1,
    metalness: 0.6,
    roughness: 0.35,
    emissive: 0x401030,
  });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x111a2e,
    metalness: 0.9,
    roughness: 0.05,
    emissive: 0x002233,
  });
  const engineMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: 0x66e0ff,
    emissiveIntensity: 2.5,
  });

  // Body — elongated bevelled hull
  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.35, 0.55, 2.2, 12),
    hullMat,
  );
  body.rotation.x = Math.PI / 2;
  group.add(body);

  // Nose cone
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.9, 12), accentMat);
  nose.rotation.x = -Math.PI / 2;
  nose.position.z = -1.55;
  group.add(nose);

  // Cockpit glass
  const cockpit = new THREE.Mesh(
    new THREE.SphereGeometry(0.32, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2),
    glassMat,
  );
  cockpit.position.set(0, 0.25, -0.2);
  group.add(cockpit);

  // Wings
  const wingGeo = new THREE.BoxGeometry(2.4, 0.08, 0.9);
  const wing = new THREE.Mesh(wingGeo, hullMat);
  wing.position.z = 0.2;
  group.add(wing);

  const wingTip = new THREE.Mesh(
    new THREE.BoxGeometry(0.18, 0.18, 0.6),
    accentMat,
  );
  wingTip.position.set(1.2, 0, 0.2);
  group.add(wingTip);
  const wingTip2 = wingTip.clone();
  wingTip2.position.x = -1.2;
  group.add(wingTip2);

  // Twin engines glow at tail
  const eng1 = new THREE.Mesh(new THREE.CircleGeometry(0.25, 16), engineMat);
  eng1.position.set(0.35, 0, 1.1);
  eng1.rotation.y = Math.PI;
  group.add(eng1);
  const eng2 = eng1.clone();
  eng2.position.x = -0.35;
  group.add(eng2);

  // Engine point lights for bloom feel even without postprocess
  const light1 = new THREE.PointLight(0x66e0ff, 1.4, 6, 2);
  light1.position.set(0, 0, 1.5);
  group.add(light1);

  return group;
}

/** A simple angular enemy fighter (red/orange) facing +Z (toward camera). */
export function createEnemyShip() {
  const group = new THREE.Group();
  group.name = "EnemyShip";

  const hullMat = new THREE.MeshStandardMaterial({
    color: 0xff7a3a,
    metalness: 0.6,
    roughness: 0.4,
    emissive: 0x331008,
  });
  const accentMat = new THREE.MeshStandardMaterial({
    color: 0xffe04a,
    metalness: 0.4,
    roughness: 0.5,
    emissive: 0x332200,
  });

  const body = new THREE.Mesh(new THREE.OctahedronGeometry(0.7, 0), hullMat);
  body.scale.set(1.2, 0.5, 1.4);
  group.add(body);

  const wing = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.05, 0.5), accentMat);
  group.add(wing);

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 12, 10),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xff3300,
      emissiveIntensity: 2.5,
    }),
  );
  core.position.z = 0.1;
  group.add(core);

  return group;
}

/** Glowing bullet projectile. */
export function createBullet(color = 0x66e0ff) {
  const geo = new THREE.CapsuleGeometry(0.08, 0.5, 4, 8);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    emissive: color,
    emissiveIntensity: 4,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = Math.PI / 2;
  return mesh;
}

/** Tumbling asteroid. */
export function createAsteroid(radius = 0.8) {
  const geo = new THREE.IcosahedronGeometry(radius, 0);
  // Distort vertices for irregular shape
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i += 1) {
    const f = 0.7 + Math.random() * 0.6;
    pos.setXYZ(i, pos.getX(i) * f, pos.getY(i) * f, pos.getZ(i) * f);
  }
  geo.computeVertexNormals();
  const mat = new THREE.MeshStandardMaterial({
    color: 0x6a6a78,
    metalness: 0.2,
    roughness: 0.95,
    flatShading: true,
  });
  return new THREE.Mesh(geo, mat);
}

/** Player-2 starfighter — same shape, swapped palette (magenta/cyan). */
export function createPlayer2Ship() {
  const ship = createPlayerShip();
  ship.name = "Player2Ship";
  // Recolor the major materials so the two ships are easy to tell apart.
  ship.traverse((o) => {
    if (!o.isMesh) return;
    const m = o.material;
    if (m && m.color && m.emissive) {
      const hex = m.color.getHex();
      if (hex === 0x6ed4ff) {
        m.color.setHex(0xff5ed1);
        m.emissive.setHex(0x3a0a2a);
      } else if (hex === 0xff5ed1) {
        m.color.setHex(0xb8ff5e);
        m.emissive.setHex(0x123a08);
      } else if (m.emissive.getHex() === 0x66e0ff) {
        m.emissive.setHex(0xff5ed1);
      }
    }
  });
  // Engine point light too
  ship.traverse((o) => {
    if (o.isPointLight) o.color.setHex(0xff5ed1);
  });
  return ship;
}

/** Floating, spinning, color-coded power-up pickup. */
export function createPowerup(kind = "rapid") {
  const palette = {
    rapid: { color: 0xffd24a, emissive: 0xaa6600 },
    triple: { color: 0x6affc8, emissive: 0x008855 },
    shield: { color: 0x6ed4ff, emissive: 0x002a55 },
  };
  const p = palette[kind] || palette.rapid;
  const group = new THREE.Group();
  group.userData.kind = kind;

  const core = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.45, 0),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: p.emissive,
      emissiveIntensity: 1.8,
      metalness: 0.4,
      roughness: 0.3,
    }),
  );
  group.add(core);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.7, 0.06, 8, 24),
    new THREE.MeshStandardMaterial({
      color: p.color,
      emissive: p.emissive,
      emissiveIntensity: 1.2,
      metalness: 0.6,
      roughness: 0.2,
    }),
  );
  group.add(ring);
  group.userData.ring = ring;

  const light = new THREE.PointLight(p.color, 1.0, 5, 2);
  group.add(light);
  return group;
}

/** Mini-boss — chunkier, glowy, 3 nested rings. */
export function createBoss() {
  const group = new THREE.Group();
  group.name = "Boss";
  const hull = new THREE.MeshStandardMaterial({
    color: 0xff3355,
    metalness: 0.7,
    roughness: 0.3,
    emissive: 0x550011,
  });
  const accent = new THREE.MeshStandardMaterial({
    color: 0xffaa00,
    metalness: 0.6,
    roughness: 0.4,
    emissive: 0x553300,
  });
  const body = new THREE.Mesh(new THREE.IcosahedronGeometry(2.0, 0), hull);
  group.add(body);
  for (let i = 0; i < 3; i += 1) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(2.4 + i * 0.4, 0.12, 10, 32),
      accent,
    );
    ring.rotation.x = (i * Math.PI) / 3;
    ring.rotation.y = (i * Math.PI) / 4;
    group.add(ring);
  }
  const core = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 16, 12),
    new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xff5500,
      emissiveIntensity: 3,
    }),
  );
  group.add(core);
  const light = new THREE.PointLight(0xff5500, 2.0, 14, 2);
  group.add(light);
  return group;
}
