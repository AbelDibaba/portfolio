"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { animate, useReducedMotion, type AnimationPlaybackControls, type Easing } from "motion/react";
import { createStore, hoist, type RobotStore } from "./robotStore";

// three.js is heavy: load it in the browser only, after the page is up.
const RobotScene = dynamic(() => import("./RobotScene"), { ssr: false });

type Kind = "about" | "work" | "contact" | "guide" | "mechanic";
const isRow = (k: Kind) => k === "guide" || k === "mechanic";
// One stop for the robot: a content block (or a row of cards) and the stage beside it.
type Target = { kind: Kind; blocks: HTMLElement[]; stage: HTMLElement };

class Cancelled extends Error {}

// Four heavy tugs: each pulls, then strains in place for a moment.
const TUGS = 4;
const tug = (p: number) => {
  const i = Math.min(TUGS - 1, Math.floor(p * TUGS));
  const t = Math.min(1, (p * TUGS - i) / 0.7);
  return (i + t * t * (3 - 2 * t)) / TUGS;
};
if (process.env.NODE_ENV !== "production") {
  console.assert(tug(0) === 0 && tug(1) === 1 && tug(0.3) <= tug(0.6), "Companion: tug() is off");
}

// ---- DOM states of a block: "pre" before the robot hauls it in, "final" after (also the no-JS look) ----

// q = 0: parked off the left edge of the screen; q = 1: in place.
const setPull = (b: HTMLElement, q: number, off: number) => {
  b.style.transform = q >= 1 ? "" : `translateX(${-off * (1 - q)}px)`;
};
const setNeedle = (card: HTMLElement, deg: number) => {
  const n = card.querySelector<SVGElement>("[data-needle]");
  if (n) n.style.transform = `rotate(${deg}deg)`;
};
const parts = (card: HTMLElement) => ({
  chips: [...card.querySelectorAll<HTMLElement>("[data-chip]")],
  badge: card.querySelector<HTMLElement>("[data-badge]"),
  sheen: card.querySelector<HTMLElement>("[data-sheen]"),
});

function pre(t: Target) {
  for (const b of t.blocks) {
    b.style.transform = "translateX(-120vw)";
    if (t.kind !== "mechanic") continue;
    const { chips, badge } = parts(b);
    chips.forEach((c, i) => (c.style.transform = `rotate(${i % 2 ? -5 : 4}deg) translateY(2px)`)); // loose bolts
    if (badge) badge.style.opacity = "0";
    setNeedle(b, -80);
  }
}

function final(t: Target) {
  for (const b of t.blocks) {
    delete b.dataset.presenting;
    b.style.transform = "";
    if (t.kind !== "mechanic") continue;
    const { chips, badge, sheen } = parts(b);
    chips.forEach((c) => {
      c.style.transform = "";
      const bolt = c.querySelector<SVGElement>("[data-bolt]");
      if (bolt) bolt.style.transform = "rotate(180deg)";
    });
    if (badge) badge.style.opacity = "";
    if (sheen) sheen.style.transform = "translateX(-100%)";
    setNeedle(b, 55);
  }
}

function collect(mobile: boolean): Target[] {
  const out: Target[] = [];
  document.querySelectorAll<HTMLElement>("section[id]").forEach((sec) => {
    const stage = sec.querySelector<HTMLElement>("[data-stage]");
    const blocks = [...sec.querySelectorAll<HTMLElement>("[data-block]")];
    if (!stage || !blocks.length) return;
    const kind = blocks[0].dataset.block as Kind;
    // phones: the stage is a strip above the section, so the robot works on the section's first block only
    if (mobile) return void out.push({ kind, blocks: [blocks[0]], stage });
    if (!isRow(kind)) return blocks.forEach((b) => out.push({ kind, blocks: [b], stage }));
    // cards side by side are hauled in as one row
    let row: HTMLElement[] = [];
    for (const b of blocks) {
      if (row.length && Math.abs(b.getBoundingClientRect().top - row[0].getBoundingClientRect().top) > 20) {
        out.push({ kind, blocks: row, stage });
        row = [];
      }
      row.push(b);
    }
    out.push({ kind, blocks: row, stage });
  });
  return out;
}

// The block the visitor is reading: the last one whose top has passed 55% of the screen and is still on screen.
function pick(targets: Target[], mobile: boolean) {
  const line = innerHeight * 0.55;
  let best: Target | null = null;
  for (const t of targets) {
    const top = (mobile ? t.stage : t.blocks[0]).getBoundingClientRect().top;
    const bottom = Math.max(...t.blocks.map((b) => b.getBoundingClientRect().bottom));
    if (top < line && bottom > innerHeight * 0.12) best = t;
  }
  return best;
}

