"use client";
import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

const N = 6;
const COLORS = ["#386BFF", "#4A7BFF", "#2E9BFF", "#00B8FF", "#00D4FF", "#D6B46A"];

function useCurve() {
  return useMemo(() => {
    const pts = Array.from({ length: N }, (_, i) => {
      const t = i / (N - 1);
      return new THREE.Vector3(-4.2 + t * 8.4, Math.sin(t * Math.PI * 1.6) * 0.75, Math.cos(t * Math.PI) * 0.9);
    });
    return { pts, curve: new THREE.CatmullRomCurve3(pts) };
  }, []);
}

function Path({ active }: { active: number }) {
  const { curve } = useCurve();
  const tube = useMemo(() => new THREE.TubeGeometry(curve, 200, 0.018, 8, false), [curve]);
  const pulse = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    const target = active / (N - 1);
    t.current += (target - t.current) * Math.min(1, dt * 3);
    const wobble = (Math.sin(performance.now() / 600) + 1) * 0.004;
    if (pulse.current) pulse.current.position.copy(curve.getPointAt(Math.min(1, Math.max(0, t.current + wobble))));
  });
  useEffect(() => () => tube.dispose(), [tube]);
  return (
    <group>
      <mesh geometry={tube}><meshBasicMaterial color="#2A3560" /></mesh>
      <mesh ref={pulse}>
        <sphereGeometry args={[0.09, 24, 24]} />
        <meshBasicMaterial color="#BFF4FF" />
      </mesh>
    </group>
  );
}

function Node({ i, p, active, onSelect }: { i: number; p: THREE.Vector3; active: boolean; onSelect: (i: number) => void }) {
  const m = useRef<THREE.Mesh>(null);
  const ring = useRef<THREE.Mesh>(null);
  const [hover, setHover] = useState(false);
  useFrame((s, dt) => {
    if (!m.current) return;
    m.current.rotation.x += dt * 0.6;
    m.current.rotation.y += dt * 0.8;
    const target = active ? 1.45 : hover ? 1.2 : 1;
    m.current.scale.lerp(new THREE.Vector3(target, target, target), 0.12);
    if (ring.current) { ring.current.rotation.z += dt * 0.8; ring.current.visible = active; }
    m.current.position.y = p.y + Math.sin(s.clock.elapsedTime * 1.2 + i) * 0.06;
  });
  return (
    <group position={[p.x, 0, p.z]}>
      <mesh
        ref={m}
        position={[0, p.y, 0]}
        onClick={(e) => { e.stopPropagation(); onSelect(i); }}
        onPointerOver={(e) => { e.stopPropagation(); setHover(true); document.body.style.cursor = "pointer"; }}
        onPointerOut={() => { setHover(false); document.body.style.cursor = ""; }}
      >
        <icosahedronGeometry args={[0.32, 0]} />
        <meshStandardMaterial color={COLORS[i]} emissive={COLORS[i]} emissiveIntensity={active ? 1.1 : 0.45} metalness={0.3} roughness={0.25} flatShading />
      </mesh>
      <mesh ref={ring} position={[0, p.y, 0]}>
        <torusGeometry args={[0.62, 0.008, 8, 80]} />
        <meshBasicMaterial color="#D6B46A" />
      </mesh>
    </group>
  );
}

export default function JourneyScene({ active, onSelect }: { active: number; onSelect: (i: number) => void }) {
  const { pts } = useCurve();
  const [mobile, setMobile] = useState(false);
  useEffect(() => setMobile(window.matchMedia("(max-width: 768px)").matches), []);
  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 1.2, mobile ? 11 : 7.2], fov: 45 }} gl={{ antialias: true, alpha: true }}>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 4, 4]} intensity={30} color="#9DB6FF" />
      <pointLight position={[-5, -2, 3]} intensity={12} color="#00D4FF" />
      <Path active={active} />
      {pts.map((p, i) => <Node key={i} i={i} p={p} active={i === active} onSelect={onSelect} />)}
    </Canvas>
  );
}
