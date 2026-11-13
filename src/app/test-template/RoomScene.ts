import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/**
 * HeroFindPhone's three.js scene: the living room (room.glb, metres, floor at
 * y 0) with the phone lying screen-up on the coffee table. `act.at` is the
 * performance.now() of the clap; from it the phone buzzes, lights its screen
 * and spills light on the table while the camera flies in to it. With no clap
 * the camera eases back to the wide view. Returns the teardown.
 */
export const BUZZ = [700, 4000]; // ms after the clap
export const FLY_AT = 1300;

// Coffee table: top at y 0.555, x -1.67..-0.29, z -2.16..-1.39 (from room.glb's bounds).
const PHONE_AT = new THREE.Vector3(-0.85, 0.556, -1.74);
const WIDE = { pos: new THREE.Vector3(3.3, 1.75, 2.4), look: new THREE.Vector3(0.2, 0.75, -2.4) };
// Close: above and in front of the phone, aimed a little above it so it sits low in the frame, under the copy.
const CLOSE = {
  pos: PHONE_AT.clone().add(new THREE.Vector3(0.32, 0.5, 0.5)),
  look: PHONE_AT.clone().add(new THREE.Vector3(0, 0.1, 0)),
};

export function mountRoom(
  host: HTMLDivElement,
  { live, act, liveDirty }: { live: HTMLCanvasElement; act: { current: number | null }; liveDirty: { current: boolean } },
) {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  host.appendChild(renderer.domElement);
  renderer.domElement.style.display = "block";

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xc4d6f0); // sky through the window
  const pmrem = new THREE.PMREMGenerator(renderer);
  // The model has no lights of its own, so image-based lighting does the work.
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(45, 1, 0.02, 60);
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const eye = (still && act.current !== null ? CLOSE : WIDE).pos.clone();
  const aim = (still && act.current !== null ? CLOSE : WIDE).look.clone();

  const cursor = { x: 0, y: 0 };
  const onMove = (e: PointerEvent) => {
    cursor.x = (e.clientX / innerWidth) * 2 - 1;
    cursor.y = (e.clientY / innerHeight) * 2 - 1;
  };
  if (!still) addEventListener("pointermove", onMove);

  // The phone's light on the table, and sound rings spreading out from it.
  const spill = new THREE.PointLight(0xdfe8ff, 0, 1.6, 1.5);
  spill.position.copy(PHONE_AT).add(new THREE.Vector3(0, 0.12, 0));
  scene.add(spill);
  const rings = [0, 1, 2].map(() => {
    const m = new THREE.Mesh(
      new THREE.RingGeometry(0.975, 1, 64),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }),
    );
    m.rotation.x = -Math.PI / 2;
    m.position.copy(PHONE_AT).add(new THREE.Vector3(0, 0.004, 0));
    scene.add(m);
    return m;
  });

  const draco = new DRACOLoader().setDecoderPath("https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/libs/draco/gltf/");
  const loader = new GLTFLoader().setDRACOLoader(draco);
  const disposables: { dispose(): void }[] = [];
  loader.load("/models/room.glb", ({ scene: room }) => scene.add(room));

  const phone = new THREE.Group();
  let display: THREE.MeshBasicMaterial | undefined;
  const screenTex = new THREE.CanvasTexture(live);
  screenTex.flipY = false; // glTF UV convention
  screenTex.colorSpace = THREE.SRGBColorSpace;
  disposables.push(screenTex);
  loader.load("/models/phone.glb", ({ scene: model }) => {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    model.position.sub(box.getCenter(new THREE.Vector3()));
    const s = 0.16 / size.y; // a 16cm phone
    model.scale.setScalar(s);
    model.position.multiplyScalar(s);
    // Lying screen-up (its front faces +z), turned a little off square to the table.
    const lie = new THREE.Group();
    lie.rotation.set(-Math.PI / 2, 0, 0.5);
    lie.add(model);
    phone.add(lie);
    phone.position.copy(PHONE_AT).add(new THREE.Vector3(0, (size.z * s) / 2, 0));
    scene.add(phone);
    const front = model.getObjectByName("Front_Screen") as THREE.Mesh | undefined;
    if (front) {
      // Unlit, and off the tone curve, so the lit screen shows true colours.
      display = new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false, color: 0x111111 });
      front.material = display;
    }
  });

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = host;
    camera.aspect = w / h;
    // Narrow windows: a wider lens so the room still reads.
    camera.fov = camera.aspect < 1 ? 62 : 45;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  let visible = true;
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
  io.observe(host);

  const goalPos = new THREE.Vector3();
  const goalLook = new THREE.Vector3();
  let last = 0;
  renderer.setAnimationLoop((ms) => {
    const dt = Math.min(ms - last, 100);
    last = ms;
    if (!visible) return;
    const at = act.current;
    const age = at === null ? -1 : ms - at;
    const close = at !== null && age >= FLY_AT;
    const buzzing = age >= BUZZ[0] && age < BUZZ[1];

    // Camera: eases toward its goal (by time, not frames), so a replay flies back out before the next clap.
    const pose = close ? CLOSE : WIDE;
    goalPos.copy(pose.pos);
    goalLook.copy(pose.look);
    if (!still) goalPos.add(new THREE.Vector3(cursor.x * (close ? 0.06 : 0.25), -cursor.y * (close ? 0.04 : 0.12), 0));
    const k = still ? 1 : 1 - Math.exp(-dt / (close ? 480 : 330));
    eye.lerp(goalPos, k);
    aim.lerp(goalLook, k);
    camera.position.copy(eye);
    camera.lookAt(aim);

    // Vibrate: 300ms buzzes, 150ms gaps; the phone skitters on the table.
    const buzz = buzzing && !still && (age - BUZZ[0]) % 450 < 300;
    phone.rotation.y = buzz ? Math.sin(ms * 0.12) * 0.035 : phone.rotation.y * 0.8;
    phone.position.x = PHONE_AT.x + (buzz ? Math.sin(ms * 0.09) * 0.002 : 0);

    // Screen and light: on from the first buzz, and the screen stays on once found.
    const lit = at !== null && age >= BUZZ[0];
    const pulse = buzzing ? 0.75 + 0.25 * Math.sin(age * 0.016) : 0;
    if (display) display.color.setScalar(lit ? 1 : 0.07);
    spill.intensity = buzzing ? 1.2 * pulse : lit ? 0.25 : 0;
    rings.forEach((r, i) => {
      const t = ((age - BUZZ[0]) / 1100 - i / 3) % 1;
      const on = buzzing && !still && t >= 0;
      r.visible = on;
      if (!on) return;
      r.scale.setScalar(0.08 + t * 0.28);
      (r.material as THREE.MeshBasicMaterial).opacity = (1 - t) * 0.5;
    });

    if (liveDirty.current) {
      screenTex.needsUpdate = true;
      liveDirty.current = false;
    }
    renderer.render(scene, camera);
  });

  return () => {
    ro.disconnect();
    io.disconnect();
    renderer.setAnimationLoop(null);
    removeEventListener("pointermove", onMove);
    draco.dispose();
    disposables.forEach((d) => d.dispose());
    rings.forEach((r) => {
      r.geometry.dispose();
      (r.material as THREE.Material).dispose();
    });
    pmrem.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
