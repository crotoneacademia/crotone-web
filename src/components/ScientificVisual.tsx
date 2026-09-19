import React from "react";
export default function ScientificVisual({
  kind = "orbital",
}: {
  kind?: "orbital" | "network" | "spacetime";
}) {
  const nodes = [3, 5, 6, 5, 3].flatMap((count, layer) =>
    Array.from({ length: count }, (_, i) => ({
      x: 65 + layer * 85,
      y: 160 + (i - (count - 1) / 2) * 37,
      layer,
    })),
  );
  return (
    <svg
      className={`scientific-visual ${kind}`}
      viewBox="0 0 480 340"
      role="img"
      aria-label={
        kind === "network"
          ? "Conceptual layered neural network"
          : kind === "spacetime"
            ? "Conceptual curved spacetime grid"
            : "Abstract orbital geometry representing scientific inquiry"
      }
    >
      {kind === "network" ? (
        <>
          <g stroke="currentColor" strokeWidth=".7" opacity=".23">
            {nodes.flatMap((a, i) =>
              nodes
                .filter((b) => b.layer === a.layer + 1)
                .map((b, j) => (
                  <line key={`${i}-${j}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} />
                )),
            )}
          </g>
          {nodes.map((n, i) => (
            <circle
              key={i}
              cx={n.x}
              cy={n.y}
              r={i % 4 === 0 ? 5 : 3.5}
              fill={i % 4 === 0 ? "#b64b59" : "currentColor"}
            />
          ))}
          <path
            d="M65 160 150 123 235 178 320 160 405 160"
            fill="none"
            stroke="#c45969"
            strokeWidth="1.5"
          />
        </>
      ) : kind === "spacetime" ? (
        <g fill="none" stroke="currentColor" strokeWidth=".8">
          {Array.from({ length: 19 }, (_, i) => {
            const x = 36 + i * 23;
            return (
              <path
                key={i}
                opacity=".45"
                d={`M${x} 52 C${x - 45} 120 ${240 + (x - 240) * 0.25} 115 ${240 + (x - 240) * 0.45} 180 S${x + 55} 225 ${x} 290`}
              />
            );
          })}
          {Array.from({ length: 15 }, (_, i) => {
            const y = 57 + i * 16;
            return (
              <path
                key={i}
                opacity=".45"
                d={`M32 ${y} Q240 ${y + Math.sin((i / 14) * Math.PI) * 130} 448 ${y}`}
              />
            );
          })}
          <ellipse
            cx="242"
            cy="183"
            rx="59"
            ry="22"
            stroke="#c45969"
            strokeWidth="1.5"
            transform="rotate(-22 242 183)"
          />
          <circle cx="241" cy="180" r="4" fill="#c45969" stroke="none" />
        </g>
      ) : (
        <g transform="translate(240 170)" fill="none">
          <circle r="135" stroke="#c7c5bf" strokeDasharray="2 6" />
          <circle r="104" stroke="#d5d2cb" />
          {Array.from({ length: 12 }, (_, i) => (
            <ellipse
              key={i}
              rx="145"
              ry={35 + i * 3}
              transform={`rotate(${i * 15})`}
              stroke={i % 4 === 0 ? "#b32923" : "#85827c"}
              strokeWidth=".7"
              opacity={i % 4 === 0 ? ".8" : ".48"}
            />
          ))}
          <path d="M-185 0H185M0-155V155" stroke="#b7b3ab" strokeWidth=".6" />
          <circle cx="-125" cy="-74" r="4.5" fill="#b32923" />
          <circle cx="105" cy="101" r="4" fill="#171717" />
          <circle r="5" fill="#b32923" />
          <path
            d="M-155 -123h22m-11-11v22M148 120h22m-11-11v22"
            stroke="#b32923"
          />
        </g>
      )}
    </svg>
  );
}
