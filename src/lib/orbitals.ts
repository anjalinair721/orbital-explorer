export const ORBITAL_LETTERS = ["s", "p", "d", "f", "g", "h", "i"] as const;

export type OrbitalPoint = {
  r: number;
  rdf: number;
};

export function factorial(value: number) {
  let result = 1;
  for (let i = 2; i <= value; i += 1) result *= i;
  return result;
}

function generalizedLaguerre(degree: number, alpha: number, x: number) {
  if (degree === 0) return 1;
  if (degree === 1) return 1 + alpha - x;

  let previous = 1;
  let current = 1 + alpha - x;
  for (let k = 1; k < degree; k += 1) {
    const next = ((2 * k + 1 + alpha - x) * current - (k + alpha) * previous) / (k + 1);
    previous = current;
    current = next;
  }
  return current;
}

export function orbitalName(n: number, l: number) {
  return `${n}${ORBITAL_LETTERS[l] ?? `ℓ${l}`}`;
}

export function averageRadius(n: number, l: number) {
  return 0.5 * (3 * n ** 2 - l * (l + 1));
}

export function radialDistribution(n: number, l: number, samples = 420, sharedMax?: number) {
  const rMax = sharedMax ?? 2.5 * averageRadius(n, l);
  const norm = Math.sqrt((2 / n) ** 3 * factorial(n - l - 1) / (2 * n * factorial(n + l)));

  return Array.from({ length: samples }, (_, index): OrbitalPoint => {
    const r = (index / (samples - 1)) * rMax;
    const rho = (2 * r) / n;
    const laguerre = generalizedLaguerre(n - l - 1, 2 * l + 1, rho);
    const radial = norm * rho ** l * Math.exp(-rho / 2) * laguerre;
    return { r, rdf: r ** 2 * radial ** 2 };
  });
}

export function subshellDescription(l: number) {
  const descriptions = [
    "A spherical probability cloud with one possible orientation.",
    "A dumbbell-shaped family with three possible orientations.",
    "A clover-shaped family with five possible orientations.",
    "A complex multi-lobed family with seven possible orientations.",
    "A higher-order family with nine possible orientations.",
    "A higher-order family with eleven possible orientations.",
    "A higher-order family with thirteen possible orientations.",
  ];
  return descriptions[l] ?? "A higher-order orbital family.";
}

export function shapeName(l: number) {
  return ["Spherical", "Dumbbell", "Cloverleaf", "Multi-lobed", "Higher-order", "Higher-order", "Higher-order"][l] ?? "Higher-order";
}