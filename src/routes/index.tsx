import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useMemo, useState } from "react";
import { Atom, ChevronDown, FlaskConical, MousePointer2, Orbit, Rotate3D, RotateCcw, Sparkles } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import {
  averageRadius,
  orbitalName,
  ORBITAL_LETTERS,
  radialDistribution,
  shapeName,
  subshellDescription,
} from "@/lib/orbitals";

const OrbitalCloud3D = lazy(() => import("@/components/OrbitalCloud3D").then((module) => ({ default: module.OrbitalCloud3D })));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Orbital Atlas — Interactive Quantum Orbital Plotter" },
      { name: "description", content: "Choose quantum numbers and plot hydrogen orbital radial distribution functions instantly." },
      { property: "og:title", content: "Orbital Atlas — Interactive Quantum Orbital Plotter" },
      { property: "og:description", content: "Explore quantum numbers, orbital shapes, nodes, and radial probability." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrbitalExplorer,
});

function range(from: number, to: number) {
  return Array.from({ length: to - from + 1 }, (_, index) => from + index);
}

function StepHeading({ symbol, step, label, formula }: { symbol: string; step: string; label: string; formula: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary font-mono text-sm font-medium text-primary">{symbol}</span>
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{step} / {label}</p>
        <p className="mt-1 font-mono text-sm text-primary">{formula}</p>
      </div>
    </div>
  );
}

