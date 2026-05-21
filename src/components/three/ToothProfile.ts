import * as THREE from "three";

/**
 * Returns a lathe profile curve approximating a tooth shape (incisor/premolar).
 * The scale factor shrinks the profile uniformly to produce nested layers
 * (enamel → dentin → pulp).
 */
export function toothProfile(scale = 1): THREE.Vector2[] {
  // (x = radius, y = height). Rotated around Y axis.
  const pts: [number, number][] = [
    [0.0, 2.2],
    [0.55, 2.15],
    [1.05, 1.95],
    [1.35, 1.55],
    [1.42, 1.05],
    [1.3, 0.55],
    [1.05, 0.1],
    [0.9, -0.2],
    [0.8, -0.55],
    [0.68, -1.0],
    [0.52, -1.45],
    [0.36, -1.85],
    [0.18, -2.15],
    [0.0, -2.25],
  ];
  return pts.map(([x, y]) => new THREE.Vector2(x * scale, y));
}

/**
 * Canal path: a subtle offset curve running down the center of the pulp,
 * visualising the root canal itself.
 */
export function canalPath(): THREE.Vector3[] {
  return [
    new THREE.Vector3(0, 1.8, 0),
    new THREE.Vector3(0.02, 1.0, 0),
    new THREE.Vector3(-0.03, 0.3, 0),
    new THREE.Vector3(0.04, -0.4, 0),
    new THREE.Vector3(-0.05, -1.1, 0),
    new THREE.Vector3(0.02, -1.8, 0),
    new THREE.Vector3(0.0, -2.15, 0),
  ];
}
