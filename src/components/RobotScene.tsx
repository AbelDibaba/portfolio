"use client";
/* eslint-disable react-hooks/immutability -- three.js objects (actions, meshes, the shared store) are mutated every frame by design */
import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useAnimations, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { screenGround, type RobotStore } from "./robotStore";

// "RobotExpressive" by Tomás Laulhé (Quaternius), CC0 1.0, via the three.js examples.
const MODEL = "/models/robot.glb";
const ONE_SHOT = new Set([
  "Wave",
  "ThumbsUp",
  "Yes",
  "No",
  "Jump",
  "Punch",
  "Sitting",
  "Standing",
]);
const SKIN: Record<string, string> = { Main: "#343b5c", Grey: "#7c8cff", Black: "#05060a" };
const ROPE_SEGMENTS = 16;
const { damp } = THREE.MathUtils;

// The camera is orthographic with zoom 1, so one world unit is one CSS pixel.
function useToWorld() {
  const size = useThree((st) => st.size);
  return (sx: number, sy: number) =>
    [sx - size.width / 2, size.height / 2 - sy] as const;
}

const turn = (from: number, to: number, k: number) =>
  from + Math.atan2(Math.sin(to - from), Math.cos(to - from)) * k;

type Particle = {
  mesh: THREE.Mesh;
  v: THREE.Vector2;
  life: number;
  max: number;
  size: number;
};

