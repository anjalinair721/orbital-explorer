import { Canvas, useFrame } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";

type OrbitalCloud3DProps = {
  n: number;
  l: number;
  m: number;
  mode?: "shape" | "probability";
};

type SceneColors = {
  cloud: string;
  cloudAlt: string;
  nucleus: string;
  axis: string;
  surface: string;
};

const FALLBACK_COLORS: SceneColors = {
  cloud: "#18c99a",
  cloudAlt: "#24a9e8",
  nucleus: "#253054",
  axis: "#8fc8e8",
  surface: "#dff3fb",
};

function oklchToHex(value: string, fallback: string) {
  const match = value.match(/oklch\(\s*([\d.]+)%?\s+([\d.]+)\s+([\d.]+)/i);
  if (!match) return value || fallback;
  const lightnessValue = Number(match[1]);
  const chroma = Number(match[2]);
  const hue = Number(match[3]) * Math.PI / 180;
  const lightness = lightnessValue > 1 ? lightnessValue / 100 : lightnessValue;
  const a = chroma * Math.cos(hue);
  const b = chroma * Math.sin(hue);
  const lPrime = lightness + 0.3963377774 * a + 0.2158037573 * b;
  const mPrime = lightness - 0.1055613458 * a - 0.0638541728 * b;
  const sPrime = lightness - 0.0894841775 * a - 1.291485548 * b;
  const l = lPrime ** 3;
  const m = mPrime ** 3;
  const s = sPrime ** 3;
  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
  const encoded = linear.map((channel) => {
    const value = channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055;
    return Math.round(Math.max(0, Math.min(1, value)) * 255).toString(16).padStart(2, "0");
  });
  return `#${encoded.join("")}`;
}

function readSceneColors(): SceneColors {
  const styles = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) => oklchToHex(styles.getPropertyValue(name).trim(), fallback);
  return {
    cloud: read("--orbital-cloud", FALLBACK_COLORS.cloud),
    cloudAlt: read("--orbital-cloud-alt", FALLBACK_COLORS.cloudAlt),
    nucleus: read("--orbital-nucleus", FALLBACK_COLORS.nucleus),
    axis: read("--orbital-axis", FALLBACK_COLORS.axis),
    surface: read("--orbital-surface", FALLBACK_COLORS.surface),
  };
}

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function randomUnit(random: () => number) {
  const z = random() * 2 - 1;
  const angle = random() * Math.PI * 2;
  const radius = Math.sqrt(Math.max(0, 1 - z * z));
  return new THREE.Vector3(radius * Math.cos(angle), z, radius * Math.sin(angle));
}

function orbitalDirections(l: number, m: number) {
  if (l === 0) return [];
  if (l === 1) {
    if (m === 0) return [new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0)];
    if (m < 0) return [new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1)];
    return [new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0)];
  }
  if (l === 2) {
    if (m === 0) return [new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0)];
    const diagonal = m < 0;
    const plane = Math.abs(m) === 1 ? "xz" : "xy";
    return [0, 1, 2, 3].map((index) => {
      const a = (index * Math.PI) / 2 + (diagonal ? Math.PI / 4 : 0);
      if (plane === "xz") return new THREE.Vector3(Math.cos(a), 0, Math.sin(a));
      return new THREE.Vector3(Math.cos(a), Math.sin(a), 0);
    });
  }
  const count = Math.min(2 * l + 1, 12);
  const tilt = (m / Math.max(1, l)) * 0.65;
  return Array.from({ length: count }, (_, index) => {
    const angle = (index / count) * Math.PI * 2;
    return new THREE.Vector3(Math.cos(angle) * Math.cos(tilt), Math.sin(tilt + Math.sin(angle) * 0.24), Math.sin(angle) * Math.cos(tilt)).normalize();
  });
}

