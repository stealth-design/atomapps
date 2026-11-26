"use client";
/* eslint-disable react-hooks/immutability -- R3F's useFrame and effects mutate three.js objects (textures, the scene, the shared refs) outside render by design */

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { BUZZ, FLY_AT, LIFT_AT, LIFT_MS, CLOSE_AT } from "./HeroFindPhone";

/**
 * HeroFindPhone's scene, in React Three Fiber: the living room (room.glb, metres, floor at y 0) with the
 * phone slipped down between the sofa's seat and backrest, behind a throw cushion. `act.current` is the
 * performance.now() of the clap; from it the phone buzzes (the cushion shivers, light leaks out round it),
 * the camera turns round to the sofa, the cushion is pulled aside, and the camera closes in on the lit
 * phone. With no clap the cushion settles back over the phone and the camera eases out to the wide view.
 */
type Props = { live: HTMLCanvasElement; act: { current: number | null }; liveDirty: { current: boolean } };

// The L-shaped sofa round the rug (room.glb's Sofa_HQ): its long side runs along x -2.5..1.3, backrest at
// z 0.75..1.0 (top y 0.55), seat z 1.0..1.5 at y ~0.3; sitters face +z.
// The phone lies on the seat under the sofa's own pair of throw pillows (room.glb's Sofa_Cushion, split
// off the sofa in Blender, origin at its centre), which covers x -0.26..0.29, z 0.93..1.19.
const PHONE_AT = new THREE.Vector3(0.05, 0.3, 1.07);
const CUSHION_AT = new THREE.Vector3(0.016, 0.416, 1.06); // Sofa_Cushion's rest position in room.glb
const CUSHION_OFF = new THREE.Vector3(-0.55, 0, 0.04); // pulled aside along the seat
const WIDE = { pos: new THREE.Vector3(3.3, 1.75, 2.4), look: new THREE.Vector3(0.2, 0.75, -2.4) };
// Search: turned round to the sofa from over the rug, close enough to see the cushion buzz.
const SEARCH = { pos: new THREE.Vector3(0.9, 1.25, 2.6), look: PHONE_AT.clone().add(new THREE.Vector3(0, 0.12, 0)) };
// Close: above and in front of the phone, aimed a little above it so it sits low in the frame, under the copy.
const CLOSE = { pos: PHONE_AT.clone().add(new THREE.Vector3(0.25, 0.5, 0.5)), look: PHONE_AT.clone().add(new THREE.Vector3(0, 0.08, 0)) };
const DRACO = "https://cdn.jsdelivr.net/npm/three@0.170.0/examples/jsm/libs/draco/gltf/";

const withDraco = (loader: GLTFLoader) => {
  loader.setDRACOLoader(new DRACOLoader().setDecoderPath(DRACO));
};
const smooth = (t: number) => t * t * (3 - 2 * t);

/** Image-based lighting: the model has no lights of its own. */
function Lighting() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    return () => {
      scene.environment = null;
      env.dispose();
      pmrem.dispose();
    };
  }, [gl, scene]);
  return null;
}

function Room() {
  const { scene } = useLoader(GLTFLoader, "/models/room.glb", withDraco);
  return <primitive object={scene} />;
}

