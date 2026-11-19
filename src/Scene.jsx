import { useRef, useState,useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import { TOPICS } from "./data";

// Palette Modern Purple
const COLORS = {
  background: "#171323",
  dark: "#302653",
  primary: "#594A91",
  accent: "#8174C7",
  light: "#B8ACE8",
  soft: "#F3F0FA",
  panel: "#201A32",
  locked: "#4a4566",
};

// Calcul dynamique des positions
export const getPositions = (radius = 5.2) => {
  return TOPICS.map((_, i) => {
    const a = (i / TOPICS.length) * Math.PI * 2;

    return [radius * Math.cos(a), 0, radius * Math.sin(a), a];
  });
};

// Position desktop par défaut (compatibilité)
export const positions = getPositions(5.2);

function Table({ t, p, i, active, onPick, showLabel, locked, done }) {
  const g = useRef();
  const [hover, setHover] = useState(false);
  const base = locked ? COLORS.locked : t.color || COLORS.primary;

  useFrame(({ clock }) => {
    if (!g.current) return;
    const s = active ? 1.3 : hover ? 1.15 : 1;
    g.current.scale.lerp({ x: s, y: s, z: s }, 0.12);
    g.current.position.y = Math.sin(clock.elapsedTime + i) * 0.12;
  });

  const glow = active || hover ? 0.9 : 0.35;

  return (
    <group position={[p[0], 0, p[2]]} rotation={[0, -p[3] + Math.PI / 2, 0]}>
      <group
        ref={g}
        onClick={(e) => {
          e.stopPropagation();
          onPick(t.id);
        }}
        onPointerOver={() => {
          setHover(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHover(false);
          document.body.style.cursor = "auto";
        }}
      >
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[2.2, 0.38, 1]} />
          <meshStandardMaterial
            color={base}
            emissive={base}
            emissiveIntensity={glow}
          />
        </mesh>

        {[0, 1, 2].map((k) => (
          <mesh key={k} position={[0, 0.2 - k * 0.3, 0]}>
            <boxGeometry args={[2.2, 0.26, 1]} />
            <meshStandardMaterial
              color={k % 2 ? COLORS.dark : COLORS.panel}
              emissive={base}
              emissiveIntensity={glow * 0.08}
            />
          </mesh>
        ))}

        <mesh position={[-0.75, 0.2, 0.51]}>
          <boxGeometry args={[0.5, 0.06, 0.01]} />
          <meshBasicMaterial color={base} />
        </mesh>
        <mesh position={[0.1, -0.1, 0.51]}>
          <boxGeometry args={[1.2, 0.06, 0.01]} />
          <meshBasicMaterial color={COLORS.accent} />
        </mesh>
        <mesh position={[-0.2, -0.4, 0.51]}>
          <boxGeometry args={[1.7, 0.06, 0.01]} />
          <meshBasicMaterial color={COLORS.accent} />
        </mesh>

        {showLabel && (
          <Html
            center
            distanceFactor={10}
            position={[0, -1.05, 0]}
            style={{ pointerEvents: "none" }}
          >
            <span className="node-label" style={{ borderColor: base }}>
              {locked ? "🔒 " : done ? "✓ " : ""}
              {t.title}
            </span>
          </Html>
        )}
      </group>
    </group>
  );
}

function Packet({ to, offset, color }) {
  const m = useRef();

  useFrame(({ clock }) => {
    if (!m.current) return;

    const k = (clock.elapsedTime * 0.35 + offset) % 1;

    m.current.position.set(to[0] * k, 0.1, to[2] * k);
  });

  return (
    <mesh ref={m}>
      <boxGeometry args={[0.16, 0.16, 0.16]} />
      <meshBasicMaterial color={color || COLORS.accent} />
    </mesh>
  );
}

// Déplace la caméra vers la table active (navigation après un défi réussi)
function Rig({ id }) {
  const controls = useThree((s) => s.controls);
  useFrame(() => {
    if (!controls) return;
    const i = TOPICS.findIndex((t) => t.id === id);
    const tx = i >= 0 ? positions[i][0] * 0.6 : 0,
      tz = i >= 0 ? positions[i][2] * 0.6 : 0;
    controls.target.x += (tx - controls.target.x) * 0.05;
    controls.target.z += (tz - controls.target.z) * 0.05;
    controls.update();
  });
  return null;
}

function Core() {
  const ref = useRef();

  useFrame((_, d) => {
    if (ref.current) {
      ref.current.rotation.y += d * 0.5;
    }
  });

  return (
    <group ref={ref}>
      {[-0.75, 0, 0.75].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <cylinderGeometry args={[1.2, 1.2, 0.6, 48]} />

          <meshStandardMaterial
            color={COLORS.dark}
            emissive={COLORS.primary}
            emissiveIntensity={0.5}
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
      ))}

      <Html
        center
        distanceFactor={10}
        position={[0, 1.7, 0]}
        style={{ pointerEvents: "none" }}
      >
        <span className="core-label">ORACLE DB · PL/SQL</span>
      </Html>
    </group>
  );
}

export default function Scene({ id, setId, unlocked, solved }) {
  const { size } = useThree();

  // Responsive breakpoints
  const isMobile = size.width < 600;
  const isTablet = size.width >= 600 && size.width < 900;

  // Distance entre Oracle et les tables
  const radius = isMobile ? 3.2 : isTablet ? 4.2 : 5.2;

  // Positions recalculées
  const responsivePositions = getPositions(radius);

  return (
    <>
      <color attach="background" args={[COLORS.background]} />

      <fog attach="fog" args={[COLORS.background, 14, 34]} />

      <ambientLight intensity={0.7} />

      <pointLight position={[0, 4, 0]} intensity={40} />
      <pointLight position={[8, 8, 8]} intensity={50} />

      <gridHelper
        args={[50, 50, COLORS.accent, COLORS.dark]}
        position={[0, -1.7, 0]}
      />
      <Rig id={id} positions={responsivePositions} />
      <Core />

      {TOPICS.map((t, i) => {
        const p = responsivePositions[i];
        const color = t.color || COLORS.primary;

        return (
          <group key={t.id}>
            <Line
              points={[
                [0, 0, 0],
                [p[0], 0, p[2]],
              ]}
              color={color}
              lineWidth={1.4}
              transparent
              opacity={id === t.id ? 1 : 0.4}
            />

            <Packet to={p} offset={i * 0.13} color={color} />

            <Packet to={p} offset={i * 0.13 + 0.5} color={color} />
            <Table
              t={t}
              p={p}
              i={i}
              active={id === t.id}
              onPick={setId}
              showLabel={!id}
              locked={!unlocked.includes(t.id)}
              done={solved.includes(t.id)}
            />
          </group>
        );
      })}
    </>
  );
}
