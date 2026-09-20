import React from "react";

/* A small diagram toolkit for the lessons.

   Hand-placed SVG coordinates drift: text escapes its shape and arrows end up
   under or far from the node they point at. Here a node is measured from its
   own text, and an edge is trimmed to the boundary of the shapes it joins, so
   arrowheads always meet a border cleanly. */

export type Tone = "neutral" | "data" | "model" | "code" | "control" | "accent";
export type Shape = "round" | "stadium" | "circle" | "hex" | "shield" | "cloud" | "doc";

export type DNode = {
  id: string;
  x: number;
  y: number;
  shape?: Shape;
  tone?: Tone;
  kicker?: string;
  title?: string;
  lines?: string[];
  mono?: boolean;
  w?: number;
  h?: number;
};

export type DEdge = {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
  tone?: "accent" | "data";
  bend?: number;
  animate?: boolean;
};

/* Inter's average advance width per character, as a fraction of font size.
   Approximate, but it only has to be generous enough to keep text inside. */
const ADVANCE = { kicker: 0.74, title: 0.6, line: 0.56, mono: 0.62 };
export const FS = { kicker: 13, title: 19, line: 15 };
const LH = { kicker: 21, title: 25, line: 21 };
const PAD = 24;

const measure = (text: string, size: number, kind: keyof typeof ADVANCE) => text.length * size * ADVANCE[kind];

export function box(node: DNode) {
  const kind: keyof typeof ADVANCE = node.mono ? "mono" : "line";
  const widths = [
    node.kicker ? measure(node.kicker, FS.kicker, "kicker") : 0,
    node.title ? measure(node.title, FS.title, "title") : 0,
    ...(node.lines ?? []).map((line) => measure(line, FS.line, kind)),
  ];
  const contentW = Math.max(...widths, 48);
  const contentH =
    (node.kicker ? LH.kicker : 0) + (node.title ? LH.title : 0) + (node.lines?.length ?? 0) * LH.line;
  const shape = node.shape ?? "round";
  let w = contentW + PAD * 2;
  let h = contentH + PAD * 1.5;
  if (shape === "hex") { w = contentW + PAD * 3.4; h = contentH + PAD * 2; }
  if (shape === "shield") { w = contentW + PAD * 2.4; h = contentH * 1.5 + PAD; }
  if (shape === "cloud") { w = contentW + PAD * 4.6; h = contentH + PAD * 3.4; }
  if (shape === "doc") { h = contentH + PAD * 1.9; }
  if (shape === "circle") {
    const r = Math.hypot(contentW / 2, contentH / 2) * 1.2 + 8;
    w = h = r * 2;
  }
  return { w: Math.max(node.w ?? 0, w), h: Math.max(node.h ?? 0, h), contentH, shape };
}

function shapePath(node: DNode, w: number, h: number) {
  const { x, y } = node;
  const l = x - w / 2;
  const r = x + w / 2;
  const t = y - h / 2;
  const b = y + h / 2;
  switch (node.shape) {
    case "hex": {
      const i = w * 0.16;
      return `M${l},${y} L${l + i},${t} L${r - i},${t} L${r},${y} L${r - i},${b} L${l + i},${b} Z`;
    }
    case "shield":
      return `M${l},${t + 14} Q${l},${t} ${l + 14},${t} L${r - 14},${t} Q${r},${t} ${r},${t + 14} L${r},${y + h * 0.06} C${r},${b - h * 0.26} ${x + w * 0.2},${b - h * 0.04} ${x},${b} C${x - w * 0.2},${b - h * 0.04} ${l},${b - h * 0.26} ${l},${y + h * 0.06} Z`;
    case "doc": {
      const f = 26;
      return `M${l},${t} L${r - f},${t} L${r},${t + f} L${r},${b} L${l},${b} Z`;
    }
    case "cloud": {
      const rx = w / 2;
      const ry = h / 2;
      return `M${x - rx * 0.55},${b - ry * 0.25}
        C${x - rx},${b - ry * 0.3} ${x - rx},${y} ${x - rx * 0.62},${y - ry * 0.16}
        C${x - rx * 0.72},${t + ry * 0.12} ${x - rx * 0.1},${t - ry * 0.06} ${x + rx * 0.02},${t + ry * 0.3}
        C${x + rx * 0.25},${t} ${x + rx * 0.86},${t + ry * 0.1} ${x + rx * 0.72},${y - ry * 0.2}
        C${x + rx},${y - ry * 0.25} ${x + rx},${b - ry * 0.35} ${x + rx * 0.55},${b - ry * 0.25}
        C${x + rx * 0.45},${b} ${x - rx * 0.4},${b} ${x - rx * 0.55},${b - ry * 0.25} Z`;
    }
    default:
      return "";
  }
}

/* Where an edge meets this node: the point on its outline in a given direction. */
function boundary(node: DNode, towardX: number, towardY: number, gap: number) {
  const { w, h } = box(node);
  const dx = towardX - node.x;
  const dy = towardY - node.y;
  const len = Math.hypot(dx, dy) || 1;
  if (node.shape === "circle") {
    const r = w / 2 + gap;
    return [node.x + (dx / len) * r, node.y + (dy / len) * r] as const;
  }
  const shrink = node.shape === "hex" ? 0.84 : node.shape === "cloud" ? 0.88 : node.shape === "shield" ? 0.9 : 1;
  const hw = (w / 2) * shrink;
  const hh = (h / 2) * (node.shape === "cloud" ? 0.88 : 1);
  const t = Math.min(Math.abs(dx) > 0.001 ? hw / Math.abs(dx) : Infinity, Math.abs(dy) > 0.001 ? hh / Math.abs(dy) : Infinity);
  return [node.x + dx * t + (dx / len) * gap, node.y + dy * t + (dy / len) * gap] as const;
}