function Story({ live, act, liveDirty }: Props) {
  const { scene: model } = useLoader(GLTFLoader, "/models/phone.glb", withDraco);
  const still = useMemo(() => matchMedia("(prefers-reduced-motion: reduce)").matches, []);

  // The phone's screen shows the `live` canvas, unlit and off the tone curve so it shows true colours.
  const screen = useMemo(() => {
    const t = new THREE.CanvasTexture(live);
    t.flipY = false; // glTF UV convention
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [live]);
  const display = useMemo(() => new THREE.MeshBasicMaterial({ map: screen, toneMapped: false, color: 0x111111 }), [screen]);
  useEffect(() => () => {
    screen.dispose();
    display.dispose();
  }, [screen, display]);

  // A 16cm phone, centred, lying screen-up (its front faces +z) a little off square to the table.
  const { phone, lift } = useMemo(() => {
    const m = model.clone();
    const box = new THREE.Box3().setFromObject(m);
    const size = box.getSize(new THREE.Vector3());
    const s = 0.16 / size.y;
    m.position.sub(box.getCenter(new THREE.Vector3())).multiplyScalar(s);
    m.scale.setScalar(s);
    const front = m.getObjectByName("Front_Screen") as THREE.Mesh | undefined;
    if (front) front.material = display;
    return { phone: m, lift: (size.z * s) / 2 };
  }, [model, display]);

  // The sofa's throw pillows, animated in place (useLoader caches, so this is the scene Room renders).
  const { scene: room } = useLoader(GLTFLoader, "/models/room.glb", withDraco);
  const pillow = useMemo(() => room.getObjectByName("Sofa_Cushion"), [room]);

  const group = useRef<THREE.Group>(null);
  const spill = useRef<THREE.PointLight>(null);

  const cursor = useRef({ x: 0, y: 0 });
  useEffect(() => {
    if (still) return;
    const onMove = (e: PointerEvent) => {
      cursor.current = { x: (e.clientX / innerWidth) * 2 - 1, y: (e.clientY / innerHeight) * 2 - 1 };
    };
    addEventListener("pointermove", onMove);
    return () => removeEventListener("pointermove", onMove);
  }, [still]);

  const eye = useRef<THREE.Vector3>(null);
  const aim = useRef<THREE.Vector3>(null);
  const goalPos = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ camera, size }, delta) => {
    const cam = camera as THREE.PerspectiveCamera;
    const fov = size.width / size.height < 1 ? 62 : 45; // narrow windows: a wider lens so the room still reads
    if (cam.fov !== fov) {
      cam.fov = fov;
      cam.updateProjectionMatrix();
    }

    const ms = performance.now();
    const at = act.current;
    const age = at === null ? -1 : ms - at;
    const buzzing = age >= BUZZ[0] && age < BUZZ[1];
    // How far the cushion is off the phone, 0–1; under reduced motion it's simply off once clapped.
    const off = at === null ? 0 : still ? 1 : smooth(Math.min(1, Math.max(0, (age - LIFT_AT) / LIFT_MS)));

    // Camera: wide, then over the cushion, then in close once it's off; eased by time, not frames.
    const pose = at === null ? WIDE : age >= CLOSE_AT || still ? CLOSE : age >= FLY_AT ? SEARCH : WIDE;
    const near = pose !== WIDE;
    if (!eye.current || !aim.current) {
      eye.current = pose.pos.clone();
      aim.current = pose.look.clone();
    }
    goalPos.copy(pose.pos);
    if (!still) goalPos.add(new THREE.Vector3(cursor.current.x * (near ? 0.06 : 0.25), -cursor.current.y * (near ? 0.04 : 0.12), 0));
    const k = still ? 1 : 1 - Math.exp(-(Math.min(delta, 0.1) * 1000) / (near ? 480 : 330));
    eye.current.lerp(goalPos, k);
    aim.current.lerp(pose.look, k);
    camera.position.copy(eye.current);
    camera.lookAt(aim.current);

    // Vibrate: 300ms buzzes, 150ms gaps; the phone skitters, and the cushion over it shivers.
    const buzz = buzzing && !still && (age - BUZZ[0]) % 450 < 300;
    const g = group.current;
    if (g) {
      g.rotation.y = buzz ? Math.sin(ms * 0.12) * 0.035 : g.rotation.y * 0.8;
      g.position.x = PHONE_AT.x + (buzz ? Math.sin(ms * 0.09) * 0.002 : 0);
    }
    const p = pillow;
    if (p) {
      const shiver = buzz && off === 0 ? 1 : 0;
      // Pulled aside along the seat in a low arc, swinging a little as it goes, and propped back up.
      p.position.copy(CUSHION_AT).addScaledVector(CUSHION_OFF, off);
      p.position.y += Math.sin(off * Math.PI) * 0.14 + shiver * Math.abs(Math.sin(ms * 0.11)) * 0.006;
      p.rotation.set(
        Math.sin(off * Math.PI) * 0.25 + shiver * Math.sin(ms * 0.13) * 0.03,
        Math.sin(off * Math.PI) * 0.3,
        -Math.sin(off * Math.PI) * 0.5 + shiver * Math.sin(ms * 0.1) * 0.03,
      );
    }

    // Screen and light: on from the first buzz, and the screen stays on once found. While covered,
    // the light leaks out round the cushion's edges.
    const lit = at !== null && age >= BUZZ[0];
    const pulse = buzzing ? 0.75 + 0.25 * Math.sin(age * 0.016) : 0;
    display.color.setScalar(lit ? 1 : 0.07);
    if (spill.current) spill.current.intensity = buzzing ? (off < 1 ? 1.6 : 1.2) * pulse : lit ? 0.25 : 0;

    if (liveDirty.current) {
      screen.needsUpdate = true;
      liveDirty.current = false;
    }
  });

  return (
    <>
      {/* Screen-up on the seat under the pillows, a little off square. */}
      <group ref={group} position={[PHONE_AT.x, PHONE_AT.y + lift, PHONE_AT.z]}>
        <group rotation={[-Math.PI / 2, 0, 1.45]}>
          <primitive object={phone} />
        </group>
      </group>

      {/* The screen's glow, leaking out under the cushion onto the seat. */}
      <pointLight ref={spill} color={0xdfe8ff} intensity={0} distance={1.2} decay={1.5} position={[PHONE_AT.x, PHONE_AT.y + 0.05, PHONE_AT.z + 0.12]} />
    </>
  );
}

export default function RoomScene(props: Props) {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(host.current!);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={host} className="absolute inset-0">
      <Canvas
        frameloop={visible ? "always" : "never"}
        dpr={[1, 1.5]} // capped like the shaders: full 2x fill stalls scrolling on laptop GPUs
        gl={{ antialias: true }}
        camera={{ fov: 45, near: 0.02, far: 60, position: WIDE.pos.toArray() }}
      >
        <color attach="background" args={[0xc4d6f0]} /> {/* sky through the window */}
        <Lighting />
        <Suspense fallback={null}>
          <Room />
          <Story {...props} />
        </Suspense>
      </Canvas>
    </div>
  );
}
