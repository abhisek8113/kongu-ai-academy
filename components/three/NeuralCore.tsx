"use client";
// Kongu AI Academy — procedural "AI intelligence core".
// Everything is generated in code: no external models, textures or paid assets.
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const BLUE = new THREE.Color("#386BFF");
const CYAN = new THREE.Color("#00D4FF");
const GOLD = new THREE.Color("#D6B46A");

/** Deterministic pseudo-random so the network looks the same on every load. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}

function buildNetwork(count: number) {
  const rand = rng(7);
  const pts: THREE.Vector3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const t = golden * i;
    const radius = 1.55 + (rand() - 0.5) * 0.22;
    pts.push(new THREE.Vector3(Math.cos(t) * r * radius, y * radius, Math.sin(t) * r * radius));
  }
  // connect each node to its nearest neighbours
  const segs: [number, number][] = [];
  const maxD = 0.36;
  for (let i = 0; i < count; i++) {
    let linked = 0;
    for (let j = i + 1; j < count && linked < 3; j++) {
      if (pts[i].distanceTo(pts[j]) < maxD) { segs.push([i, j]); linked++; }
    }
  }
  const nodePos = new Float32Array(count * 3);
  const nodeCol = new Float32Array(count * 3);
  pts.forEach((p, i) => {
    nodePos.set([p.x, p.y, p.z], i * 3);
    const c = BLUE.clone().lerp(CYAN, (p.y + 1.6) / 3.2);
    if (rand() > 0.96) c.copy(GOLD);
    nodeCol.set([c.r, c.g, c.b], i * 3);
  });
  const linePos = new Float32Array(segs.length * 6);
  segs.forEach(([a, b], k) => {
    linePos.set([pts[a].x, pts[a].y, pts[a].z, pts[b].x, pts[b].y, pts[b].z], k * 6);
  });
  return { pts, segs, nodePos, nodeCol, linePos };
}

function makeDotTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d")!;
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.25, "rgba(255,255,255,.85)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Glowing inner core: fresnel shader sphere + wireframe icosahedron. */
function Core() {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 }, uA: { value: BLUE }, uB: { value: CYAN } },
        vertexShader: `varying vec3 vN; varying vec3 vV; uniform float uTime;
          void main(){ vN = normalize(normalMatrix * normal);
            vec3 p = position * (1.0 + 0.025 * sin(uTime*1.6 + position.y*6.0));
            vec4 mv = modelViewMatrix * vec4(p,1.0); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
        fragmentShader: `varying vec3 vN; varying vec3 vV; uniform vec3 uA; uniform vec3 uB; uniform float uTime;
          void main(){ float f = pow(1.0 - max(dot(vN, vV), 0.0), 2.2);
            vec3 c = mix(uA, uB, f); float pulse = 0.75 + 0.25 * sin(uTime*2.0);
            gl_FragColor = vec4(c, (0.12 + f * 0.9) * pulse); }`,
      }),
    []
  );
  const ico = useRef<THREE.LineSegments>(null);
  useFrame((s, dt) => {
    mat.uniforms.uTime.value = s.clock.elapsedTime;
    if (ico.current) { ico.current.rotation.y += dt * 0.25; ico.current.rotation.x += dt * 0.1; }
  });
  const edges = useMemo(() => new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(0.62, 1)), []);
  useEffect(() => () => { mat.dispose(); edges.dispose(); }, [mat, edges]);
  return (
    <group>
      <mesh material={mat}><sphereGeometry args={[0.55, 64, 64]} /></mesh>
      <lineSegments ref={ico} geometry={edges}>
        <lineBasicMaterial color="#9DB6FF" transparent opacity={0.35} />
      </lineSegments>
      <pointLight color="#386BFF" intensity={6} distance={6} />
    </group>
  );
}

/** Orbital rings, tilted, slowly rotating. */
function Rings() {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => { if (g.current) g.current.rotation.z += dt * 0.05; });
  const rings: [number, number, number, string, number][] = [
    [2.05, 1.25, 0.2, "#386BFF", 0.35],
    [2.35, -0.55, 0.9, "#00D4FF", 0.22],
    [2.7, 0.4, -0.7, "#D6B46A", 0.28],
  ];
  return (
    <group ref={g}>
      {rings.map(([r, rx, ry, c, o], i) => (
        <mesh key={i} rotation={[rx, ry, 0]}>
          <torusGeometry args={[r, 0.004, 8, 220]} />
          <meshBasicMaterial color={c} transparent opacity={o} />
        </mesh>
      ))}
    </group>
  );
}

/** The neural network shell: nodes, links and travelling data pulses. */
function Network({ count, pulses }: { count: number; pulses: number }) {
  const net = useMemo(() => buildNetwork(count), [count]);
  const dot = useMemo(() => makeDotTexture(), []);
  const pulseRef = useRef<THREE.Points>(null);
  const pulseState = useMemo(() => {
    const r = rng(42);
    return Array.from({ length: pulses }, () => ({ seg: Math.floor(r() * net.segs.length), t: r(), speed: 0.35 + r() * 0.8 }));
  }, [pulses, net.segs.length]);
  const pulsePos = useMemo(() => new Float32Array(pulses * 3), [pulses]);

  useFrame((_, dt) => {
    const arr = pulsePos;
    pulseState.forEach((p, i) => {
      p.t += dt * p.speed;
      if (p.t >= 1) { p.t = 0; p.seg = (p.seg * 7 + 13) % net.segs.length; }
      const [a, b] = net.segs[p.seg];
      const A = net.pts[a], B = net.pts[b];
      arr[i * 3] = A.x + (B.x - A.x) * p.t;
      arr[i * 3 + 1] = A.y + (B.y - A.y) * p.t;
      arr[i * 3 + 2] = A.z + (B.z - A.z) * p.t;
    });
    if (pulseRef.current) (pulseRef.current.geometry.attributes.position as THREE.BufferAttribute).needsUpdate = true;
  });
  useEffect(() => () => dot.dispose(), [dot]);

  return (
    <group>
      <lineSegments>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[net.linePos, 3]} /></bufferGeometry>
        <lineBasicMaterial color="#5B86FF" transparent opacity={0.16} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[net.nodePos, 3]} />
          <bufferAttribute attach="attributes-color" args={[net.nodeCol, 3]} />
        </bufferGeometry>
        <pointsMaterial size={0.055} map={dot} vertexColors transparent depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
      </points>
      <points ref={pulseRef}>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[pulsePos, 3]} /></bufferGeometry>
        <pointsMaterial size={0.09} map={dot} color="#BFF4FF" transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
    </group>
  );
}

/** Far, slowly drifting particles for depth. */
function Dust({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null);
  const dot = useMemo(() => makeDotTexture(), []);
  const pos = useMemo(() => {
    const r = rng(99), a = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const rad = 4 + r() * 8, th = r() * Math.PI * 2, ph = Math.acos(2 * r() - 1);
      a.set([rad * Math.sin(ph) * Math.cos(th), rad * Math.cos(ph) * 0.6, rad * Math.sin(ph) * Math.sin(th) - 2], i * 3);
    }
    return a;
  }, [count]);
  useFrame((_, dt) => { if (ref.current) ref.current.rotation.y += dt * 0.012; });
  useEffect(() => () => dot.dispose(), [dot]);
  return (
    <points ref={ref}>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[pos, 3]} /></bufferGeometry>
      <pointsMaterial size={0.035} map={dot} color="#A7B0C3" transparent opacity={0.55} depthWrite={false} />
    </points>
  );
}

/** Mouse + scroll response: the whole rig turns toward the cursor and recedes on scroll. */
function Rig({ children, still }: { children: React.ReactNode; still: boolean }) {
  const g = useRef<THREE.Group>(null);
  const { camera } = useThree();
  const pointer = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
  useFrame((_, dt) => {
    if (!g.current) return;
    if (!still) g.current.rotation.y += dt * 0.08;
    const tx = pointer.current.y * 0.25, tz = -pointer.current.x * 0.12;
    g.current.rotation.x += (tx - g.current.rotation.x) * 0.04;
    g.current.rotation.z += (tz - g.current.rotation.z) * 0.04;
    const scroll = Math.min(1, window.scrollY / window.innerHeight);
    camera.position.z += (6 + scroll * 2.2 - camera.position.z) * 0.06;
    camera.position.x += (pointer.current.x * 0.35 - camera.position.x) * 0.03;
    camera.lookAt(0, 0, 0);
  });
  return <group ref={g}>{children}</group>;
}

export default function NeuralCore() {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [mobile, setMobile] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setMobile(window.matchMedia("(max-width: 768px)").matches);
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0 });
    if (host.current) io.observe(host.current);
    const onVis = () => setVisible(document.visibilityState === "visible");
    document.addEventListener("visibilitychange", onVis);
    return () => { io.disconnect(); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  return (
    <div ref={host} className="absolute inset-0" aria-hidden="true">
      <Canvas
        dpr={[1, mobile ? 1.5 : 1.8]}
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        frameloop={visible && !reduced ? "always" : "demand"}
      >
        <Rig still={reduced}>
          <Core />
          <Network count={mobile ? 420 : 1100} pulses={mobile ? 24 : 70} />
          <Rings />
        </Rig>
        <Dust count={mobile ? 250 : 700} />
      </Canvas>
    </div>
  );
}
