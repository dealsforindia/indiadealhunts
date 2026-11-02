import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useReducedMotion } from 'motion/react';
import { Waves, Eye, EyeOff } from 'lucide-react';

const TILE_SIZE = 10;
const NUM_TILES = 7;

interface SharkConfig {
  numNodes: number;
  segLength: number;
  scale: number;
  speed: number;
  hammerWidth: number;
  hammerThick: number;
}

class HammerheadShark {
  index: number;
  numNodes: number;
  segLength: number;
  scale: number;
  baseSpeed: number;
  speed: number;
  hammerWidth: number;
  hammerThick: number;
  radii: number[];
  angle: number;
  targetAngle: number;
  swimPhase: number;
  nodes: Array<{ x: number; y: number; angle: number }>;

  constructor(width: number, height: number, index: number) {
    this.index = index;

    const configs: SharkConfig[] = [
      { numNodes: 22, segLength: 16, scale: 1.15, speed: 1.75, hammerWidth: 48, hammerThick: 13 },
      { numNodes: 20, segLength: 14, scale: 1.0, speed: 1.95, hammerWidth: 42, hammerThick: 11.5 },
      { numNodes: 18, segLength: 12, scale: 0.85, speed: 1.6, hammerWidth: 36, hammerThick: 10 },
      { numNodes: 16, segLength: 10.5, scale: 0.75, speed: 2.1, hammerWidth: 30, hammerThick: 8.5 },
    ];

    const cfg = configs[index % configs.length];
    this.numNodes = cfg.numNodes;
    this.segLength = cfg.segLength;
    this.scale = cfg.scale;
    this.baseSpeed = cfg.speed;
    this.speed = cfg.speed;
    this.hammerWidth = cfg.hammerWidth;
    this.hammerThick = cfg.hammerThick;

    const baseRadii = [
      8, 11, 14, 19, 24, 26, 25, 22, 19, 16,
      13, 10.5, 8.5, 7, 5.5, 4.5, 3.5, 3, 2.5, 1.5, 1.2, 1.0
    ];
    this.radii = baseRadii.slice(0, this.numNodes).map(r => r * this.scale);

    const startAngles = [-0.75, 2.35, -2.15, 0.65];
    this.angle = startAngles[index % startAngles.length];
    this.targetAngle = this.angle;
    this.swimPhase = index * 2.15;

    const startX = width * (0.15 + 0.24 * index);
    const startY = height * (0.18 + 0.22 * ((index * 2 + 1) % 4));

    this.nodes = [];
    for (let i = 0; i < this.numNodes; i++) {
      this.nodes.push({
        x: startX - Math.cos(this.angle) * i * this.segLength,
        y: startY - Math.sin(this.angle) * i * this.segLength,
        angle: this.angle,
      });
    }
  }

  update(
    width: number,
    height: number,
    time: number,
    pointer: { x: number; y: number; active: boolean; boost: boolean },
    allSharks: HammerheadShark[]
  ) {
    const head = this.nodes[0];
    this.speed = pointer.boost ? this.baseSpeed * 1.4 : this.baseSpeed;
    this.swimPhase += 0.095 * (this.speed / 1.6);

    const wander =
      Math.sin(time * 0.0005 + this.index * 4.7) * 0.018 +
      Math.cos(time * 0.0011 - this.index * 2.3) * 0.012;
    this.angle += wander;

    if (pointer.active) {
      const dx = pointer.x - head.x;
      const dy = pointer.y - head.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 50 && dist < 650) {
        const desired = Math.atan2(dy, dx);
        let diff = desired - this.angle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.angle += diff * (pointer.boost ? 0.048 : 0.018);
      }
    }

    for (const other of allSharks) {
      if (other === this) continue;
      const dx = head.x - other.nodes[0].x;
      const dy = head.y - other.nodes[0].y;
      const dist = Math.hypot(dx, dy);
      if (dist > 0 && dist < 180) {
        const repelAngle = Math.atan2(dy, dx);
        let diff = repelAngle - this.angle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.angle += diff * 0.028;
      }
    }

    const headSway = Math.sin(this.swimPhase) * 0.052;
    const moveAngle = this.angle + headSway;
    head.x += Math.cos(moveAngle) * this.speed;
    head.y += Math.sin(moveAngle) * this.speed;
    head.angle = moveAngle;