function Robot({
  s,
  bubble,
}: {
  s: RobotStore;
  bubble: React.RefObject<HTMLDivElement | null>;
}) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const { scene, animations } = useGLTF(MODEL);
  const { actions } = useAnimations(animations, body);
  const toWorld = useToWorld();
  const played = useRef({ key: -1, name: "" });
  const vis = useRef(0);
  const sweatClock = useRef(0);
  const lastSpark = useRef(0);
  const slack = useRef(0);
  const yawG = useRef<THREE.Group>(null);

  const rig = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const h = box.max.y - box.min.y;
    let face: THREE.Mesh | undefined;
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      if (!face && m.morphTargetDictionary) face = m;
      // "Midnight" skin: recolour the model's three materials to the site's palette
      for (const mat of [m.material].flat() as THREE.MeshStandardMaterial[]) {
        const color = SKIN[mat?.name];
        if (!color) continue;
        mat.color.set(color);
        mat.metalness = 0.3;
        mat.roughness = 0.35;
        if (mat.name === "Black") mat.emissive.set("#22d3ee").multiplyScalar(0.6); // glowing eyes
      }
    });
    const steel = new THREE.MeshStandardMaterial({
      color: "#cbd5e1",
      metalness: 0.8,
      roughness: 0.3,
    });
    // wrench in the right hand, sized in px (the bone's scale is undone every frame)
    const wrench = new THREE.Group();
    const handle = new THREE.Mesh(new THREE.BoxGeometry(5, 30, 4), steel);
    handle.position.y = 15;
    const jaw = new THREE.Mesh(
      new THREE.TorusGeometry(7, 2.6, 8, 16, Math.PI * 1.5),
      steel,
    );
    jaw.position.y = 34;
    wrench.add(handle, jaw);
    // arm bones (three.js strips dots from node names on load: "Palm2.R" becomes "Palm2R")
    const arms = ["L", "R"].map((side) =>
      ["UpperArm", "LowerArm", "Palm2"].map((n) => scene.getObjectByName(n + side)),
    );
    const handR = arms[1][2];
    // tool belt around the waist
    const leather = new THREE.MeshStandardMaterial({
      color: "#78350f",
      roughness: 0.9,
    });
    const belt = new THREE.Group();
    const strap = new THREE.Mesh(
      new THREE.TorusGeometry(20, 3.5, 8, 24),
      leather,
    );
    strap.rotation.x = Math.PI / 2;
    const pouch = new THREE.Mesh(new THREE.BoxGeometry(10, 12, 7), leather);
    pouch.position.set(13, -4, 15);
    belt.add(strap, pouch);
    // rope from the hands to the content, the ground shadow, sweat drops and sparks
    // a rope made of short twisted segments that sag between the hands and a hook on the content
    const strand = new THREE.CylinderGeometry(2.4, 2.4, 1, 6).rotateZ(
      Math.PI / 2,
    );
    const hemp = ["#c9a66b", "#a07c45"].map(
      (color) => new THREE.MeshStandardMaterial({ color, roughness: 1 }),
    );
    const rope = new THREE.Group();
    const segments = Array.from(
      { length: ROPE_SEGMENTS },
      (_, i) => new THREE.Mesh(strand, hemp[i % 2]),
    );
    const hook = new THREE.Mesh(new THREE.TorusGeometry(8, 2.6, 8, 16), steel);
    rope.add(...segments, hook);
    const shadow = new THREE.Mesh(
      new THREE.CircleGeometry(1, 24),
      new THREE.MeshBasicMaterial({
        color: "black",
        transparent: true,
        opacity: 0.35,
      }),
    );
    const particles: Particle[] = Array.from({ length: 28 }, () => ({
      mesh: new THREE.Mesh(
        new THREE.SphereGeometry(1, 6, 6),
        new THREE.MeshBasicMaterial({ transparent: true }),
      ),
      v: new THREE.Vector2(),
      life: 0,
      max: 1,
      size: 1,
    }));
    const fx = new THREE.Group();
    fx.add(rope, shadow, ...particles.map((p) => p.mesh));
    particles.forEach((p) => (p.mesh.visible = false));
    return {
      unit: 1 / h,
      lift: -box.min.y / h,
      face,
      head: scene.getObjectByName("Head"),
      arms,
      hands: [arms[0][2], handR],
      t: new THREE.Vector3(),
      d: new THREE.Vector3(),
      q: new THREE.Quaternion(),
      handR,
      wrench,
      belt,
      rope,
      segments,
      hook,
      shadow,
      particles,
      fx,
      v: new THREE.Vector3(),
      w: new THREE.Vector3(),
    };
  }, [scene]);

  // attach the wrench after commit (not during render), so the one in the hand is always rig.wrench
  useEffect(() => {
    rig.handR?.add(rig.wrench);
    return () => void rig.wrench.removeFromParent();
  }, [rig]);

  const spawn = (
    x: number,
    y: number,
    vx: number,
    vy: number,
    life: number,
    size: number,
    color: string,
  ) => {
    const p = rig.particles.find((q) => q.life <= 0);
    if (!p) return;
    p.mesh.position.set(x, y, 60);
    p.v.set(vx, vy);
    p.life = p.max = life;
    p.size = size;
    (p.mesh.material as THREE.MeshBasicMaterial).color.set(color);
    p.mesh.visible = true;
  };

  // Turn `bone` so that its `child` lies in the direction of rig.t (world space).
  const aim = (bone: THREE.Object3D, child: THREE.Object3D) => {
    bone.getWorldPosition(rig.v);
    rig.d.copy(rig.t).sub(rig.v).normalize();
    bone.parent!.getWorldQuaternion(rig.q).invert();
    rig.d.applyQuaternion(rig.q);
    bone.quaternion.setFromUnitVectors(rig.w.copy(child.position).normalize(), rig.d);
  };

  useFrame((_, dt) => {
    const g = root.current;
    const b = body.current;
    if (!g || !b) return;
    if (!s.durations.Idle)
      animations.forEach((c) => (s.durations[c.name] = c.duration));

    // animation clips: crossfade to the requested one; one-shots hold their last frame
    if (s.clipKey !== played.current.key) {
      const next = actions[s.clip];
      const prev = actions[played.current.name];
      if (next) {
        if (prev && prev !== next) prev.fadeOut(0.25);
        next.reset();
        next.timeScale = s.timeScale;
        next.setLoop(
          ONE_SHOT.has(s.clip) ? THREE.LoopOnce : THREE.LoopRepeat,
          Infinity,
        );
        next.clampWhenFinished = true;
        next
          .setEffectiveWeight(1)
          .fadeIn(prev === next ? 0.05 : 0.25)
          .play();
      }
      played.current = { key: s.clipKey, name: s.clip };
    }

    // walk/run toward the target
    const dx = s.tx - s.x;
    const dy = s.ty - s.y;
    const d = Math.hypot(dx, dy);
    if (d > 0.5) {
      const step = Math.min(d, s.speed * dt);
      s.x += (dx / d) * step;
      s.y += (dy / d) * step;
    }
    let yaw = s.facing;
    if (s.autoFace && d > 3)
      yaw =
        Math.abs(dx) > Math.abs(dy)
          ? (Math.sign(dx) * Math.PI) / 2
          : dy > 0
            ? 0
            : Math.PI;
    if (yawG.current)
      yawG.current.rotation.y = turn(
        yawG.current.rotation.y,
        yaw,
        1 - Math.exp(-10 * dt),
      );
    g.rotation.z = damp(g.rotation.z, -s.lean, 6, dt); // lean back against the rope

    vis.current = damp(vis.current, s.shown ? 1 : 0, 6, dt);
    const size = Math.max(s.height * s.pop * vis.current, 0.001);
    const [wx, wy] = toWorld(s.x, screenGround(s.y, s.height));
    g.position.set(wx, wy, 0);
    g.visible = vis.current > 0.01;
    b.scale.setScalar(size * rig.unit);
    b.position.y = rig.lift * size;

    // speech bubble above the head
    const el = bubble.current;
    if (el) {
      if (s.say && el.textContent !== s.say) el.textContent = s.say;
      el.style.opacity = s.say && g.visible ? "1" : "0";
      el.style.transform = `translate(${Math.min(s.x + size * 0.2, window.innerWidth - el.offsetWidth - 8)}px, ${screenGround(s.y, s.height) - size - 8}px) translateY(-100%)`;
    }

    // face: strain, surprise, sadness
    if (rig.face?.morphTargetDictionary && rig.face.morphTargetInfluences) {
      for (const k of ["Angry", "Surprised", "Sad"] as const) {
        const i = rig.face.morphTargetDictionary[k];
        if (i !== undefined)
          rig.face.morphTargetInfluences[i] = damp(
            rig.face.morphTargetInfluences[i],
            s.mood[k],
            5,
            dt,
          );
      }
    }

    // mechanic tools
    const k = size / 170;
    rig.wrench.visible = s.tools;
    rig.belt.visible = s.tools;
    if (s.tools && rig.handR) {
      rig.handR.getWorldScale(rig.v);
      rig.wrench.scale.setScalar(k / rig.v.x);
      rig.belt.position.y = 0.33 * size;
      rig.belt.scale.setScalar(k);
    }

    // ground shadow
    rig.shadow.visible = g.visible;
    rig.shadow.position.set(wx, wy + 1, -60);
    rig.shadow.scale.set(0.28 * size, 0.05 * size, 1);

    // rope from the hands to the content edge
    rig.rope.visible = !!s.rope && g.visible;
    slack.current = damp(slack.current, s.slack, 7, dt);
    if (s.rope && rig.hands[0] && rig.hands[1]) {
      // grip: both arms reach along the rope (this overrides the clip's arm pose, which the mixer re-applies every frame)
      const [tx, ty] = toWorld(s.rope.x, s.rope.y - window.scrollY);
      rig.t.set(tx, ty, 0);
      for (const [upper, lower, palm] of rig.arms) {
        if (!upper || !lower || !palm) continue;
        aim(upper, lower);
        aim(lower, palm);
      }
      rig.hands[0].getWorldPosition(rig.v);
      rig.hands[1].getWorldPosition(rig.w);
      rig.v.add(rig.w).multiplyScalar(0.5);
      const [ex, ey] = toWorld(s.rope.x, s.rope.y - window.scrollY);
      const sag = 6 + slack.current * 34;
      const at = (t: number) =>
        [
          ex + (rig.v.x - ex) * t,
          ey + (rig.v.y - ey) * t - sag * 4 * t * (1 - t),
        ] as const;
      rig.segments.forEach((m, i) => {
        const [ax, ay] = at(i / ROPE_SEGMENTS);
        const [bx, by] = at((i + 1) / ROPE_SEGMENTS);
        m.position.set((ax + bx) / 2, (ay + by) / 2, 30);
        m.scale.x = Math.hypot(bx - ax, by - ay) + 1;
        m.rotation.z = Math.atan2(by - ay, bx - ax);
      });
      rig.hook.position.set(ex, ey, 30);
    }

    // sweat while straining (skipped on phones), sparks when hammering
    sweatClock.current -= dt;
    if (s.sweat && !s.mobile && rig.head && sweatClock.current <= 0) {
      sweatClock.current = 0.15;
      rig.head.getWorldPosition(rig.v);
      spawn(
        rig.v.x + (Math.random() - 0.5) * 30,
        rig.v.y + 15,
        (Math.random() - 0.5) * 90,
        60 + Math.random() * 70,
        0.7,
        3,
        "#7dd3fc",
      );
    }
    if (s.spark.key !== lastSpark.current) {
      lastSpark.current = s.spark.key;
      // spark.y is given relative to the robot's ground, which may be held inside the viewport
      const [sx, sy] = toWorld(
        s.spark.x,
        screenGround(s.y, s.height) - (s.y - s.spark.y),
      );
      for (let i = 0; i < 7; i++)
        spawn(
          sx,
          sy,
          (Math.random() - 0.5) * 320,
          60 + Math.random() * 200,
          0.35,
          2.2,
          "#fbbf24",
        );
    }
    for (const p of rig.particles) {
      if (p.life <= 0) continue;
      p.life -= dt;
      p.v.y -= 600 * dt;
      p.mesh.position.x += p.v.x * dt;
      p.mesh.position.y += p.v.y * dt;
      p.mesh.scale.setScalar(Math.max(p.size * (p.life / p.max), 0.001));
      p.mesh.visible = p.life > 0;
    }
  });

  return (
    <>
      <group ref={root}>
        <group ref={yawG}>
          <group ref={body}>
            <primitive object={scene} />
          </group>
          <primitive object={rig.belt} />
        </group>
      </group>
      <primitive object={rig.fx} />
    </>
  );
}