// Where things go on a target's stage, in px (x: viewport, y: document).
function layout(t: Target, s: RobotStore, mobile: boolean) {
  const st = t.stage.getBoundingClientRect();
  const sy = scrollY;
  const rects = t.blocks.map((b) => b.getBoundingClientRect());
  const top = Math.min(...rects.map((r) => r.top)) + sy;
  const bottom = Math.max(...rects.map((r) => r.bottom)) + sy;
  const mid = (top + bottom) / 2;
  const ground = mobile
    ? st.bottom + sy - 6
    : Math.min(Math.max(mid + s.height / 2, st.top + sy + s.height + 10), st.bottom + sy - 10);
  const right = st.left - 24; // right edge of the content column, where the rope hooks on
  return {
    ground,
    mid,
    right,
    off: mobile ? innerWidth + 20 : right + 60, // how far left the content is parked: fully off-screen
    spot: st.left + (mobile ? 0.4 : 0.35) * st.width, // where the robot ends up
    desk: st.left + (mobile ? 0.8 : 0.72) * st.width,
  };
}

// One robot per page; the scene reads this object every frame, so it lives outside React state.
const store = createStore();

// The portfolio's main character: a 3D robot that hauls each content block onto the screen as the visitor scrolls.
export function Companion() {
  const reduce = useReducedMotion();
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const mq = matchMedia("(max-width: 1023px)");
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (reduce) return;
    const s = store;
    s.mobile = mobile;
    s.height = mobile ? 100 : 170;
    let targets = collect(mobile);
    const done = new Set<HTMLElement>();
    const running = new Set<AnimationPlaybackControls>();
    let active: Target | null = null;
    let activeKey: HTMLElement | "hero" | "gap" | null = null;
    let hoisted = false;
    let token = 0;
    for (const t of targets) if (t.blocks[0].getBoundingClientRect().top > innerHeight) pre(t);

    // ---- helpers bound to one run; every await throws Cancelled once the visitor has moved on ----
    const helpers = (mine: number) => {
      const check = () => {
        if (mine !== token) throw new Cancelled();
      };
      const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms)).then(check);
      const tween = (ms: number, fn: (p: number) => void, ease: Easing = "easeInOut") => {
        check();
        // a stopped tween may emit one last frame: ignore frames from a cancelled run
        const c = animate(0, 1, { duration: ms / 1000, ease, onUpdate: (p) => mine === token && fn(p) });
        running.add(c);
        return c.then(() => {
          running.delete(c);
          check();
        });
      };
      const play = (clip: string, timeScale = 1) => {
        check();
        s.clip = clip;
        s.timeScale = timeScale;
        s.clipKey++;
        return ((s.durations[clip] ?? 1) * 1000) / Math.abs(timeScale);
      };
      const place = (x: number, y: number) => {
        s.x = s.tx = x;
        s.y = s.ty = y;
      };
      const travel = async (x: number, y: number, speed: number, clip: string) => {
        s.tx = x;
        s.ty = y;
        s.speed = speed;
        s.autoFace = true;
        play(clip);
        const t0 = performance.now();
        while (Math.hypot(s.x - x, s.y - y) > 3 && performance.now() - t0 < 3000) await wait(60);
        s.autoFace = false;
        place(x, y);
      };
      return { wait, tween, play, place, travel };
    };
    type H = ReturnType<typeof helpers>;
    type G = ReturnType<typeof layout>;
    const calm = { Angry: 0, Surprised: 0, Sad: 0 };

    const cheer = async (h: H) => {
      s.facing = 0;
      await h.wait(h.play("ThumbsUp"));
      s.facing = -0.4;
      h.play("Idle");
    };

    // Come in from the left edge, walking backwards, hauling the content onto the screen by a rope.
    const haul = async (t: Target, h: H, g: G, heavy: boolean) => {
      s.facing = -Math.PI / 2;
      h.place(g.spot - g.off, g.ground);
      s.shown = true;
      h.play("Walking", heavy ? -0.6 : -1.1);
      if (heavy) {
        s.mood = { ...calm, Angry: 1 };
        s.sweat = true;
      }
      await h.tween(
        heavy ? (mobile ? 2600 : 3800) : mobile ? 1500 : 2000,
        (p) => {
          const q = heavy ? tug(p) : p;
          h.place(g.spot - g.off * (1 - q), g.ground);
          t.blocks.forEach((b) => setPull(b, q, g.off));
          if (!mobile) s.rope = { x: g.right - g.off * (1 - q), y: g.mid };
          if (heavy) {
            const straining = (p * TUGS) % 1 > 0.7; // between tugs: rope goes slack, robot catches its breath
            s.slack = straining ? 1 : 0;
            s.lean = straining ? 0.04 : 0.24;
          }
        },
        heavy ? "linear" : "easeOut",
      );
      t.blocks.forEach((b) => setPull(b, 1, g.off));
      s.rope = null;
      s.sweat = false;
      s.lean = 0;
      s.slack = 0;
      s.mood = calm;
    };

    // ---- about: haul the heavy block in, catch its breath, then introduce Abel to the visitor ----
    const about = async (t: Target, h: H, g: G) => {
      await haul(t, h, g, true);
      s.sweat = true;
      s.facing = 0;
      h.play("Idle");
      await h.wait(700);
      s.sweat = false;
      s.say = "Hi there! 👋";
      await h.wait(h.play("Wave"));
      s.say = "Meet Abel";
      s.facing = -Math.PI / 2 + 0.35; // turned toward the text
      await h.wait(h.play("Yes") + 500);
      s.say = null;
      await cheer(h);
    };

    // ---- work: haul the job in, then sit down at the desk and ship something ----
    const work = async (t: Target, h: H, g: G) => {
      s.desk = { x: g.desk, y: g.ground, visible: true, on: false };
      await haul(t, h, g, true);
      await h.travel(g.desk - (84 * s.height) / 170, g.ground, 160, "Walking");
      s.facing = Math.PI / 2 - 0.5; // facing the laptop
      await h.wait(h.play("Sitting"));
      s.desk.on = true;
      for (const line of ["coding…", "testing…", "shipped ✓"]) {
        s.say = line;
        await h.wait(1000);
      }
      s.desk.on = false;
      s.say = null;
      await h.wait(h.play("Standing"));
      await cheer(h);
    };

    // ---- contact: bring the invitation in, call the visitor over, celebrate the end of the tour ----
    const contact = async (t: Target, h: H, g: G) => {
      await haul(t, h, g, false);
      s.facing = 0;
      await h.wait(h.play("Jump"));
      s.say = "Let's talk! ✉️";
      await h.wait(h.play("Wave"));
      h.play("Dance");
      await h.wait(2600);
      s.say = null;
      await cheer(h);
    };

    // ---- tour guide: wheel the row of projects in, then present each one ----
    const guide = async (t: Target, h: H, g: G) => {
      await haul(t, h, g, false);
      for (const [i, card] of t.blocks.entries()) {
        t.blocks.forEach((c) => delete c.dataset.presenting);
        card.dataset.presenting = "";
        s.facing = -Math.PI / 2 + 0.35; // turned toward the cards, still facing the visitor a little
        await h.wait(h.play(i === 0 ? "Wave" : "Yes")); // "come this way" … "look at this"
      }
      t.blocks.forEach((c) => delete c.dataset.presenting);
      await cheer(h);
    };

    // ---- mechanic: bring the skill cards in, then read each gauge, tighten every bolt, wipe off the oil ----
    const mechanic = async (t: Target, h: H, g: G) => {
      s.tools = true;
      await haul(t, h, g, false);
      for (const card of t.blocks) {
        const { chips, badge, sheen } = parts(card);
        if (!mobile) {
          // walk over to the card and work at its corner, small enough to fit in the gap between cards
          const r = card.getBoundingClientRect();
          await Promise.all([
            h.travel(r.right + 12, r.bottom + scrollY - 8, 480, "Running"),
            h.tween(300, (p) => (s.pop = Math.min(s.pop, 1 - 0.4 * p))),
          ]);
        }
        s.facing = -Math.PI / 2 + 0.3;
        h.play("No", 1.2); // squints at the gauge: too low
        await h.tween(1000, (p) => setNeedle(card, -80 + 40 * p + 12 * Math.sin(p * 18) * (1 - p)), "linear");
        for (const chip of chips) {
          h.play("Punch", 1.8);
          await h.wait(180);
          chip.style.transform = "";
          const bolt = chip.querySelector<SVGElement>("[data-bolt]");
          if (bolt) bolt.style.transform = "rotate(180deg)";
          if (!mobile) {
            const c = chip.getBoundingClientRect(); // sparks fly off the bolt being tightened
            s.spark = { x: c.left + 14, y: c.top + c.height / 2 + scrollY, key: s.spark.key + 1 };
          }
          await h.wait(200);
        }
        h.play("Wave", 1.3); // wipe
        if (sheen) await h.tween(800, (p) => (sheen.style.transform = `translateX(${-100 + 200 * p}%)`));
        await h.tween(450, (p) => setNeedle(card, -40 + 95 * p), "backOut");
        if (badge) badge.style.opacity = "";
      }
      if (!mobile) {
        await Promise.all([h.travel(g.spot, g.ground, 480, "Running"), h.tween(300, (p) => (s.pop = 0.6 + 0.4 * p))]);
      }
      await cheer(h);
    };

    // ---- hero: hoist the name up by a rope that runs off the top of the screen, and keep holding it ----
    const hero = async (mine: number) => {
      const h = helpers(mine);
      const x = innerWidth * (mobile ? 0.84 : 0.8);
      const ground = innerHeight * (mobile ? 0.97 : 0.82);
      const ring = { x: x - (mobile ? 40 : 70), y: -40 }; // off the top of the screen, where the letters' ropes go too
      try {
        do await h.wait(100);
        while (!s.durations.Idle); // until the model has loaded
        if (hoisted || hoist.up) {
          // back at the top (or the name went up without waiting): come over and take the rope
          hoisted = true;
          if (!s.shown) h.place(innerWidth + 120, ground);
          s.shown = true;
          await h.travel(x, ground, 700, "Running");
          s.facing = -Math.PI / 2;
          s.rope = ring;
        } else {
          hoisted = true;
          s.facing = -Math.PI / 2;
          h.place(x - 70, ground);
          s.shown = true;
          await h.wait(250);
          s.rope = ring;
          s.lean = 0.24;
          s.mood = { ...calm, Angry: 1 };
          h.play("Walking", -1);
          dispatchEvent(new Event("hoist"));
          await h.tween(1300, (p) => h.place(x - 70 + 70 * p, ground), "easeOut");
          s.mood = calm;
        }
        s.say = "Welcome! 👋";
        if (mobile) {
          // narrow screens: a held rope would cross the text, so tie it off and wave instead
          s.rope = null;
          s.lean = 0;
          s.facing = 0;
          await h.wait(h.play("Wave") + 500);
          s.facing = -0.4;
          h.play("Idle");
        } else {
          // holds the name up until the visitor scrolls
          s.lean = 0.1;
          h.play("Idle");
          await h.wait(1800);
        }
        s.say = null;
      } catch (e) {
        if (!(e instanceof Cancelled)) throw e;
      }
    };

    // Between the hero and the first section: let go of the rope and run off the right edge.
    const leave = async (mine: number) => {
      const h = helpers(mine);
      try {
        if (s.shown) await h.travel(innerWidth + 160, s.y, 950, "Running");
        s.shown = false;
      } catch (e) {
        if (!(e instanceof Cancelled)) throw e;
      }
    };

    const run = async (t: Target, mine: number) => {
      const h = helpers(mine);
      const g = layout(t, s, mobile);
      try {
        if (done.has(t.blocks[0])) {
          // already delivered: just jog over and say hi
          if (!s.shown) h.place(innerWidth + 120, g.ground);
          s.shown = true;
          s.tools = t.kind === "mechanic";
          await h.travel(g.spot, g.ground, 700, "Running");
          await cheer(h);
          return;
        }
        // run off the right edge, then come back in from the left with the next block in tow
        if (s.shown) await h.travel(innerWidth + 160, s.y, 950, "Running");
        await { about, work, contact, guide, mechanic }[t.kind](t, h, g);
        done.add(t.blocks[0]);
      } catch (e) {
        if (!(e instanceof Cancelled)) throw e;
      }
    };

    // Drop whatever the robot was doing and leave the content in its finished state.
    const settle = (t: Target) => {
      final(t);
      done.add(t.blocks[0]);
    };
    const reset = () => {
      running.forEach((c) => c.stop());
      running.clear();
      s.rope = null;
      s.sweat = false;
      s.lean = 0;
      s.slack = 0;
      s.pop = 1;
      s.tools = false;
      s.autoFace = false;
      s.mood = calm;
      s.say = null;
      s.desk = { ...s.desk, visible: false, on: false };
    };

    const update = () => {
      const atTop = scrollY <= 60; // the same point where the name's ropes are cut
      const next = atTop ? null : pick(targets, mobile);
      if (next) {
        // anything scrolled past without its scene is shown finished, never stuck half-way
        for (const t of targets) {
          if (t === next) break;
          if (!done.has(t.blocks[0])) settle(t);
        }
      }
      const key = next?.blocks[0] ?? (atTop ? "hero" : "gap");
      if (key === activeKey) return;
      token++;
      if (active) settle(active);
      reset();
      active = next;
      activeKey = key;
      if (next) void run(next, token);
      else if (atTop) void hero(token);
      else void leave(token);
    };

    let raf = 0;
    const onScroll = () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          update();
        });
    };
    const onResize = () => {
      token++;
      if (active) settle(active);
      reset();
      active = null;
      activeKey = null;
      targets = collect(mobile);
      update();
    };
    addEventListener("scroll", onScroll, { passive: true });
    addEventListener("resize", onResize);
    update();
    return () => {
      token++;
      reset();
      cancelAnimationFrame(raf);
      removeEventListener("scroll", onScroll);
      removeEventListener("resize", onResize);
      targets.forEach(final);
      s.shown = false;
    };
  }, [mobile, reduce]);

  if (reduce) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-30">
      <RobotScene store={store} mobile={mobile} />
    </div>
  );
}
