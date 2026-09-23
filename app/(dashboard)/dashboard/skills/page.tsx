'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

// ───────────────────────────────────────
// Types
// ───────────────────────────────────────
interface SkillNode {
  id: string;
  name: string;
  description: string;
  icon: string;
  level: number; // 1, 2, 3 within the branch
}

interface Branch {
  id: string;
  name: string;
  color: string;        // Tailwind color for borders/glow
  glowColor: string;    // rgba for box-shadow
  hexColor: string;     // raw hex for SVG
  icon: string;
  nodes: SkillNode[];
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  angle: number;
  distance: number;
  duration: number;
  delay: number;
  emoji: string;
}

// ───────────────────────────────────────
// Data: Three branches with 3 nodes each
// ───────────────────────────────────────
const BRANCHES: Branch[] = [
  {
    id: 'ecologist',
    name: 'Эколог',
    color: 'emerald',
    glowColor: 'rgba(0, 255, 136, 0.9)',
    hexColor: '#00ff88',
    icon: '🌿',
    nodes: [
      {
        id: 'eco-1',
        name: 'Начинающий',
        description: 'Первая высадка деревьев',
        icon: '🌱',
        level: 1,
      },
      {
        id: 'eco-2',
        name: 'Хранитель Тайги',
        description: 'Защита лесов от пожаров',
        icon: '🌲',
        level: 2,
      },
      {
        id: 'eco-3',
        name: 'Эко-Магистр',
        description: 'Организация эко-движения',
        icon: '🌍',
        level: 3,
      },
    ],
  },
  {
    id: 'donor',
    name: 'Донор и Спасатель',
    color: 'rose',
    glowColor: 'rgba(255, 51, 102, 0.9)',
    hexColor: '#ff3366',
    icon: '🩸',
    nodes: [
      {
        id: 'donor-1',
        name: 'Первое добро',
        description: 'Первая донация крови',
        icon: '💉',
        level: 1,
      },
      {
        id: 'donor-2',
        name: 'Защитник',
        description: 'Помощь в ЧС и спасение',
        icon: '🛡️',
        level: 2,
      },
      {
        id: 'donor-3',
        name: 'Герой Платформы',
        description: 'Спасение десятков жизней',
        icon: '🏆',
        level: 3,
      },
    ],
  },
  {
    id: 'media',
    name: 'Медиа-Волонтёр',
    color: 'sky',
    glowColor: 'rgba(0, 170, 255, 0.9)',
    hexColor: '#00aaff',
    icon: '📱',
    nodes: [
      {
        id: 'media-1',
        name: 'Скаут',
        description: 'Первые репортажи с мест',
        icon: '📸',
        level: 1,
      },
      {
        id: 'media-2',
        name: 'Инфлюенсер',
        description: 'Тысячи подписчиков',
        icon: '📢',
        level: 2,
      },
      {
        id: 'media-3',
        name: 'Голос Поколения',
        description: 'Влияние на миллионы',
        icon: '🎙️',
        level: 3,
      },
    ],
  },
];

// ───────────────────────────────────────
// Node center positions (percentage 0-100)
// Matches both CSS positioning & SVG coords
// ───────────────────────────────────────
const CENTER_X = 50;
const CENTER_Y = 48;

interface NodePosition {
  x: number;
  y: number;
}

const BRANCH_NODE_POSITIONS: Record<string, NodePosition[]> = {
  ecologist: [
    { x: 28, y: 42 },
    { x: 15, y: 37 },
    { x: 4, y: 33 },
  ],
  donor: [
    { x: 68, y: 24 },
    { x: 84, y: 10 },
    { x: 95, y: 3 },
  ],
  media: [
    { x: 68, y: 64 },
    { x: 84, y: 78 },
    { x: 95, y: 87 },
  ],
};

// ───────────────────────────────────────
// Sound utility (Web Audio API)
// ───────────────────────────────────────
function playBeep(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.08,
) {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio not supported – fail silently
  }
}

function playUnlockSound() {
  playBeep(880, 0.15, 'sine', 0.07);
  setTimeout(() => playBeep(1100, 0.12, 'sine', 0.06), 80);
}

function playVictorySound() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    setTimeout(() => playBeep(freq, 0.3, 'triangle', 0.1), i * 120);
  });
}

// ───────────────────────────────────────
// Sub-components
// ───────────────────────────────────────