// A desk with a laptop and a stool: where the robot sits down to work. Sized for a 170px robot, scaled with it.
function Desk({ s }: { s: RobotStore }) {
  const toWorld = useToWorld();
  const kit = useMemo(() => {
    const group = new THREE.Group();
    group.rotation.y = -0.5; // three-quarter view
    const wood = new THREE.MeshStandardMaterial({
      color: "#2a2f45",
      roughness: 0.6,
    });
    const metal = new THREE.MeshStandardMaterial({
      color: "#94a3b8",
      metalness: 0.7,
      roughness: 0.35,
    });
    const screen = new THREE.MeshStandardMaterial({
      color: "#0b0d14",
      emissive: "#22d3ee",
      emissiveIntensity: 0,
    });
    const box = (
      w: number,
      h: number,
      d: number,
      mat: THREE.Material,
      x: number,
      y: number,
      z = 0,
    ) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
      m.position.set(x, y, z);
      group.add(m);
      return m;
    };
    box(96, 5, 54, wood, 0, 64); // top
    box(4, 62, 48, metal, -42, 31);
    box(4, 62, 48, metal, 42, 31);
    box(36, 2, 24, metal, -8, 68); // laptop
    box(2, 24, 34, screen, 10, 80).rotation.z = -0.25;
    box(30, 30, 30, wood, -84, 15); // stool
    return { group, screen };
  }, []);
  const vis = useRef(0);
  useFrame(({ clock }, dt) => {
    const d = s.desk;
    vis.current = damp(vis.current, d.visible ? 1 : 0, 6, dt);
    kit.group.visible = vis.current > 0.01;
    kit.group.scale.setScalar(Math.max((vis.current * s.height) / 170, 0.001));
    const [wx, wy] = toWorld(d.x, screenGround(d.y, s.height));
    kit.group.position.set(wx, wy, -40);
    // the screen flickers while the robot types
    kit.screen.emissiveIntensity = damp(
      kit.screen.emissiveIntensity,
      d.on ? 0.9 + 0.5 * Math.sin(clock.elapsedTime * 22) : 0,
      8,
      dt,
    );
  });
  return <primitive object={kit.group} />;
}

export default function RobotScene({
  store,
  mobile,
}: {
  store: RobotStore;
  mobile: boolean;
}) {
  const bubble = useRef<HTMLDivElement>(null);
  return (
    <>
      {/* r3f makes its canvas clickable by default, which swallowed every click on the page */}
      <Canvas
        style={{ pointerEvents: "none" }}
        orthographic
        camera={{ position: [0, 0, 600], zoom: 1, near: 1, far: 2000 }}
        dpr={mobile ? 1 : [1, 1.5]}
        gl={{ alpha: true, antialias: true }}
      >
        <hemisphereLight args={["#ffffff", "#334155", 1.8]} />
        <directionalLight position={[300, 500, 600]} intensity={2.4} />
        <Suspense fallback={null}>
          <Robot s={store} bubble={bubble} />
          <Desk s={store} />
        </Suspense>
      </Canvas>
      {/* what the robot is saying, kept above its head by the scene */}
      <div
        ref={bubble}
        className="absolute left-0 top-0 whitespace-nowrap rounded-2xl rounded-bl-sm border border-border bg-surface px-3 py-1.5 text-sm font-medium text-fg opacity-0 shadow-lg transition-opacity duration-200"
      />
    </>
  );
}

useGLTF.preload(MODEL);
