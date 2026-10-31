import * as THREE from 'three';

// No external models, textures, or animation downloads. One renderer, capped at 30 fps.
export function createOrbScene(host: HTMLElement, ready: () => void, failed: () => void) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 30);
  camera.position.set(0, 0.15, 7.6);
  scene.add(new THREE.HemisphereLight(0xd8ffdf, 0x062f23, 3));
  const key = new THREE.DirectionalLight(0xf4ffe9, 5);
  key.position.set(-3, 4, 5); scene.add(key);
  const rim = new THREE.DirectionalLight(0xafff6d, 5);
  rim.position.set(3, 0, -2); scene.add(rim);
  const orb = new THREE.Group(); scene.add(orb);
  const glass = new THREE.MeshPhysicalMaterial({ color: 0x08764d, metalness: 0.3, roughness: 0.19,
    clearcoat: 1, clearcoatRoughness: 0.1, iridescence: 0.3, iridescenceIOR: 1.3 });
  const mint = new THREE.MeshStandardMaterial({ color: 0xbaff9b, emissive: 0x6bde57, emissiveIntensity: 0.6, roughness: 0.3 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x012c22, roughness: 0.23, metalness: 0.3 });
  function sphere(radius: number, material: THREE.Material, parent: THREE.Object3D, x = 0, y = 0, z = 0) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 40, 28), material);
    mesh.position.set(x, y, z); parent.add(mesh); return mesh;
  }
  sphere(1, glass, orb);
  const face = sphere(0.76, dark, orb, 0, 0.04, 0.84); face.scale.set(1, 0.78, 0.47);
  const eyes = new THREE.Group(); eyes.position.set(0, 0.16, 1.2); orb.add(eyes);
  for (const x of [-0.27, 0.27]) {
    const eye = sphere(0.11, mint, eyes, x); eye.scale.set(0.65, 1.3, 0.3);
  }
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.025, 8, 32, Math.PI), mint);
  smile.rotation.z = Math.PI; smile.position.set(0, -0.12, 1.23); orb.add(smile);
  const glint = sphere(0.21, new THREE.MeshBasicMaterial({ color: 0xe4ffd9, transparent: true, opacity: 0.65 }), orb, -0.43, 0.65, 0.78);
  glint.scale.set(0.5, 1, 0.1); glint.rotation.z = -0.7;
  function hand(x: number) {
    const group = new THREE.Group(); group.position.set(x, -0.12, 0); orb.add(group);
    const arm = sphere(0.18, glass, group, x > 0 ? 0.17 : -0.17, -0.1, 0.07);
    arm.scale.set(1.5, 0.7, 0.8);
    const palm = sphere(0.18, glass, group, x > 0 ? 0.4 : -0.4, 0.06, 0.18);
    palm.scale.set(0.85, 1.1, 0.7);
    for (let i = 0; i < 3; i++) {
      const finger = sphere(0.065, glass, group, (x > 0 ? 0.29 : -0.48) + i * 0.085, 0.25, 0.18);
      finger.scale.set(0.7, 1.7, 0.75);
    }
    return group;
  }
  const wave = hand(-0.9);
  const offerHand = hand(0.9);
  const card = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.83, 0.06), new THREE.MeshStandardMaterial({ color: 0xf5f2df, roughness: 0.5 }));
  card.position.set(0.43, 0.42, 0.29); card.rotation.z = -0.13; offerHand.add(card);
  // A sculpted gift on the little card keeps it meaningful in either theme.
  const gift = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.28, 0.05), new THREE.MeshStandardMaterial({ color: 0x08764d }));
  gift.position.set(0, 0.03, 0.06); card.add(gift);
  const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.34, 0.03), mint); ribbon.position.z = 0.04; gift.add(ribbon);
  const line = new THREE.Mesh(new THREE.BoxGeometry(0.33, 0.04, 0.03), mint); line.position.z = 0.04; gift.add(line);
  for (const x of [-0.07, 0.07]) {
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.018, 8, 16), glass); loop.position.set(x, 0.22, 0.07); card.add(loop);
  }
  let inView = false, frame = 0, last = 0, elapsed = 0, disposed = false, firstFrame = true;
  const target = new THREE.Vector2();
  function point(event: PointerEvent) {
    const rect = host.getBoundingClientRect();
    target.set((event.clientX - rect.left) / rect.width - 0.5, (event.clientY - rect.top) / rect.height - 0.5);
  }
  const leave = () => target.set(0, 0);
  host.parentElement?.addEventListener('pointermove', point);
  host.parentElement?.addEventListener('pointerleave', leave);
  function resize() {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix();
  }
  const sizing = new ResizeObserver(resize); sizing.observe(host); resize();
  function draw(now: number) {
    frame = 0;
    if (disposed || !inView || document.hidden) return;
    if (now - last >= 1000 / 30) {
      elapsed += Math.min((now - last) / 1000, 0.05); last = now;
      const t = elapsed;
      orb.position.y = Math.sin(t * 1.5) * 0.08;
      orb.rotation.y += (target.x * 0.3 - orb.rotation.y) * 0.07;
      orb.rotation.x += (-target.y * 0.16 - orb.rotation.x) * 0.07;
      orb.rotation.z = Math.sin(t * 0.8) * 0.025;
      const greeting = t % 12 < 2.5;
      wave.rotation.z = greeting ? -0.48 + Math.sin(t * 9) * 0.2 : -0.1;
      offerHand.rotation.z = Math.sin(t * 0.8) * 0.08 + (greeting ? 0.14 : 0);
      const blink = t % 5.7; eyes.scale.y = blink < 0.14 ? 0.12 : 1;
      renderer.render(scene, camera);
      if (firstFrame) { firstFrame = false; ready(); }
    }
    frame = requestAnimationFrame(draw);
  }
  function resume() { if (!disposed && inView && !document.hidden && !frame) { last = performance.now(); frame = requestAnimationFrame(draw); } }
  const visibility = new IntersectionObserver(entries => {
    inView = entries[0].isIntersecting;
    if (!inView && frame) { cancelAnimationFrame(frame); frame = 0; }
    resume();
  }, { threshold: 0.05 });
  visibility.observe(host);
  document.addEventListener('visibilitychange', resume);
  function contextLost(event: Event) { event.preventDefault(); cleanup(); failed(); }
  renderer.domElement.addEventListener('webglcontextlost', contextLost);
  function cleanup() {
    if (disposed) return; disposed = true; cancelAnimationFrame(frame);
    visibility.disconnect(); sizing.disconnect(); document.removeEventListener('visibilitychange', resume);
    host.parentElement?.removeEventListener('pointermove', point); host.parentElement?.removeEventListener('pointerleave', leave);
    renderer.domElement.removeEventListener('webglcontextlost', contextLost);
    scene.traverse(object => { if (object instanceof THREE.Mesh) { object.geometry.dispose(); const materials = Array.isArray(object.material) ? object.material : [object.material]; materials.forEach(material => material.dispose()); } });
    renderer.dispose(); renderer.domElement.remove();
  }
  return cleanup;
}