/** Single floating particle for victory celebration */
function ParticleEl({ p }: { p: Particle }) {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${p.x}%`,
    top: `${p.y}%`,
    fontSize: `${p.size}rem`,
    animation: `particleFly ${p.duration}ms ease-out ${p.delay}ms forwards`,
    opacity: 0,
    pointerEvents: 'none',
    zIndex: 100,
  };

  return (
    <div style={style}>
      {p.emoji}
    </div>
  );
}

/** Full-screen victory overlay with particles */
function VictoryOverlay({
  branchName,
  branchIcon,
  onDone,
}: {
  branchName: string;
  branchIcon: string;
  onDone: () => void;
}) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Generate particles
    const emojis = ['✨', '🌟', '💫', '🎉', '🎊', '🔥', '💥', '⚡', '💎', '🏅', branchIcon];
    const generated: Particle[] = [];
    for (let i = 0; i < 50; i++) {
      generated.push({
        id: i,
        x: 40 + Math.random() * 20,
        y: 40 + Math.random() * 20,
        color: ['#00ff88', '#ff3366', '#00aaff', '#ffaa00', '#a855f7'][Math.floor(Math.random() * 5)],
        size: 1 + Math.random() * 2.5,
        angle: Math.random() * 360,
        distance: 20 + Math.random() * 60,
        duration: 1500 + Math.random() * 1500,
        delay: Math.random() * 400,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
      });
    }
    setParticles(generated);
    playVictorySound();

    const timer = setTimeout(() => {
      setShow(false);
      onDone();
    }, 2800);

    return () => clearTimeout(timer);
  }, [branchIcon, onDone]);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center"
      style={{
        background: 'radial-gradient(circle, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.95) 100%)',
        backdropFilter: 'blur(4px)',
      }}
    >
      {/* Particles */}
      {particles.map((p) => (
        <ParticleEl key={p.id} p={p} />
      ))}

      {/* Central victory text */}
      <div className="z-[100] text-center animate-bounce-in">
        <div className="text-7xl mb-4 animate-spin-slow">{branchIcon}</div>
        <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,170,0,0.8)]">
          ВЕТКА ЗАВЕРШЕНА!
        </h2>
        <p className="text-xl text-white/80 mt-3 font-light tracking-wider">
          {branchName}
        </p>
        <div className="mt-6 text-6xl font-black text-white animate-level-up drop-shadow-[0_0_40px_rgba(255,255,255,0.6)]">
          ⬆ УРОВЕНЬ ПОВЫШЕН!
        </div>
      </div>
    </div>
  );
}

/** Expanding ring explosion at node position */
function ExplosionRing({
  x,
  y,
  color,
  onDone,
}: {
  x: number;
  y: number;
  color: string;
  onDone: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onDone, 650);
    return () => clearTimeout(timer);
  }, [onDone]);

  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        boxShadow: `0 0 60px 20px ${color}, 0 0 120px 40px ${color}, 0 0 200px 60px ${color}`,
        animation: 'explosionPulse 650ms ease-out forwards',
      }}
    />
  );
}

// ───────────────────────────────────────
// Main Page Component
// ───────────────────────────────────────
export default function SkillTreePage() {
  // State
  const [unlockedNodes, setUnlockedNodes] = useState<Set<string>>(new Set());
  const [explodingNode, setExplodingNode] = useState<{
    nodeId: string;
    x: number;
    y: number;
    color: string;
  } | null>(null);
  const [victoryBranch, setVictoryBranch] = useState<{
    branchName: string;
    branchIcon: string;
  } | null>(null);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const prevLevel = useRef(level);

  // Derived: which connections are "live" (both ends unlocked)
  const liveConnections: { from: NodePosition; to: NodePosition; branchId: string }[] = [];

  BRANCHES.forEach((branch) => {
    const positions = BRANCH_NODE_POSITIONS[branch.id];
    // Center → Node 1
    const n1Unlocked = unlockedNodes.has(branch.nodes[0].id);
    // Node 1 → Node 2
    const n2Unlocked = unlockedNodes.has(branch.nodes[1].id);
    // Node 2 → Node 3
    const n3Unlocked = unlockedNodes.has(branch.nodes[2].id);

    if (n1Unlocked) {
      liveConnections.push({
        from: { x: CENTER_X, y: CENTER_Y },
        to: positions[0],
        branchId: branch.id,
      });
    }
    if (n2Unlocked) {
      liveConnections.push({
        from: positions[0],
        to: positions[1],
        branchId: branch.id,
      });
    }
    if (n3Unlocked) {
      liveConnections.push({
        from: positions[1],
        to: positions[2],
        branchId: branch.id,
      });
    }
  });

  // Check if a node is unlockable
  const isNodeUnlockable = useCallback(
    (branch: Branch, node: SkillNode): boolean => {
      if (unlockedNodes.has(node.id)) return false; // already unlocked
      if (node.level === 1) return true; // first node always available
      // Find the previous node in the same branch
      const prevNode = branch.nodes.find((n) => n.level === node.level - 1);
      if (prevNode && unlockedNodes.has(prevNode.id)) return true;
      return false;
    },
    [unlockedNodes],
  );

  // Handle node click
  const handleNodeClick = useCallback(
    (branch: Branch, node: SkillNode, pos: NodePosition) => {
      if (!isNodeUnlockable(branch, node)) return;

      // Play sound
      playUnlockSound();

      // Trigger explosion
      setExplodingNode({
        nodeId: node.id,
        x: pos.x,
        y: pos.y,
        color: branch.glowColor,
      });

      // Unlock the node
      setUnlockedNodes((prev) => {
        const next = new Set(prev);
        next.add(node.id);
        return next;
      });

      // Add XP
      const xpGain = node.level === 3 ? 200 : 100;
      setXp((prev) => {
        const newXp = prev + xpGain;
        const newLevel = 1 + Math.floor(newXp / 300);
        if (newLevel > level) {
          prevLevel.current = level;
          setLevel(newLevel);
          setShowLevelUp(true);
          setTimeout(() => setShowLevelUp(false), 2000);
        }
        return newXp;
      });

      // Check for branch completion
      if (node.level === 3) {
        // All nodes in this branch?
        const allBranchNodes = branch.nodes.map((n) => n.id);
        const allUnlocked = allBranchNodes.every(
          (id) => id === node.id || unlockedNodes.has(id),
        );
        if (allUnlocked) {
          setTimeout(() => {
            setVictoryBranch({
              branchName: branch.name,
              branchIcon: branch.icon,
            });
          }, 700);
        }
      }
    },
    [isNodeUnlockable, level, unlockedNodes],
  );

  // Clean up explosion
  useEffect(() => {
    if (explodingNode) {
      const timer = setTimeout(() => setExplodingNode(null), 700);
      return () => clearTimeout(timer);
    }
  }, [explodingNode]);

  // XP progress percentage
  const xpInLevel = xp % 300;
  const xpPercent = Math.round((xpInLevel / 300) * 100);

  return (
    <>
      {/* Victory overlay */}
      {victoryBranch && (
        <VictoryOverlay
          branchName={victoryBranch.branchName}
          branchIcon={victoryBranch.branchIcon}
          onDone={() => setVictoryBranch(null)}
        />
      )}

      {/* Main container */}
      <div className="relative min-h-screen w-full overflow-hidden bg-[#06060e] text-white selection:bg-amber-500/30">
        {/* Animated background grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            animation: 'gridScroll 20s linear infinite',
          }}
        />

        {/* Subtle radial vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 48%, transparent 30%, rgba(6,6,14,0.8) 70%, #06060e 100%)',
          }}
        />

        {/* Top bar with stats */}
        <header className="relative z-30 flex items-center justify-between px-6 py-4 md:px-10">
          <div>
            <h1 className="text-sm uppercase tracking-[0.3em] text-white/40 font-light">
              Древо Навыков
            </h1>
            <p className="text-2xl md:text-3xl font-black bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">
              Evolution Tree
            </p>
          </div>
          <div className="flex items-center gap-6">
            {/* XP bar */}
            <div className="hidden md:flex items-center gap-3">
              <span className="text-xs uppercase tracking-wider text-white/50">XP</span>
              <div className="w-32 h-2 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 transition-all duration-700 ease-out"
                  style={{ width: `${xpPercent}%` }}
                />
              </div>
              <span className="text-sm text-white/60 font-mono">
                {xpInLevel}/{300}
              </span>
            </div>
            {/* Level badge */}
            <div
              className={`relative flex items-center gap-2 rounded-full px-4 py-2 font-black text-lg transition-all duration-500 ${
                showLevelUp
                  ? 'scale-125 bg-amber-500 text-black shadow-[0_0_40px_rgba(255,170,0,0.7)]'
                  : 'bg-white/5 text-amber-400 border border-amber-500/30'
              }`}
            >
              <span className="text-xs uppercase tracking-wider">Уровень</span>
              <span className="text-2xl">{level}</span>
              {showLevelUp && (
                <span className="absolute -top-2 -right-2 text-sm animate-bounce">⚡</span>
              )}
            </div>
            {/* Nodes count */}
            <div className="text-sm text-white/40 font-mono">
              <span className="text-amber-400 font-bold">{unlockedNodes.size}</span>
              <span className="mx-1">/</span>
              <span>9</span>
            </div>
          </div>
        </header>

        {/* ── Skill Tree Area ── */}
        <div
          className="relative w-full mx-auto"
          style={{
            maxWidth: '1300px',
            height: 'clamp(700px, 80vh, 950px)',
            minHeight: '700px',
          }}
        >
          {/* ── SVG Connection Lines ── */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              {/* Gradient for each branch */}
              <linearGradient id="grad-ecologist" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00ff88" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#00ff88" stopOpacity="1" />
                <stop offset="100%" stopColor="#00ff88" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="grad-donor" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ff3366" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#ff3366" stopOpacity="1" />
                <stop offset="100%" stopColor="#ff3366" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="grad-media" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00aaff" stopOpacity="0.3" />
                <stop offset="50%" stopColor="#00aaff" stopOpacity="1" />
                <stop offset="100%" stopColor="#00aaff" stopOpacity="0.3" />
              </linearGradient>

              {/* Glow filter */}
              <filter id="glow">
                <feGaussianBlur stdDeviation="0.4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Draw all connection lines (dim base) */}
            {BRANCHES.flatMap((branch) => {
              const positions = BRANCH_NODE_POSITIONS[branch.id];
              const lines: { from: NodePosition; to: NodePosition; key: string }[] = [
                { from: { x: CENTER_X, y: CENTER_Y }, to: positions[0], key: `${branch.id}-c0` },
                { from: positions[0], to: positions[1], key: `${branch.id}-c1` },
                { from: positions[1], to: positions[2], key: `${branch.id}-c2` },
              ];
              return lines.map((line) => {
                const isLive = liveConnections.some(
                  (lc) =>
                    lc.from.x === line.from.x &&
                    lc.from.y === line.from.y &&
                    lc.to.x === line.to.x &&
                    lc.to.y === line.to.y,
                );
                return (
                  <line
                    key={line.key}
                    x1={line.from.x}
                    y1={line.from.y}
                    x2={line.to.x}
                    y2={line.to.y}
                    stroke={branch.hexColor}
                    strokeWidth={isLive ? '0.35' : '0.15'}
                    strokeOpacity={isLive ? 0.9 : 0.2}
                    strokeLinecap="round"
                    filter={isLive ? 'url(#glow)' : undefined}
                    className={isLive ? 'connection-live' : ''}
                    style={
                      isLive
                        ? {
                            strokeDasharray: '2 6',
                            animation: `dashFlow 1.5s linear infinite`,
                          }
                        : {}
                    }
                  />
                );
              });
            })}
          </svg>

          {/* ── CENTER: Profile Card with Spinning Aura ── */}
          <div
            className="absolute z-20"
            style={{
              left: `${CENTER_X}%`,
              top: `${CENTER_Y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Outer spinning aura rings */}
            <div className="absolute inset-0 -m-16 animate-spin-slow pointer-events-none">
              <div
                className="w-full h-full rounded-full"
                style={{
                  background:
                    'conic-gradient(from 0deg, transparent, rgba(168,85,247,0.15), rgba(0,255,136,0.15), rgba(0,170,255,0.15), rgba(255,51,102,0.15), transparent)',
                  filter: 'blur(2px)',
                }}
              />
            </div>
            <div
              className="absolute inset-0 -m-10 animate-spin-slow pointer-events-none"
              style={{
                animationDirection: 'reverse',
                animationDuration: '12s',
              }}
            >
              <div
                className="w-full h-full rounded-full border-2 border-transparent"
                style={{
                  borderImage:
                    'conic-gradient(from 90deg, #a855f7, #00ff88, #00aaff, #ff3366, #a855f7) 1',
                  opacity: 0.5,
                  filter: 'blur(1px)',
                }}
              />
            </div>

            {/* Glow blob behind card */}
            <div
              className="absolute -inset-8 rounded-full pointer-events-none animate-pulse"
              style={{
                background:
                  'radial-gradient(circle, rgba(168,85,247,0.35) 0%, rgba(0,170,255,0.2) 40%, transparent 70%)',
                filter: 'blur(40px)',
                animationDuration: '3s',
              }}
            />

            {/* Card */}
            <div
              className="relative w-[200px] h-[200px] md:w-[260px] md:h-[260px] rounded-3xl flex flex-col items-center justify-center gap-2 p-6 backdrop-blur-md"
              style={{
                background:
                  'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 50%, rgba(0,0,0,0.4) 100%)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow:
                  '0 0 60px rgba(168,85,247,0.25), 0 0 120px rgba(0,170,255,0.1), inset 0 0 60px rgba(255,255,255,0.03)',
              }}
            >
              {/* Avatar circle */}
              <div
                className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-4xl md:text-5xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(168,85,247,0.4), rgba(0,170,255,0.3))',
                  border: '2px solid rgba(255,255,255,0.2)',
                  boxShadow: '0 0 30px rgba(168,85,247,0.5)',
                }}
              >
                🧑‍🚀
              </div>

              <span className="text-sm md:text-base font-bold text-white/90 tracking-wide">
                Волонтёр
              </span>

              <div className="flex items-center gap-1 text-amber-400">
                <span className="text-xs uppercase tracking-widest text-white/40">LVL</span>
                <span className="text-2xl md:text-3xl font-black">{level}</span>
              </div>

              {/* Mini progress ring */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1.5"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="46"
                  fill="none"
                  stroke="url(#progressGrad)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={`${(xpPercent / 100) * 289} 289`}
                  style={{ transition: 'stroke-dasharray 0.8s ease-out' }}
                />
              </svg>
              <svg className="absolute inset-0 w-0 h-0" aria-hidden="true">
                <defs>
                  <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a855f7" />
                    <stop offset="50%" stopColor="#fbbf24" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* ── Skill Nodes ── */}
          {BRANCHES.map((branch) => {
            const positions = BRANCH_NODE_POSITIONS[branch.id];
            return branch.nodes.map((node, idx) => {
              const pos = positions[idx];
              const unlocked = unlockedNodes.has(node.id);
              const unlockable = isNodeUnlockable(branch, node);
              const isExploding = explodingNode?.nodeId === node.id;

              return (
                <div
                  key={node.id}
                  className={`absolute z-20 transition-all duration-700 ease-out ${
                    unlockable && !unlocked ? 'cursor-pointer hover:scale-110' : ''
                  } ${!unlocked && !unlockable ? 'cursor-not-allowed' : ''}`}
                  style={{
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: `translate(-50%, -50%) ${
                      isExploding ? 'scale(1.4)' : 'scale(1)'
                    }`,
                  }}
                  onClick={() => handleNodeClick(branch, node, pos)}
                >
                  {/* Glow ring behind unlocked nodes */}
                  {unlocked && (
                    <div
                      className="absolute inset-0 -m-4 rounded-full animate-pulse pointer-events-none"
                      style={{
                        boxShadow: `0 0 30px ${branch.glowColor}, 0 0 60px ${branch.glowColor.replace('0.9', '0.4')}`,
                        animationDuration: '2s',
                      }}
                    />
                  )}

                  {/* Node circle */}
                  <div
                    className={`relative w-[60px] h-[60px] md:w-[72px] md:h-[72px] rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all duration-500 ${
                      unlocked
                        ? 'scale-100'
                        : unlockable
                          ? 'scale-100 animate-pulse'
                          : 'scale-90 opacity-50'
                    }`}
                    style={{
                      background: unlocked
                        ? `linear-gradient(145deg, rgba(0,0,0,0.7), rgba(0,0,0,0.9))`
                        : 'linear-gradient(145deg, rgba(30,30,40,0.8), rgba(15,15,20,0.9))',
                      border: unlocked
                        ? `2px solid ${branch.hexColor}`
                        : unlockable
                          ? `2px solid ${branch.hexColor}55`
                          : '1px solid rgba(255,255,255,0.08)',
                      boxShadow: unlocked
                        ? `0 0 20px ${branch.glowColor}, 0 0 45px ${branch.glowColor.replace('0.9', '0.5')}, inset 0 0 20px ${branch.glowColor.replace('0.9', '0.15')}`
                        : unlockable
                          ? `0 0 8px ${branch.glowColor.replace('0.9', '0.35')}`
                          : 'none',
                    }}
                  >
                    {/* Explosion flash overlay */}
                    {isExploding && (
                      <div
                        className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{
                          background: `radial-gradient(circle, ${branch.glowColor} 0%, transparent 70%)`,
                          animation: 'explosionFlash 650ms ease-out forwards',
                        }}
                      />
                    )}

                    <span className="text-xl md:text-2xl leading-none">{node.icon}</span>
                    <span
                      className={`text-[10px] md:text-xs font-bold leading-tight text-center px-1 ${
                        unlocked ? 'text-white' : 'text-white/50'
                      }`}
                    >
                      {node.name}
                    </span>

                    {/* Lock icon for unavailable nodes */}
                    {!unlocked && !unlockable && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/40">
                        <span className="text-lg opacity-60">🔒</span>
                      </div>
                    )}

                    {/* "Click me" hint for unlockable */}
                    {unlockable && !unlocked && (
                      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] text-white/30 whitespace-nowrap animate-pulse">
                        нажми
                      </div>
                    )}
                  </div>

                  {/* Description tooltip on hover (unlocked only) */}
                  {unlocked && (
                    <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <span className="text-[10px] text-white/40 whitespace-nowrap">
                        {node.description}
                      </span>
                    </div>
                  )}
                </div>
              );
            });
          })}

          {/* ── Branch Labels ── */}
          {BRANCHES.map((branch) => {
            const positions = BRANCH_NODE_POSITIONS[branch.id];
            // Label near the first node of each branch
            const labelPos = positions[0];
            return (
              <div
                key={`label-${branch.id}`}
                className="absolute z-5 pointer-events-none"
                style={{
                  left: `${labelPos.x}%`,
                  top: `${labelPos.y - 9}%`,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                <span
                  className="text-[11px] md:text-xs uppercase tracking-[0.25em] font-light whitespace-nowrap"
                  style={{ color: branch.hexColor, opacity: 0.7 }}
                >
                  {branch.icon} {branch.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Bottom hint */}
        <div className="relative z-30 text-center pb-6 text-white/20 text-xs tracking-wider">
          Кликайте на доступные узлы, чтобы развивать навыки волонтёра
        </div>
      </div>

      {/* ── Global CSS Animations (injected via style tag) ── */}
      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 18s linear infinite;
        }

        @keyframes gridScroll {
          0% { transform: translate(0, 0); }
          100% { transform: translate(40px, 40px); }
        }

        @keyframes dashFlow {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -16; }
        }

        @keyframes explosionPulse {
          0% {
            transform: translate(-50%, -50%) scale(0.3);
            opacity: 1;
          }
          50% {
            transform: translate(-50%, -50%) scale(8);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) scale(14);
            opacity: 0;
          }
        }

        @keyframes explosionFlash {
          0% { opacity: 0; }
          30% { opacity: 1; }
          100% { opacity: 0; }
        }

        @keyframes particleFly {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(0.2) rotate(0deg);
          }
          15% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translate(
                calc(cos(var(--angle, 0deg)) * var(--dist, 50px)),
                calc(sin(var(--angle, 0deg)) * var(--dist, 50px))
              )
              scale(1.5) rotate(var(--rot, 360deg));
          }
        }

        /* Fallback for particle animation (cos/sin not widely supported in CSS) */
        @keyframes particleFlyFallback {
          0% {
            opacity: 0;
            transform: translate(0, 0) scale(0.3);
          }
          20% {
            opacity: 1;
            transform: translate(calc(var(--dx, 30px)), calc(var(--dy, -40px))) scale(0.7);
          }
          100% {
            opacity: 0;
            transform: translate(calc(var(--dx, 30px) * 3), calc(var(--dy, -40px) * 3)) scale(1.4);
          }
        }

        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3);
          }
          50% {
            transform: scale(1.08);
          }
          70% {
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        @keyframes level-up {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.5);
          }
          30% {
            opacity: 1;
            transform: translateY(-5px) scale(1.15);
          }
          60% {
            transform: translateY(2px) scale(0.97);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-level-up {
          animation: level-up 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        /* Pulse for unlockable nodes */
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: var(--pulse-from, 0 0 5px rgba(255,255,255,0.2));
          }
          50% {
            box-shadow: var(--pulse-to, 0 0 18px rgba(255,255,255,0.5));
          }
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .skill-tree-area {
            height: 650px;
            overflow-x: auto;
          }
        }
      `}</style>
    </>
  );
}