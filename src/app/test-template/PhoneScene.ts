import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { ACTION_MS, type PhoneAction } from "./PhoneModel";

/**
 * PhoneModel's three.js scene, in its own module so three.js is only
 * downloaded by the pages that show the phone (PhoneModel imports it on
 * mount). Builds the renderer into `host` and returns the teardown.
 */
export function mountPhone(
  host: HTMLDivElement,
  { screen, live, act, liveDirty }: { screen?: string; live?: HTMLCanvasElement; act: { current?: PhoneAction }; liveDirty: { current: boolean } },
) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  // Narrow lens from far away: a wide fov this close bulges the near edge of the
  // tilted phone. Phone is normalised to height 1; it fills ~85% of the canvas height.
  const camera = new THREE.PerspectiveCamera(15, 1, 0.1, 20);
  camera.position.set(0, 0, 4.6);

  // Cursor in -1..1 from the viewport centre; the pose eases toward it each frame.
  // Near-upright hero pose: a slight lean right, a sliver of the right edge showing.
  const BASE = new THREE.Euler(0.05, -0.3, -0.09);
  const TILT = 0.12; // max lean in radians (~7°)
  const cursor = { x: 0, y: 0 };
  const onMove = (e: PointerEvent) => {
    cursor.x = (e.clientX / innerWidth) * 2 - 1;
    cursor.y = (e.clientY / innerHeight) * 2 - 1;
  };
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!still) addEventListener("pointermove", onMove);
  let pose: THREE.Group | undefined;

  // The turn about the phone's own long axis that the ring and torch
  // actions play. Its own group inside the pose, so the lean and the
  // cursor tilt still apply around it.
  const spin = new THREE.Group();

  // Soft round glow for the flash, drawn once to a canvas.
  const glowCanvas = Object.assign(document.createElement("canvas"), { width: 128, height: 128 });
  const g = glowCanvas.getContext("2d")!;
  const grad = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grad.addColorStop(0, "rgba(255,255,255,1)");
  grad.addColorStop(0.35, "rgba(255,255,255,0.9)");
  grad.addColorStop(1, "rgba(255,248,230,0)");
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 128);
  const glowTex = new THREE.CanvasTexture(glowCanvas);
  // A tight, bright core the size of the flash, and inside it a faint
  // wider halo for bloom. Positioned and sized in the model's own units.
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false }));
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, transparent: true, depthWrite: false, opacity: 0.3 }));
  glow.scale.setScalar(0.012);
  halo.scale.setScalar(0.034 / 0.012); // child of glow, so relative to it
  glow.add(halo);
  glow.visible = false;
  const flashMats: THREE.MeshBasicMaterial[] = [];
  let buttons: THREE.Object3D | undefined;
  let display: THREE.MeshBasicMaterial | undefined;
  let ownScreen: THREE.Texture | null = null;
  // Textures for `screen` actions, loaded on first use.
  const shots = new Map<string, THREE.Texture>();
  const loadShot = (url: string) => {
    if (!shots.has(url)) {
      const t = new THREE.TextureLoader().load(url);
      t.flipY = false; // glTF UV convention
      t.colorSpace = THREE.SRGBColorSpace;
      shots.set(url, t);
    }
    return shots.get(url)!;
  };

  const draco = new DRACOLoader().setDecoderPath(
    "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/libs/draco/gltf/",
  );
  new GLTFLoader().setDRACOLoader(draco).load("/models/phone.glb", ({ scene: phone }) => {
    const box = new THREE.Box3().setFromObject(phone);
    phone.position.sub(box.getCenter(new THREE.Vector3()));
    // Hero pose: leaning right, turned to show its right edge, top tipped back.
    pose = new THREE.Group();
    spin.add(phone);
    pose.add(spin);
    pose.scale.setScalar(1 / box.getSize(new THREE.Vector3()).y);
    pose.rotation.copy(BASE);
    scene.add(pose);
    // The flashlight. Its visible surface is the F_effect glass over the
    // recessed LED, so every flash part is lit together. The glow sprite
    // is centred on the flash housing and set just past the camera bump
    // (whose back face is at z -0.0081), so the bump can't clip it; it is
    // depth-tested, so the body hides it whenever the screen faces front.
    phone.traverse((o) => {
      if (o instanceof THREE.Mesh && /^(Back_Flash_Light|F_effect)/i.test(o.name)) {
        const mat = new THREE.MeshBasicMaterial({ color: 0x555555 });
        o.material = mat;
        flashMats.push(mat);
      }
    });
    const housing = phone.getObjectByName("Back_Flash_Base") as THREE.Mesh | undefined;
    if (housing) {
      housing.geometry.computeBoundingBox();
      const box = housing.geometry.boundingBox!;
      const c = box.getCenter(new THREE.Vector3());
      glow.position.set(c.x, c.y, -0.0095);
      housing.parent!.add(glow);
    }
    buttons = phone.getObjectByName("Side_Buttons");

    const front = phone.getObjectByName("Front_Screen") as THREE.Mesh | undefined;
    if (!front) return;
    const old = front.material as THREE.MeshStandardMaterial;
    // Unlit so the screen shows the image's true colours, like a lit display.
    let map = screen ? loadShot(screen) : old.emissiveMap || old.map;
    if (live) {
      map = new THREE.CanvasTexture(live);
      map.flipY = false;
      map.colorSpace = THREE.SRGBColorSpace;
      shots.set("live", map); // disposed with the shots
    }
    // toneMapped off too: the renderer's filmic curve would wash the screen out.
    display = new THREE.MeshBasicMaterial({ map, toneMapped: false });
    ownScreen = display.map;
    front.material = display;
  });

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = host;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  // Skip drawing while scrolled out of view.
  let visible = true;
  const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
  io.observe(host);

  // The turn eases toward a target that only ever grows, so it never
  // unwinds: the next back-facing angle for ring and torch, otherwise the
  // next front — so after a ring the phone carries on round to the front.
  renderer.setAnimationLoop((ms) => {
    const a = act.current;
    const age = a ? ms - a.at : -1;
    const playing = !!a && age >= 0 && (a.hold || age < ACTION_MS);
    const does = playing ? a.does : undefined;
    const back = does === "ring" || does === "torch";
    const TAU = Math.PI * 2;

    if (!still) {
      const target = back
        ? Math.ceil((spin.rotation.y - Math.PI) / TAU - 0.25) * TAU + Math.PI
        : Math.ceil(spin.rotation.y / TAU - 0.25) * TAU;
      spin.rotation.y += (target - spin.rotation.y) * 0.12;
    }

    if (pose) {
      pose.rotation.y += (BASE.y + cursor.x * TILT - pose.rotation.y) * 0.06;
      pose.rotation.x += (BASE.x + cursor.y * TILT - pose.rotation.x) * 0.06;
      // Vibrate: 300ms buzzes with 150ms gaps, a tight shake that dies away.
      const buzz = does === "ring" && !still && age % 450 < 300 ? 1 - age / ACTION_MS : 0;
      pose.position.x = Math.sin(ms * 0.09) * 0.004 * buzz;
      pose.rotation.z = BASE.z + Math.sin(ms * 0.11) * 0.012 * buzz;
    }

    // Flash: once the back has come round, the LED blinks at 2.5Hz for a
    // ring (under the 3-flashes-a-second limit) or holds for a torch.
    // (Reduced motion: no turn, so no LED; HeroPhone shows a steady glow.)
    const lit = back && !still && age > 600;
    const flash = lit && (does === "torch" || (age - 600) % 400 < 200);
    glow.visible = flash;
    for (const m of flashMats) m.color.setHex(flash ? 0xffffff : 0x555555);

    // Volume: the side buttons press in, three times.
    if (buttons) buttons.position.x = does === "volume" && !still && age % 700 < 250 ? -0.0006 : 0;

    // Screen: the display shows the action's image while it plays.
    if (display) {
      const want = does === "screen" && a?.screen ? loadShot(a.screen) : ownScreen;
      if (display.map !== want) {
        display.map = want;
        display.needsUpdate = true;
      }
    }
    if (live && liveDirty.current && ownScreen) {
      ownScreen.needsUpdate = true;
      liveDirty.current = false;
    }
    if (visible) renderer.render(scene, camera);
  });

  return () => {
    ro.disconnect();
    io.disconnect();
    renderer.setAnimationLoop(null);
    removeEventListener("pointermove", onMove);
    draco.dispose();
    glowTex.dispose();
    shots.forEach((t) => t.dispose());
    pmrem.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