function NodeText({ node }: { node: DNode }) {
  const { contentH } = box(node);
  let cursor = node.y - contentH / 2;
  const parts: React.ReactNode[] = [];
  if (node.kicker) {
    cursor += LH.kicker;
    parts.push(<text key="k" className="dg-kicker" x={node.x} y={cursor - 6} textAnchor="middle">{node.kicker}</text>);
  }
  if (node.title) {
    cursor += LH.title;
    parts.push(<text key="t" className="dg-title" x={node.x} y={cursor - 6} textAnchor="middle">{node.title}</text>);
  }
  (node.lines ?? []).forEach((line, index) => {
    cursor += LH.line;
    parts.push(
      <text key={`l${index}`} className={`dg-line ${node.mono ? "is-mono" : ""}`} x={node.x} y={cursor - 5} textAnchor="middle">{line}</text>,
    );
  });
  return <>{parts}</>;
}

export function Diagram({
  width,
  height,
  nodes,
  edges,
  label,
  children,
  minWidth = 760,
}: {
  width: number;
  height: number;
  nodes: DNode[];
  edges: DEdge[];
  label: string;
  children?: React.ReactNode;
  minWidth?: number;
}) {
  const byId = Object.fromEntries(nodes.map((node) => [node.id, node]));

  /* Geometry is resolved once, so paths and labels stay in step. Labels are
     drawn after the nodes, where they cannot disappear behind a shape. */
  const drawn = edges.map((edge, index) => {
    const a = byId[edge.from];
    const b = byId[edge.to];
    const bend = edge.bend ?? 0;
    if (bend) {
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      const cx = mx + (-(b.y - a.y) / len) * bend;
      const cy = my + ((b.x - a.x) / len) * bend;
      const [sx, sy] = boundary(a, cx, cy, 6);
      const [ex, ey] = boundary(b, cx, cy, 9);
      return {
        key: `${edge.from}-${edge.to}-${index}`,
        edge,
        d: `M${sx},${sy} Q${cx},${cy} ${ex},${ey}`,
        lx: (sx + 2 * cx + ex) / 4,
        ly: (sy + 2 * cy + ey) / 4,
      };
    }
    const [sx, sy] = boundary(a, b.x, b.y, 6);
    const [ex, ey] = boundary(b, a.x, a.y, 9);
    return {
      key: `${edge.from}-${edge.to}-${index}`,
      edge,
      d: `M${sx},${sy} L${ex},${ey}`,
      lx: (sx + ex) / 2,
      ly: (sy + ey) / 2,
    };
  });

  return (
    <svg className="dg" viewBox={`0 0 ${width} ${height}`} style={{ minWidth }} role="img" aria-label={label}>
      <defs>
        {["accent", "data"].map((tone) => (
          <marker
            key={tone}
            id={`dg-arrow-${tone}`}
            markerUnits="userSpaceOnUse"
            markerWidth="13"
            markerHeight="10"
            refX="12"
            refY="5"
            orient="auto"
          >
            <path className={`dg-head is-${tone}`} d="M0,0 L13,5 L0,10 Z" />
          </marker>
        ))}
      </defs>

      {drawn.map(({ key, edge, d }) => (
        <g key={key} className={`dg-edge is-${edge.tone ?? "accent"} ${edge.dashed ? "is-dashed" : ""} ${edge.animate ? "is-animated" : ""}`}>
          <path d={d} markerEnd={`url(#dg-arrow-${edge.tone ?? "accent"})`} />
        </g>
      ))}

      {nodes.map((node) => {
        const { w, h } = box(node);
        const shape = node.shape ?? "round";
        const cls = `dg-node is-${node.tone ?? "neutral"} is-${shape}`;
        return (
          <g key={node.id} className={cls}>
            {shape === "circle" ? (
              <circle cx={node.x} cy={node.y} r={w / 2} />
            ) : shape === "round" || shape === "stadium" ? (
              <rect x={node.x - w / 2} y={node.y - h / 2} width={w} height={h} rx={shape === "stadium" ? h / 2 : 16} />
            ) : (
              <path d={shapePath(node, w, h)} />
            )}
            {shape === "doc" && (
              <path className="dg-fold" d={`M${node.x + w / 2 - 26},${node.y - h / 2} L${node.x + w / 2 - 26},${node.y - h / 2 + 26} L${node.x + w / 2},${node.y - h / 2 + 26}`} />
            )}
            <NodeText node={node} />
          </g>
        );
      })}
      <g className="dg-edge-labels">
        {drawn.filter(({ edge }) => edge.label).map(({ key, edge, lx, ly }) => (
          <text key={key} x={lx} y={ly - 11} textAnchor="middle">{edge.label}</text>
        ))}
      </g>
      {children}
    </svg>
  );
}