function buildCloud(n: number, l: number, m: number, count: number) {
  const random = seededRandom(n * 1009 + l * 97 + (m + 9) * 31 + count);
  const directions = orbitalDirections(l, m);
  const positions = new Float32Array(count * 3);
  const phases = new Float32Array(count);
  const radialNodes = n - l - 1;

  for (let index = 0; index < count; index += 1) {
    const selectedDirection = directions[Math.floor(random() * directions.length)];
    const direction = directions.length === 0 || !selectedDirection
      ? randomUnit(random)
      : selectedDirection.clone();
    const radiusBand = radialNodes > 0 && random() < Math.min(0.36, radialNodes * 0.11) ? 0.48 : 1;
    const radius = radiusBand * (0.55 + Math.pow(random(), 0.62) * (1.25 + n * 0.07));
    const spread = l === 0 ? 0.3 : 0.16 + Math.min(l, 4) * 0.018;
    const jitter = randomUnit(random).multiplyScalar(spread * radius * Math.pow(random(), 0.45));
    const point = direction.multiplyScalar(radius).add(jitter);
    positions[index * 3] = point.x;
    positions[index * 3 + 1] = point.y;
    positions[index * 3 + 2] = point.z;
    phases[index] = direction.x + direction.y + direction.z >= 0 ? 1 : 0;
  }
  return { positions, phases };
}

function ElectronCloud({ n, l, m, count, colors, autoRotate }: OrbitalCloud3DProps & { count: number; colors: SceneColors; autoRotate: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const { positions, phases } = useMemo(() => buildCloud(n, l, m, count), [n, l, m, count]);
  const colorArray = useMemo(() => {
    const primary = new THREE.Color(colors.cloud);
    const alternate = new THREE.Color(colors.cloudAlt);
    const values = new Float32Array(count * 3);
    for (let index = 0; index < count; index += 1) {
      const color = (phases[index] ?? 0) > 0.5 ? primary : alternate;
      values[index * 3] = color.r;
      values[index * 3 + 1] = color.g;
      values[index * 3 + 2] = color.b;
    }
    return values;
  }, [colors, count, phases]);

  useFrame((_, rawDelta) => {
    if (!autoRotate || !groupRef.current) return;
    const delta = Math.min(rawDelta, 0.05);
    groupRef.current.rotation.y += delta * 0.11;
  });

  return (
    <group ref={groupRef}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-color" args={[colorArray, 3]} />
        </bufferGeometry>
        <pointsMaterial size={autoRotate ? 0.055 : 0.065} vertexColors transparent opacity={autoRotate ? 0.48 : 0.7} depthWrite={false} blending={THREE.AdditiveBlending} sizeAttenuation />
      </points>
      <mesh>
        <sphereGeometry args={[0.075, 24, 24]} />
        <meshStandardMaterial color={colors.nucleus} emissive={colors.cloud} emissiveIntensity={0.35} roughness={0.35} />
      </mesh>
    </group>
  );
}

function Axes({ colors }: { colors: SceneColors }) {
  return (
    <group>
      <Line points={[[-2.45, 0, 0], [2.45, 0, 0]]} color={colors.axis} lineWidth={0.7} transparent opacity={0.5} />
      <Line points={[[0, -2.15, 0], [0, 2.15, 0]]} color={colors.axis} lineWidth={0.7} transparent opacity={0.5} />
    </group>
  );
}

function OrbitalScene({ n, l, m, mode, colors, reduceMotion }: OrbitalCloud3DProps & { colors: SceneColors; reduceMotion: boolean }) {
  const probability = mode === "probability";
  return (
    <>
      <color attach="background" args={[colors.surface]} />
      <ambientLight intensity={1.2} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <Axes colors={colors} />
      <ElectronCloud n={n} l={l} m={m} count={probability ? 4200 : 2600} colors={colors} autoRotate={probability && !reduceMotion} />
      <OrbitControls makeDefault enablePan={false} enableDamping dampingFactor={0.07} minDistance={3.25} maxDistance={7.5} rotateSpeed={0.7} zoomSpeed={0.65} autoRotate={false} />
    </>
  );
}

export function OrbitalCloud3D({ n, l, m, mode = "shape" }: OrbitalCloud3DProps) {
  const [colors, setColors] = useState(FALLBACK_COLORS);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setColors(readSceneColors());
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduceMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <Canvas dpr={[1, 1.6]} camera={{ position: [0, 0.45, 4.8], fov: 42 }} gl={{ antialias: true, alpha: false }}>
      <OrbitalScene n={n} l={l} m={m} mode={mode} colors={colors} reduceMotion={reduceMotion} />
    </Canvas>
  );
}