    for (let i = 1; i < this.numNodes; i++) {
      const prev = this.nodes[i - 1];
      const curr = this.nodes[i];

      const dx = prev.x - curr.x;
      const dy = prev.y - curr.y;
      let segAngle = Math.atan2(dy, dx);

      const t = i / (this.numNodes - 1);
      const waveAmp = Math.pow(t, 1.45) * 0.24;
      const waveOffset = Math.sin(this.swimPhase - i * 0.42) * waveAmp;

      segAngle += waveOffset;
      curr.angle = segAngle;
      curr.x = prev.x - Math.cos(segAngle) * this.segLength;
      curr.y = prev.y - Math.sin(segAngle) * this.segLength;
    }

    const pad = 280;
    let wrapped = false;
    let shiftX = 0;
    let shiftY = 0;

    if (head.x < -pad) {
      shiftX = width + pad * 1.8;
      wrapped = true;
    } else if (head.x > width + pad) {
      shiftX = -(width + pad * 1.8);
      wrapped = true;
    }

    if (head.y < -pad) {
      shiftY = height + pad * 1.8;
      wrapped = true;
    } else if (head.y > height + pad) {
      shiftY = -(height + pad * 1.8);
      wrapped = true;
    }

    if (wrapped) {
      for (let i = 0; i < this.numNodes; i++) {
        this.nodes[i].x += shiftX;
        this.nodes[i].y += shiftY;
      }
    }
  }

  drawOffscreen(ctx: CanvasRenderingContext2D, downscale: number) {
    ctx.save();
    ctx.scale(downscale, downscale);

    const n = this.nodes;
    const leftPts: Array<{ x: number; y: number }> = [];
    const rightPts: Array<{ x: number; y: number }> = [];

    for (let i = 0; i < this.numNodes; i++) {
      const node = n[i];
      const perp = node.angle + Math.PI / 2;
      const r = this.radii[i];
      leftPts.push({
        x: node.x + Math.cos(perp) * r,
        y: node.y + Math.sin(perp) * r,
      });
      rightPts.push({
        x: node.x - Math.cos(perp) * r,
        y: node.y - Math.sin(perp) * r,
      });
    }

    // 1. PECTORAL FINS
    const pecNode = n[4];
    const pecAngle = pecNode.angle;
    const pecSpan = 68 * this.scale;
    const pecSweep = 34 * this.scale;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    for (const side of [-1, 1]) {
      const perp = pecAngle + (Math.PI / 2) * side;
      const baseF = {
        x: n[3].x + Math.cos(perp) * (this.radii[3] * 0.7),
        y: n[3].y + Math.sin(perp) * (this.radii[3] * 0.7),
      };
      const baseB = {
        x: n[6].x + Math.cos(perp) * (this.radii[6] * 0.7),
        y: n[6].y + Math.sin(perp) * (this.radii[6] * 0.7),
      };
      const tip = {
        x: pecNode.x + Math.cos(perp) * pecSpan - Math.cos(pecAngle) * pecSweep,
        y: pecNode.y + Math.sin(perp) * pecSpan - Math.sin(pecAngle) * pecSweep,
      };

      ctx.beginPath();
      ctx.moveTo(baseF.x, baseF.y);
      ctx.quadraticCurveTo(
        (baseF.x + tip.x) * 0.5 + Math.cos(pecAngle) * 8,
        (baseF.y + tip.y) * 0.5 + Math.sin(pecAngle) * 8,
        tip.x,
        tip.y
      );
      ctx.quadraticCurveTo(
        (tip.x + baseB.x) * 0.5 - Math.cos(pecAngle) * 6,
        (tip.y + baseB.y) * 0.5 - Math.sin(pecAngle) * 6,
        baseB.x,
        baseB.y
      );
      ctx.closePath();
      ctx.fill();
    }

    // 2. PELVIC FINS
    const pelIdx = Math.min(11, this.numNodes - 4);
    const pelNode = n[pelIdx];
    const pelSpan = 24 * this.scale;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    for (const side of [-1, 1]) {
      const perp = pelNode.angle + (Math.PI / 2) * side;
      ctx.beginPath();
      ctx.moveTo(n[pelIdx - 1].x, n[pelIdx - 1].y);
      ctx.lineTo(
        pelNode.x + Math.cos(perp) * pelSpan - Math.cos(pelNode.angle) * 14 * this.scale,
        pelNode.y + Math.sin(perp) * pelSpan - Math.sin(pelNode.angle) * 14 * this.scale
      );
      ctx.lineTo(n[pelIdx + 1].x, n[pelIdx + 1].y);
      ctx.closePath();
      ctx.fill();
    }

    // 3. HAMMERHEAD CEPHALOFOIL
    const h0 = n[0];
    const hammerWidth = this.hammerWidth;
    const hammerThick = this.hammerThick;

    ctx.save();
    ctx.translate(h0.x, h0.y);
    ctx.rotate(h0.angle);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.beginPath();
    ctx.moveTo(hammerThick * 0.45, -hammerWidth);
    ctx.quadraticCurveTo(hammerThick * 0.9, 0, hammerThick * 0.45, hammerWidth);
    ctx.lineTo(-hammerThick * 0.7, hammerWidth * 0.95);
    ctx.quadraticCurveTo(-hammerThick * 0.3, 0, -hammerThick * 0.7, -hammerWidth * 0.95);
    ctx.closePath();
    ctx.fill();

    // Lateral eye lobes
    ctx.fillStyle = 'rgba(0, 0, 0, 0.88)';
    ctx.fillRect(-hammerThick * 0.5, -hammerWidth, hammerThick * 0.9, 9 * this.scale);
    ctx.fillRect(-hammerThick * 0.5, hammerWidth - 9 * this.scale, hammerThick * 0.9, 9 * this.scale);
    ctx.restore();

    // 4. OUTER BODY SILHOUETTE
    ctx.fillStyle = 'rgba(0, 0, 0, 0.52)';
    ctx.beginPath();
    ctx.moveTo(leftPts[0].x, leftPts[0].y);
    for (let i = 1; i < this.numNodes; i++) {
      ctx.lineTo(leftPts[i].x, leftPts[i].y);
    }
    for (let i = this.numNodes - 1; i >= 0; i--) {
      ctx.lineTo(rightPts[i].x, rightPts[i].y);
    }
    ctx.closePath();
    ctx.fill();

    // 5. INNER CORE TORSO & SPINE
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    for (let i = 1; i < this.numNodes - 3; i++) {
      const node = n[i];
      const perp = node.angle + Math.PI / 2;
      const r = this.radii[i] * 0.55;
      const px = node.x + Math.cos(perp) * r;
      const py = node.y + Math.sin(perp) * r;
      if (i === 1) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    for (let i = this.numNodes - 4; i >= 1; i--) {
      const node = n[i];
      const perp = node.angle - Math.PI / 2;
      const r = this.radii[i] * 0.55;
      ctx.lineTo(node.x + Math.cos(perp) * r, node.y + Math.sin(perp) * r);
    }
    ctx.closePath();
    ctx.fill();

    // 6. DORSAL FIN & CAUDAL TAIL FIN
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.lineWidth = 5 * this.scale;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(n[4].x, n[4].y);
    ctx.lineTo(n[8].x, n[8].y);
    ctx.stroke();

    const tailBaseIdx = this.numNodes - 3;
    const tailTipIdx = this.numNodes - 1;
    const tailBase = n[tailBaseIdx];
    const tailTip = n[tailTipIdx];
    const tailAngle = tailTip.angle;
    const tailPerp = tailAngle + Math.PI / 2;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.72)';
    ctx.beginPath();
    ctx.moveTo(tailBase.x, tailBase.y);
    ctx.lineTo(
      tailTip.x + Math.cos(tailPerp) * 24 * this.scale - Math.cos(tailAngle) * 18 * this.scale,
      tailTip.y + Math.sin(tailPerp) * 24 * this.scale - Math.sin(tailAngle) * 18 * this.scale
    );
    ctx.lineTo(
      tailTip.x - Math.cos(tailAngle) * 8 * this.scale,
      tailTip.y - Math.sin(tailAngle) * 8 * this.scale
    );
    ctx.lineTo(
      tailTip.x - Math.cos(tailPerp) * 14 * this.scale - Math.cos(tailAngle) * 12 * this.scale,
      tailTip.y - Math.sin(tailPerp) * 14 * this.scale - Math.sin(tailAngle) * 12 * this.scale
    );
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

function spatialHash(cx: number, cy: number): number {
  let n = cx * 374761393 + cy * 668265263;
  n = (n ^ (n >> 13)) * 1274126177;
  return ((n ^ (n >> 16)) >>> 0) / 4294967295;
}

function ambientClusterNoise(cx: number, cy: number, t: number): number {
  const s1 = Math.sin(cx * 0.085 + t * 0.35) * Math.cos(cy * 0.085 - t * 0.25);
  const s2 = Math.sin((cx + cy) * 0.045 - t * 0.18);
  return (s1 + s2) * 0.5;
}

function createTileAtlas(isDark: boolean): HTMLCanvasElement[] {
  const tileCanvases: HTMLCanvasElement[] = [];

  const lightPatterns = [
    (c: CanvasRenderingContext2D, s: number) => {
      c.fillStyle = '#52524e';
      c.fillRect(4, 4, 2, 2);
    },
    (c: CanvasRenderingContext2D, s: number) => {
      c.fillStyle = '#454542';
      c.fillRect(4, 3, 2, 4);
      c.fillRect(3, 4, 4, 2);
    },
    (c: CanvasRenderingContext2D, s: number) => {
      c.fillStyle = '#c8c6be';
      c.fillRect(1, 1, s - 2, s - 2);
      c.strokeStyle = '#6e6d68';
      c.lineWidth = 1;
      c.strokeRect(1.5, 1.5, s - 3, s - 3);
      c.fillStyle = '#3d3d3a';
      c.fillRect(4, 4, 2, 2);
    },
    (c: CanvasRenderingContext2D, s: number) => {
      c.fillStyle = '#a8a59b';
      c.fillRect(1, 1, s - 2, s - 2);
      c.fillStyle = '#4a4945';
      for (let y = 2; y < s - 2; y += 2) {
        for (let x = 2; x < s - 2; x += 2) {
          if ((x + y) % 4 === 0) c.fillRect(x, y, 1.5, 1.5);
        }
      }
    },
    (c: CanvasRenderingContext2D, s: number) => {
      c.fillStyle = '#7e8082';
      c.fillRect(1, 1, s - 2, s - 2);
      c.fillStyle = '#2e3032';
      c.fillRect(2, 2, s - 4, 1.5);
      c.fillRect(2, s - 3.5, s - 4, 1.5);
      c.fillRect(3.5, 3.5, 3, 3);
    },
    (c: CanvasRenderingContext2D, s: number) => {
      c.fillStyle = '#555450';
      c.fillRect(1, 1, s - 2, s - 2);
      c.fillStyle = '#1f1f1d';
      c.fillRect(2, 2, s - 4, s - 4);
      c.fillStyle = '#9c9990';
      c.fillRect(3, 3, 1.5, 1.5);
      c.fillRect(5.5, 5.5, 1.5, 1.5);
    },
    (c: CanvasRenderingContext2D, s: number) => {
      c.fillStyle = '#262624';
      c.fillRect(1, 1, s - 2, s - 2);
      c.fillStyle = '#0f0f0e';
      c.fillRect(2, 2, s - 4, s - 4);
      c.fillStyle = '#6e6c66';
      c.fillRect(4, 4, 2, 2);
    },
  ];

  const darkPatterns = [
    (c: CanvasRenderingContext2D, s: number) => {
      c.fillStyle = 'rgba(56, 189, 248, 0.75)';
      c.fillRect(4, 4, 2, 2);
    },
    (c: CanvasRenderingContext2D, s: number) => {
      c.fillStyle = '#2dd4bf';
      c.fillRect(4, 3, 2, 4);
      c.fillRect(3, 4, 4, 2);
    },
    (c: CanvasRenderingContext2D, s: number) => {
      c.fillStyle = '#0f172a';
      c.fillRect(1, 1, s - 2, s - 2);
      c.strokeStyle = '#0284c7';
      c.lineWidth = 1;
      c.strokeRect(1.5, 1.5, s - 3, s - 3);
      c.fillStyle = '#38bdf8';
      c.fillRect(4, 4, 2, 2);
    },
    (c: CanvasRenderingContext2D, s: number) => {
      c.fillStyle = '#1e293b';
      c.fillRect(1, 1, s - 2, s - 2);
      c.fillStyle = '#38bdf8';
      for (let y = 2; y < s - 2; y += 2) {
        for (let x = 2; x < s - 2; x += 2) {
          if ((x + y) % 4 === 0) c.fillRect(x, y, 1.5, 1.5);
        }
      }
    },
    (c: CanvasRenderingContext2D, s: number) => {
      c.fillStyle = '#0369a1';
      c.fillRect(1, 1, s - 2, s - 2);
      c.fillStyle = '#0f172a';
      c.fillRect(2, 2, s - 4, 1.5);
      c.fillRect(2, s - 3.5, s - 4, 1.5);
      c.fillStyle = '#7dd3fc';
      c.fillRect(3.5, 3.5, 3, 3);
    },
    (c: CanvasRenderingContext2D, s: number) => {
      c.fillStyle = '#0284c7';
      c.fillRect(1, 1, s - 2, s - 2);
      c.fillStyle = '#082f49';
      c.fillRect(2, 2, s - 4, s - 4);
      c.fillStyle = '#a5f3fc';
      c.fillRect(3, 3, 1.5, 1.5);
      c.fillRect(5.5, 5.5, 1.5, 1.5);
    },
    (c: CanvasRenderingContext2D, s: number) => {
      c.fillStyle = '#f0f9ff';
      c.fillRect(1, 1, s - 2, s - 2);
      c.fillStyle = '#0284c7';
      c.fillRect(2, 2, s - 4, s - 4);
      c.fillStyle = '#38bdf8';
      c.fillRect(4, 4, 2, 2);
    },
  ];

  const patterns = isDark ? darkPatterns : lightPatterns;
  for (let i = 0; i < patterns.length; i++) {
    const c = document.createElement('canvas');
    c.width = TILE_SIZE;
    c.height = TILE_SIZE;
    const cctx = c.getContext('2d');
    if (cctx) patterns[i](cctx, TILE_SIZE);
    tileCanvases.push(c);
  }

  return tileCanvases;
}

export const SharkMosaicCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const [active, setActive] = useState(true);
  const [rippling, setRippling] = useState(false);

  const pointerRef = useRef({
    x: typeof window !== 'undefined' ? window.innerWidth * 0.5 : 500,
    y: typeof window !== 'undefined' ? window.innerHeight * 0.5 : 400,
    active: false,
    boost: false,
    timer: null as any,
  });

  const ripplesRef = useRef<Array<{ x: number; y: number; r: number; alpha: number }>>([]);

  const triggerRipple = useCallback((x: number, y: number) => {
    ripplesRef.current.push({ x, y, r: 8, alpha: 0.65 });
    pointerRef.current.x = x;
    pointerRef.current.y = y;
    pointerRef.current.active = true;
    pointerRef.current.boost = true;
    setRippling(true);

    clearTimeout(pointerRef.current.timer);
    pointerRef.current.timer = setTimeout(() => {
      pointerRef.current.boost = false;
      setRippling(false);
    }, 1800);
  }, []);

  useEffect(() => {
    if (!active || reduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const offCanvas = document.createElement('canvas');
    const offCtx = offCanvas.getContext('2d', { willReadFrequently: true });
    if (!offCtx) return;

    let isDark = document.documentElement.classList.contains('dark') ||
      document.documentElement.getAttribute('data-theme') === 'dark';
    let tileCanvases = createTileAtlas(isDark);

    const observer = new MutationObserver(() => {
      const nextDark = document.documentElement.classList.contains('dark') ||
        document.documentElement.getAttribute('data-theme') === 'dark';
      if (nextDark !== isDark) {
        isDark = nextDark;
        tileCanvases = createTileAtlas(isDark);
      }
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });

    let screenW = window.innerWidth;
    let screenH = window.innerHeight;
    let cols = Math.ceil(screenW / TILE_SIZE);
    let rows = Math.ceil(screenH / TILE_SIZE);

    const initSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      screenW = window.innerWidth;
      screenH = window.innerHeight;

      canvas.width = screenW * dpr;
      canvas.height = screenH * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.ceil(screenW / TILE_SIZE);
      rows = Math.ceil(screenH / TILE_SIZE);

      offCanvas.width = cols;
      offCanvas.height = rows;

      offCtx.fillStyle = '#ffffff';
      offCtx.fillRect(0, 0, cols, rows);
    };

    initSize();

    const sharks = [
      new HammerheadShark(screenW, screenH, 0),
      new HammerheadShark(screenW, screenH, 1),
      new HammerheadShark(screenW, screenH, 2),
      new HammerheadShark(screenW, screenH, 3),
    ];

    const onPointerMove = (e: PointerEvent) => {
      pointerRef.current.x = e.clientX;
      pointerRef.current.y = e.clientY;
      pointerRef.current.active = true;
      clearTimeout(pointerRef.current.timer);
      pointerRef.current.timer = setTimeout(() => {
        pointerRef.current.active = false;
      }, 2500);
    };

    const onGlobalPointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)) {
        return;
      }
      triggerRipple(e.clientX, e.clientY);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onGlobalPointerDown, { passive: true });
    window.addEventListener('resize', initSize, { passive: true });

    let animFrame: number;

    const renderLoop = (now: number) => {
      // 1. Decay offscreen buffer to produce soft dither trails
      offCtx.fillStyle = 'rgba(255, 255, 255, 0.38)';
      offCtx.fillRect(0, 0, cols, rows);

      // 2. Expand water ripples
      const ripples = ripplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r += 3.2;
        rp.alpha *= 0.94;
        offCtx.save();
        offCtx.scale(1 / TILE_SIZE, 1 / TILE_SIZE);
        offCtx.strokeStyle = `rgba(0, 0, 0, ${rp.alpha})`;
        offCtx.lineWidth = 14;
        offCtx.beginPath();
        offCtx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2);
        offCtx.stroke();
        offCtx.restore();
        if (rp.alpha < 0.03) ripples.splice(i, 1);
      }

      // 3. Update sharks
      const downscale = 1 / TILE_SIZE;
      for (const shark of sharks) {
        shark.update(screenW, screenH, now, pointerRef.current, sharks);
        shark.drawOffscreen(offCtx, downscale);
      }

      // 4. Read low-res luminance
      const imgData = offCtx.getImageData(0, 0, cols, rows).data;

      // 5. Clear visible canvas (transparent so deals & UI show smoothly above it)
      ctx.clearRect(0, 0, screenW, screenH);

      const timeSec = now * 0.001;
      const slowTick = Math.floor(timeSec * 6);

      // 6. Quantized tile stamp pass
      for (let r = 0; r < rows; r++) {
        const py = r * TILE_SIZE;
        const rowOffset = r * cols;

        for (let c = 0; c < cols; c++) {
          const idx = (rowOffset + c) * 4;
          const lum = imgData[idx] / 255;
          const darkness = 1.0 - lum;
          const px = c * TILE_SIZE;

          if (darkness > 0.045) {
            const jitter = (spatialHash(c + slowTick, r) - 0.5) * 0.14;
            const d = Math.max(0.02, Math.min(0.99, darkness + jitter));
            const tileIdx = Math.min(
              NUM_TILES - 1,
              Math.max(0, Math.floor(d * NUM_TILES))
            );
            ctx.drawImage(tileCanvases[tileIdx], px, py);
          } else {
            // Ambient suspended micro-particles
            const h = spatialHash(c, r);
            if (h > 0.965) {
              const cluster = ambientClusterNoise(c, r, timeSec);
              if (cluster > 0.22) {
                if (isDark) {
                  ctx.fillStyle = cluster > 0.5 ? 'rgba(56, 189, 248, 0.45)' : 'rgba(45, 212, 191, 0.3)';
                } else {
                  ctx.fillStyle = cluster > 0.5 ? 'rgba(110, 109, 104, 0.45)' : 'rgba(168, 166, 160, 0.3)';
                }
                ctx.fillRect(px + 4, py + 4, 1.5, 1.5);
              }
            }
          }
        }
      }

      animFrame = requestAnimationFrame(renderLoop);
    };

    animFrame = requestAnimationFrame(renderLoop);

    return () => {
      cancelAnimationFrame(animFrame);
      observer.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onGlobalPointerDown);
      window.removeEventListener('resize', initSize);
    };
  }, [active, reduced, triggerRipple]);

  if (reduced) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-85 dark:opacity-75 transition-opacity duration-500"
      />

      {/* Subtle Floating Interactive Ripple Trigger in Bottom Corner */}
      <div className="pointer-events-auto absolute bottom-20 right-4 sm:bottom-6 sm:right-6 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            const rx = window.innerWidth * (0.3 + Math.random() * 0.4);
            const ry = window.innerHeight * (0.3 + Math.random() * 0.4);
            triggerRipple(rx, ry);
          }}
          aria-label="Send water ripple to summon sharks"
          className="px-3.5 py-2 rounded-full text-xs font-semibold backdrop-blur-md bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/15 text-slate-800 dark:text-slate-200 shadow-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <Waves className={`w-3.5 h-3.5 text-blue-600 dark:text-sky-400 ${rippling ? 'animate-pulse' : ''}`} />
          <span>Ripple</span>
        </button>

        <button
          type="button"
          onClick={() => setActive(a => !a)}
          aria-label={active ? 'Pause shark simulation' : 'Resume shark simulation'}
          className="w-9 h-9 rounded-full text-xs backdrop-blur-md bg-white/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-white/15 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          {active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};
