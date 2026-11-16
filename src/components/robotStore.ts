// Shared, mutable state: the scroll director (Companion) writes it, the 3D scene reads it every frame.
// Positions are CSS pixels: x relative to the viewport, y relative to the document (so they scroll with the page).

export type Mood = { Angry: number; Surprised: number; Sad: number };

export type RobotStore = {
  shown: boolean;
  mobile: boolean;
  height: number; // robot height in px
  x: number; // current feet position
  y: number;
  tx: number; // target feet position
  ty: number;
  speed: number; // px per second toward the target
  autoFace: boolean; // face the walking direction instead of `facing`
  facing: number; // yaw in radians: 0 faces the visitor, -π/2 faces the content on the left
  pop: number; // 0..1 size while emerging from the content
  clip: string;
  clipKey: number; // bump to (re)start `clip`
  timeScale: number;
  mood: Mood;
  tools: boolean;
  sweat: boolean;
  lean: number; // radians the body leans back (to the right) while hauling
  slack: number; // 0 = rope pulled taut, 1 = hanging slack
  rope: { x: number; y: number } | null; // where the rope is tied to the content
  say: string | null; // speech bubble above the head
  desk: { x: number; y: number; visible: boolean; on: boolean }; // on = laptop screen lit
  spark: { x: number; y: number; key: number };
  durations: Record<string, number>; // clip lengths in seconds, filled once the model loads
};

export const createStore = (): RobotStore => ({
  shown: false,
  mobile: false,
  height: 170,
  x: 0,
  y: 0,
  tx: 0,
  ty: 0,
  speed: Infinity,
  autoFace: false,
  facing: 0,
  pop: 1,
  clip: "Idle",
  clipKey: 0,
  timeScale: 1,
  mood: { Angry: 0, Surprised: 0, Sad: 0 },
  tools: false,
  sweat: false,
  lean: 0,
  slack: 0,
  rope: null,
  say: null,
  desk: { x: 0, y: 0, visible: false, on: false },
  spark: { x: 0, y: 0, key: 0 },
  durations: {},
});

// Screen y of the ground under the robot, kept inside the viewport so the robot never leaves the screen.
export const screenGround = (docY: number, height: number) =>
  Math.min(Math.max(docY - window.scrollY, height + 80), window.innerHeight - 12);

// Set once the hero name is up, so a robot that loads late doesn't pretend to hoist a name that is already hanging.
export const hoist = { up: false };
