// ============================================================
// ReactBits-style animated components (implementasi sendiri,
// terinspirasi reactbits.dev) — framer-motion + CSS.
// ============================================================
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";

/* ---------- AnimatedContent: fade/slide/blur saat masuk viewport ---------- */
export function AnimatedContent({
  children,
  distance = 26,
  delay = 0,
  y = 1,
  opacity = true,
  blur = true,
  className,
  style,
}: {
  children: ReactNode;
  distance?: number;
  delay?: number;
  y?: number;
  opacity?: boolean;
  blur?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: opacity ? 0 : 1, y: y * distance, filter: blur ? "blur(8px)" : "none" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.65, 0.28, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ---------- SplitText: kata per kata dengan stagger ---------- */
export function SplitText({
  text,
  className,
  as: Tag = "h1",
  delay = 0,
  style,
}: {
  text: string;
  className?: string;
  as?: any;
  delay?: number;
  style?: CSSProperties;
}) {
  const words = text.split(" ");
  return (
    <Tag className={className} style={{ display: "inline-block", ...style }}>
      {words.map((w, i) => (
        <motion.span
          key={i}
          style={{ display: "inline-block", marginRight: "0.28em" }}
          initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: delay + i * 0.07, ease: [0.21, 0.65, 0.28, 1] }}
        >
          {w}
        </motion.span>
      ))}
    </Tag>
  );
}

/* ---------- GradientText ---------- */
export function GradientText({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={className} style={{ color: "var(--ink)" }}>
      {children}
    </span>
  );
}

/* ---------- ShinyText: kilau lembut ---------- */
export function ShinyText({ children }: { children: ReactNode }) {
  return (
    <span
      style={{
        backgroundImage: "linear-gradient(110deg, #a89a86 30%, #fff 50%, #a89a86 70%)",
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        animation: "shine 5s linear infinite",
      }}
    >
      {children}
      <style>{`@keyframes shine { to { background-position: -200% 0; } }`}</style>
    </span>
  );
}

/* ---------- TiltedCard: tilt mengikuti mouse ---------- */
export function TiltedCard({ children, className, max = 7 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 160, damping: 18 });
  const sry = useSpring(ry, { stiffness: 160, damping: 18 });
  const rotateX = useTransform(srx, (v) => `${v}deg`);
  const rotateY = useTransform(sry, (v) => `${v}deg`);

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * max * 2);
    rx.set(-py * max * 2);
  }
  function onLeave() {
    rx.set(0);
    ry.set(0);
  }

  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 900 }} className={className}>
      {children}
    </motion.div>
  );
}

/* ---------- SpotlightCard: sorotan mengikuti kursor ---------- */
export function SpotlightCard({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: -300, y: -300 });

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={className}
      style={{ position: "relative", overflow: "hidden", ...style }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: `radial-gradient(420px circle at ${pos.x}px ${pos.y}px, rgba(13,116,206,0.05), transparent 65%)`,
          opacity: 1,
          transition: "background 0.15s ease",
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}

/* ---------- NumberTicker: angka berjalan ---------- */
export function NumberTicker({ value, duration = 1.4, className }: { value: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf: number;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * value));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString("id-ID")}
    </span>
  );
}

/* ---------- Magnetic: tarikan magnetik lembut pada tombol ---------- */
export function Magnetic({ children, strength = 0.35 }: { children: ReactNode; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15 });
  const sy = useSpring(y, { stiffness: 200, damping: 15 });

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * strength);
    y.set((e.clientY - r.top - r.height / 2) * strength);
  }
  function onLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ x: sx, y: sy, display: "inline-block" }}>
      {children}
    </motion.div>
  );
}

/* ---------- FadeUp: stagger untuk daftar ---------- */
export function FadeUp({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay, ease: [0.21, 0.65, 0.28, 1] }}
    >
      {children}
    </motion.div>
  );
}
