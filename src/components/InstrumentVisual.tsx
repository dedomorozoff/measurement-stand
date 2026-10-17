import { motion } from "motion/react";
import type { InstrumentId } from "../data";
import { formatNumber } from "../utils/measurements";

type Props = { type: InstrumentId; value: number; max: number; unit: string };

export default function InstrumentVisual({ type, value, max, unit }: Props) {
  const jaw = 140 + value * 3.2;
  const angle = -65 + (value / max) * 130;

  return (
    <svg
      className="instrument-svg"
      viewBox="0 0 800 350"
      role="img"
      aria-label={`Показание прибора: ${formatNumber(value)} ${unit}`}
    >
      <defs>
        <linearGradient id="steel" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f5f6f8" />
          <stop offset="0.35" stopColor="#d6d9df" />
          <stop offset="0.6" stopColor="#f4f5f6" />
          <stop offset="1" stopColor="#bcc1cb" />
        </linearGradient>
        <linearGradient id="darksteel" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#6d7483" />
          <stop offset="0.5" stopColor="#363c4b" />
          <stop offset="1" stopColor="#6b7180" />
        </linearGradient>
        <pattern
          id="instrument-grid"
          width="24"
          height="24"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="1" cy="1" r="0.8" fill="#dfe1e9" />
        </pattern>
      </defs>
      <rect
        width="800"
        height="350"
        fill="url(#instrument-grid)"
        opacity=".65"
      />
      {type === "caliper" && (
        <>
          <ellipse
            cx="399"
            cy="291"
            rx="290"
            ry="9"
            fill="#cdd0dc"
            opacity=".18"
          />
          <path
            d="M95 103 L95 62 L112 42 L132 103 Z"
            fill="url(#steel)"
            stroke="#a6adba"
          />
          <rect
            x="95"
            y="104"
            width="625"
            height="50"
            rx="3"
            fill="url(#steel)"
            stroke="#a6adba"
          />
          {Array.from({ length: 151 }, (_, i) => (
            <g key={i}>
              <line
                x1={140 + i * 3.2}
                y1={i % 10 === 0 ? 116 : i % 5 === 0 ? 125 : 131}
                x2={140 + i * 3.2}
                y2="148"
                stroke="#757b88"
                strokeWidth={i % 10 === 0 ? 1 : 0.6}
              />
              {i % 10 === 0 && (
                <text
                  x={140 + i * 3.2}
                  y="114"
                  textAnchor="middle"
                  fontSize="9"
                  fill="#555b69"
                >
                  {i}
                </text>
              )}
            </g>
          ))}
          <path
            d="M95 149 H140 V231 L125 258 L105 239 Z"
            fill="url(#steel)"
            stroke="#a6adba"
          />
          <motion.g
            animate={{ x: jaw - 140 }}
            transition={{ type: "spring", stiffness: 180, damping: 27 }}
          >
            <path
              d="M140 105 V65 L155 49 L169 105"
              fill="url(#steel)"
              stroke="#a6adba"
            />
            <rect
              x="140"
              y="99"
              width="135"
              height="80"
              rx="6"
              fill="url(#steel)"
              stroke="#989fad"
            />
            <rect
              x="155"
              y="116"
              width="104"
              height="38"
              rx="3"
              fill="#d5ddd3"
              stroke="#a2aaa2"
            />
            <text
              x="247"
              y="142"
              textAnchor="end"
              fontFamily="monospace"
              fontSize="23"
              fill="#39443c"
            >
              {value.toFixed(2)}
            </text>
            <circle cx="174" cy="165" r="4" fill="#7d64ba" />
            <circle cx="192" cy="165" r="4" fill="#68717e" />
            <path
              d="M140 178 H174 V234 L154 257 L140 238 Z"
              fill="url(#steel)"
              stroke="#a6adba"
            />
            <rect
              x="222"
              y="178"
              width="30"
              height="10"
              rx="4"
              fill="#4f5665"
            />
            <text x="255" y="169" textAnchor="end" fontSize="8" fill="#59616c">
              mm
            </text>
          </motion.g>
          <line
            x1="140"
            y1="279"
            x2={jaw}
            y2="279"
            stroke="#8b6dcd"
            strokeWidth="1.5"
          />
          <path d="M140 272 V286" stroke="#8b6dcd" />
          <path d={`M${jaw} 272 V286`} stroke="#8b6dcd" />
          <text
            x={(140 + jaw) / 2}
            y="307"
            textAnchor="middle"
            fontSize="14"
            fill="#8061c4"
            fontFamily="monospace"
          >
            {formatNumber(value, 2)} мм
          </text>
        </>
      )}
      {type === "ruler" && (
        <>
          <rect
            x="62"
            y="125"
            width="676"
            height="102"
            rx="7"
            fill="url(#steel)"
            stroke="#b6bdc8"
          />
          {Array.from({ length: 151 }, (_, i) => (
            <g key={i}>
              <line
                x1={75 + i * 4.3}
                y1="127"
                x2={75 + i * 4.3}
                y2={i % 5 === 0 ? 163 : 145}
                stroke="#596170"
                strokeWidth="1"
              />
              {i % 5 === 0 && (
                <text
                  x={75 + i * 4.3}
                  y="184"
                  textAnchor="middle"
                  fontSize="13"
                  fill="#525a68"
                >
                  {i / 5}
                </text>
              )}
            </g>
          ))}
          <text x="700" y="210" textAnchor="end" fontSize="12" fill="#6d7380">
            см
          </text>
          <motion.g
            animate={{ x: (value / max) * 645 }}
            transition={{ type: "spring", stiffness: 200, damping: 28 }}
          >
            <path d="M68 99 L75 113 L82 99 Z" fill="#8969cf" />
            <line
              x1="75"
              y1="115"
              x2="75"
              y2="244"
              stroke="#8969cf"
              strokeWidth="2"
            />
            <text
              x="75"
              y="273"
              textAnchor="middle"
              fontSize="16"
              fill="#8061c4"
              fontFamily="monospace"
            >
              {formatNumber(value)} мм
            </text>
          </motion.g>
        </>
      )}
      {type === "micrometer" && (
        <>
          <path
            d="M281 120 C203 32 98 114 125 217 C146 295 265 294 303 217"
            fill="none"
            stroke="url(#darksteel)"
            strokeWidth="46"
          />
          <path
            d="M274 121 C213 55 129 119 148 207"
            fill="none"
            stroke="#949baa"
            strokeWidth="3"
            opacity=".7"
          />
          <rect
            x="252"
            y="99"
            width="41"
            height="43"
            rx="4"
            fill="url(#steel)"
            stroke="#9fa7b5"
          />
          <motion.rect
            animate={{ x: 290 + value * 2 }}
            y="111"
            width={128 - value * 2}
            height="18"
            rx="2"
            fill="url(#steel)"
            stroke="#9fa7b5"
          />
          <rect
            x="397"
            y="87"
            width="128"
            height="67"
            rx="4"
            fill="url(#steel)"
            stroke="#9fa7b5"
          />
          <line x1="405" y1="119" x2="523" y2="119" stroke="#626a78" />
          {Array.from({ length: 11 }, (_, i) => (
            <g key={i}>
              <line
                x1={408 + i * 10}
                y1="105"
                x2={408 + i * 10}
                y2="120"
                stroke="#626a78"
              />
              {i % 5 === 0 && (
                <text
                  x={408 + i * 10}
                  y="101"
                  textAnchor="middle"
                  fontSize="10"
                  fill="#59616c"
                >
                  {i}
                </text>
              )}
            </g>
          ))}
          <rect
            x="518"
            y="78"
            width="119"
            height="85"
            rx="7"
            fill="url(#steel)"
            stroke="#9fa7b5"
          />
          {Array.from({ length: 12 }, (_, i) => (
            <line
              key={i}
              x1="524"
              y1={84 + i * 6.5}
              x2="543"
              y2={84 + i * 6.5}
              stroke="#737b89"
            />
          ))}
          {Array.from({ length: 15 }, (_, i) => (
            <line
              key={i}
              x1={554 + i * 5.3}
              y1="84"
              x2={554 + i * 5.3}
              y2="157"
              stroke="#acb2bc"
              strokeWidth="1.5"
            />
          ))}
          <rect
            x="637"
            y="94"
            width="65"
            height="52"
            rx="8"
            fill="url(#darksteel)"
          />
          <text
            x="417"
            y="255"
            textAnchor="middle"
            fontSize="24"
            fill="#8061c4"
            fontFamily="monospace"
          >
            {formatNumber(value, 2)} мм
          </text>
          <text
            x="417"
            y="279"
            textAnchor="middle"
            fontSize="11"
            fill="#9295a1"
          >
            ПОКАЗАНИЕ МИКРОМЕТРА
          </text>
        </>
      )}
      {type === "voltmeter" && (
        <>
          <rect
            x="174"
            y="32"
            width="452"
            height="281"
            rx="22"
            fill="#e0e3ea"
            stroke="#c4cad4"
          />
          <rect
            x="189"
            y="47"
            width="422"
            height="244"
            rx="12"
            fill="#fcfcfd"
            stroke="#d1d5de"
          />
          <path
            d="M235 211 A183 183 0 0 1 565 211"
            fill="none"
            stroke="#dce0e8"
            strokeWidth="2"
          />
          {Array.from({ length: 31 }, (_, i) => {
            const a = ((-155 + i * (130 / 30)) * Math.PI) / 180;
            const r = i % 5 === 0 ? 163 : 172;
            return (
              <g key={i}>
                <line
                  x1={400 + Math.cos(a) * r}
                  y1={275 + Math.sin(a) * r}
                  x2={400 + Math.cos(a) * 183}
                  y2={275 + Math.sin(a) * 183}
                  stroke="#747d8d"
                  strokeWidth={i % 5 === 0 ? 1.8 : 1}
                />
                {i % 5 === 0 && (
                  <text
                    x={400 + Math.cos(a) * 143}
                    y={280 + Math.sin(a) * 143}
                    fontSize="12"
                    fill="#626a79"
                    textAnchor="middle"
                  >
                    {i}
                  </text>
                )}
              </g>
            );
          })}
          <text
            x="400"
            y="187"
            textAnchor="middle"
            fontSize="29"
            fontWeight="500"
            fill="#4a5160"
          >
            V
          </text>
          <text
            x="400"
            y="210"
            textAnchor="middle"
            fontSize="12"
            fill="#9a9eaa"
          >
            1,5
          </text>
          <motion.g
            animate={{ rotate: angle }}
            style={{ transformOrigin: "400px 275px" }}
            transition={{ type: "spring", stiffness: 110, damping: 20 }}
          >
            <path d="M396 275 L400 91 L404 275 Z" fill="#8a65ce" />
          </motion.g>
          <circle cx="400" cy="275" r="13" fill="#656c7b" />
          <circle cx="400" cy="275" r="6" fill="#b8bdc7" />
        </>
      )}
    </svg>
  );
}