function OrbitalExplorer() {
  const [n, setN] = useState(3);
  const [l, setL] = useState(1);
  const [m, setM] = useState(0);
  const [compareN, setCompareN] = useState(4);
  const [compareL, setCompareL] = useState(1);

  const name = orbitalName(n, l);
  const compareName = orbitalName(compareN, compareL);
  const chartData = useMemo(() => radialDistribution(n, l), [n, l]);
  const compareData = useMemo(() => {
    const sharedMax = 2.5 * Math.max(averageRadius(n, l), averageRadius(compareN, compareL));
    const primary = radialDistribution(n, l, 420, sharedMax);
    const secondary = radialDistribution(compareN, compareL, 420, sharedMax);
    return primary.map((point, index) => ({ r: point.r, first: point.rdf, second: secondary[index]?.rdf ?? 0 }));
  }, [n, l, compareN, compareL]);

  const chooseN = (value: number) => {
    setN(value);
    const nextL = Math.min(l, value - 1);
    setL(nextL);
    setM(Math.max(-nextL, Math.min(m, nextL)));
  };

  const chooseL = (value: number) => {
    setL(value);
    setM(Math.max(-value, Math.min(m, value)));
  };

  return (
    <main className="scientific-grid min-h-screen overflow-hidden bg-background text-foreground">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-7 lg:px-10">
        <header className="flex items-center justify-between border-b border-border/70 pb-5">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground"><Atom size={23} /></span>
            <div><p className="font-mono text-[10px] uppercase tracking-[0.24em] text-primary">Study lab / 01</p><p className="font-serif text-xl leading-none">Orbital Atlas</p></div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><span className="size-2.5 rounded-full bg-accent" /> Interactive reference</div>
        </header>

        <section className="pb-12 pt-16 sm:pt-20">
          <p className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] text-primary before:h-px before:w-10 before:bg-primary">The quantum ladder</p>
          <h1 className="mt-6 max-w-4xl font-serif text-6xl leading-[0.88] sm:text-8xl lg:text-[7.5rem]">
            Follow the <em className="text-primary">numbers</em> inward.
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">Start with the shell, narrow to a subshell, then map every possible orientation. The curve updates with every choice.</p>
        </section>

        <section className="panel-shadow mb-9 rounded-[1.75rem] border border-border bg-card p-6 sm:p-8">
          <div className="flex items-center justify-between">
            <div><p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Current path</p><p className="mt-2 font-serif text-4xl">{n} <span className="text-muted-foreground">→</span> {l} <span className="text-muted-foreground">→</span> {m > 0 ? `+${m}` : m}</p></div>
            <Sparkles className="text-accent" />
          </div>
          <div className="mt-7 h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full w-full rounded-full bg-primary" /></div>
          <p className="mt-5 text-sm text-muted-foreground">Every choice below recalculates the orbital and its radial probability instantly.</p>
        </section>

        <section className="space-y-8">
          <div className="panel-shadow rounded-[1.75rem] border border-border bg-card p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div><StepHeading symbol="n" step="01" label="Principal quantum number" formula="n = 1, 2, …, 7" /><h2 className="mt-4 text-2xl font-semibold">Choose a shell</h2><p className="mt-1 text-muted-foreground">Sets the orbital’s energy level and size.</p></div>
              <span className="rounded-full bg-secondary px-4 py-2 font-mono text-xs">n ∈ {`{1, 2, …, 7}`}</span>
            </div>
            <div className="mt-7 grid grid-cols-4 gap-3 sm:grid-cols-7">
              {range(1, 7).map((value) => <Button key={value} variant={n === value ? "primary" : "outline"} onClick={() => chooseN(value)} className="h-20 flex-col rounded-[1.3rem] text-xl"><span className="font-mono text-[10px] font-normal opacity-70">shell</span>{value}</Button>)}
            </div>
          </div>

          <div className="flex items-center gap-4 px-7 text-primary"><span className="h-px flex-1 bg-border" /><ChevronDown size={18} /><span className="h-px flex-1 bg-border" /></div>

          <div className="panel-shadow rounded-[1.75rem] border border-border bg-card p-6 sm:p-8">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div><StepHeading symbol="ℓ" step="02" label="Azimuthal quantum number" formula="ℓ = 0, 1, …, n − 1" /><h2 className="mt-4 text-2xl font-semibold">Choose a subshell</h2><p className="mt-1 text-muted-foreground">This number describes the orbital’s shape family.</p></div>
              <span className="rounded-2xl bg-secondary px-4 py-3 text-right font-mono text-xs"><small className="block uppercase text-muted-foreground">Allowed values</small>ℓ = 0, 1, …, {n - 1}</span>
            </div>
            <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
              {range(0, n - 1).map((value) => <Button key={value} variant="outline" onClick={() => chooseL(value)} className={`h-28 items-start rounded-2xl p-4 text-left ${l === value ? "border-accent bg-accent/10 text-accent" : ""}`}><span className="w-full"><span className="block font-mono text-[11px]">ℓ = {value}</span><strong className="mt-2 block font-serif text-4xl font-normal">{ORBITAL_LETTERS[value]}</strong><span className="block text-xs">{ORBITAL_LETTERS[value]} subshell</span></span></Button>)}
            </div>
          </div>

          <div className="panel-shadow relative overflow-hidden rounded-[1.75rem] bg-navy p-7 text-primary-foreground sm:p-10">
            <FlaskConical className="text-accent" />
            <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-navy-muted">You are looking at</p>
            <p className="mt-2 font-serif text-6xl">{name}</p>
            <p className="mt-4 text-navy-muted">{subshellDescription(l)}</p>
            <div className="mt-8 flex items-center justify-between border-t border-primary-foreground/15 pt-6 text-sm text-navy-muted"><span>orbitals in this subshell</span><strong className="text-xl text-accent">{2 * l + 1}</strong></div>
          </div>

          <div className="panel-shadow rounded-[1.75rem] border border-border bg-card p-6 sm:p-8">
            <StepHeading symbol="m" step="03" label="Magnetic quantum number" formula="m = −ℓ, …, 0, …, +ℓ" />
            <h2 className="mt-4 text-2xl font-semibold">Map the orientations</h2><p className="mt-1 text-muted-foreground">Each value labels one orbital orientation within ℓ = {l}.</p>
            <div className="mt-7 flex flex-wrap gap-3">{range(-l, l).map((value) => <Button key={value} variant={m === value ? "primary" : "outline"} onClick={() => setM(value)} className="min-w-14 rounded-full font-mono">{value > 0 ? `+${value}` : value}</Button>)}</div>
          </div>
        </section>

        <section className="mt-12 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="panel-shadow rounded-[1.75rem] border border-border bg-card p-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Visual reference · {name}</p><h2 className="mt-4 font-serif text-5xl">Shape of {name}</h2>
            <div className="relative mt-6 h-80 overflow-hidden rounded-2xl border border-border bg-secondary/70" aria-label={`Rotatable 3D shape of ${name}`}>
              <ClientOnly fallback={<div className="h-full animate-pulse bg-secondary" />}>
                <Suspense fallback={<div className="h-full animate-pulse bg-secondary" />}><OrbitalCloud3D n={n} l={l} m={m} /></Suspense>
              </ClientOnly>
              <span className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 rounded-full bg-card/90 px-3 py-2 font-mono text-[10px] text-muted-foreground shadow-sm"><MousePointer2 size={13} /> drag to rotate · scroll to zoom</span>
            </div>
            <p className="mt-5 font-mono text-xs text-muted-foreground">{shapeName(l)} cloud · orientation m = {m > 0 ? `+${m}` : m}</p>
          </div>

          <div className="panel-shadow min-w-0 rounded-[1.75rem] border border-border bg-card p-7">
            <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">Radial distribution · {name}</p><h2 className="mt-3 font-serif text-4xl sm:text-5xl">Probability by distance</h2></div><span className="rounded-xl bg-secondary px-3 py-2 font-mono text-xs">r̄ = {averageRadius(n, l).toFixed(1)} a₀</span></div>
            <div className="mt-7 h-80 w-full" aria-label={`Radial distribution chart for ${name}`}>
              <ResponsiveContainer width="100%" height="100%"><LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}><CartesianGrid stroke="var(--border)" strokeDasharray="4 5" /><XAxis dataKey="r" type="number" tickFormatter={(v) => Number(v).toFixed(0)} stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} label={{ value: "distance r (a₀)", position: "insideBottomRight", offset: -2 }} /><YAxis stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} /><Tooltip formatter={(value) => [Number(value).toPrecision(4), "RDF"]} labelFormatter={(value) => `r = ${Number(value).toFixed(2)} a₀`} contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px" }} /><Line type="monotone" dataKey="rdf" name={`${name} orbital`} stroke="var(--primary)" strokeWidth={3} dot={false} activeDot={{ r: 4, fill: "var(--accent)" }} /></LineChart></ResponsiveContainer>
            </div>
          </div>
        </section>

        <section className="panel-shadow mt-8 rounded-[1.75rem] border border-border bg-card p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">Angular density / |Yℓᵐ|²</p><h2 className="mt-3 font-serif text-5xl">Probability surface</h2><p className="mt-2 max-w-2xl text-muted-foreground">A cloud of possible electron positions around the nucleus for {name}, with denser regions showing greater probability.</p></div>
            <Rotate3D className="text-accent" />
          </div>
          <div className="relative mt-7 h-[28rem] overflow-hidden rounded-2xl border border-border bg-secondary/70 sm:h-[34rem]" aria-label={`Electron probability surface for ${name}`}>
            <ClientOnly fallback={<div className="h-full animate-pulse bg-secondary" />}>
              <Suspense fallback={<div className="h-full animate-pulse bg-secondary" />}><OrbitalCloud3D n={n} l={l} m={m} mode="probability" /></Suspense>
            </ClientOnly>
            <span className="pointer-events-none absolute left-4 top-4 rounded-full bg-card/90 px-3 py-2 font-mono text-[10px] text-muted-foreground shadow-sm">+z</span>
            <span className="pointer-events-none absolute bottom-4 left-4 flex items-center gap-2 font-mono text-[10px] text-muted-foreground"><i className="size-2 rounded-full bg-[var(--orbital-cloud)] shadow-[0_0_10px_var(--orbital-cloud)]" /> probability amplitude</span>
            <span className="pointer-events-none absolute bottom-10 left-4 font-mono text-[10px] uppercase text-muted-foreground sm:bottom-4 sm:left-auto sm:right-4">Auto rotate · drag to inspect</span>
          </div>
        </section>

        <section className="panel-shadow mt-8 rounded-[1.75rem] border border-border bg-card p-6 sm:p-8">
          <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="font-mono text-[11px] uppercase tracking-[0.2em] text-accent">Comparison lab</p><h2 className="mt-3 font-serif text-5xl">Compare two orbitals</h2></div><div className="flex gap-3"><label className="font-mono text-xs text-muted-foreground">shell<select value={compareN} onChange={(event) => { const value = Number(event.target.value); setCompareN(value); setCompareL(Math.min(compareL, value - 1)); }} className="ml-2 rounded-lg border border-border bg-secondary px-3 py-2 text-foreground">{range(1, 7).map((value) => <option key={value}>{value}</option>)}</select></label><label className="font-mono text-xs text-muted-foreground">subshell<select value={compareL} onChange={(event) => setCompareL(Number(event.target.value))} className="ml-2 rounded-lg border border-border bg-secondary px-3 py-2 text-foreground">{range(0, compareN - 1).map((value) => <option key={value} value={value}>{ORBITAL_LETTERS[value]}</option>)}</select></label></div></div>
          <div className="mt-6 h-96 w-full"><ResponsiveContainer width="100%" height="100%"><LineChart data={compareData} margin={{ top: 15, right: 15, left: -15, bottom: 10 }}><CartesianGrid stroke="var(--border)" strokeDasharray="4 5" /><XAxis dataKey="r" type="number" stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} /><YAxis stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} /><Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px" }} /><Legend /><Line type="monotone" dataKey="first" name={name} stroke="var(--primary)" strokeWidth={3} dot={false} /><Line type="monotone" dataKey="second" name={compareName} stroke="var(--accent)" strokeWidth={3} strokeDasharray="7 5" dot={false} /></LineChart></ResponsiveContainer></div>
        </section>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">{[["total nodes", n - 1, "from n − 1"], ["angular nodes", l, "from ℓ"], ["radial nodes", n - l - 1, "from n − ℓ − 1"]].map(([label, value, note]) => <div key={label} className="rounded-2xl border border-border bg-card p-5"><p className="font-mono text-xs text-muted-foreground">{label}</p><strong className="mt-3 block text-4xl text-accent">{value}</strong><span className="font-mono text-xs text-muted-foreground">{note}</span></div>)}</section>

        <footer className="mt-14 flex flex-wrap items-center justify-between gap-4 border-t border-border py-8 text-sm text-muted-foreground"><span className="flex items-center gap-2"><Orbit size={18} className="text-primary" /> Calculated from the hydrogenic radial wavefunction.</span><Button variant="quiet" onClick={() => { setN(3); setL(1); setM(0); setCompareN(4); setCompareL(1); }}><RotateCcw size={15} className="mr-2" />Reset</Button></footer>
      </div>
    </main>
  );
}