import { useState } from 'react';
import { useLocation } from 'wouter';
import { Character } from '@/lib/db';
import { getContrastColor } from '@/lib/utils';

export interface HandCanvasProps {
  characters: Character[];
  /** false = only right hand; true = both hands */
  showLeftHand: boolean;
  /** false = static rendering for export/print (no hover, focus or empty-slot hints) */
  interactive?: boolean;
}

/**
 * Hotspot geometry is expressed in the native coordinate space of
 * hand-right.png (4419 × 6250) scaled down to a 1414 × 2000 viewBox.
 * Each finger is a capsule (rounded on both ends) traced along the finger
 * silhouette, so the highlight follows the illustration instead of sitting
 * on top of it as a rectangular frame.
 */
const VB_W = 1414;
const VB_H = 2000;

/**
 * The PNG has wide empty margins (the hand only occupies x 34–1355, y 398–1714),
 * so the SVG crops to the drawn hand. Kept symmetric about the horizontal centre
 * so the mirrored left hand lands on exactly the same scale.
 */
const VIEW = { x: 20, y: 380, w: 1374, h: 1350 };

type Point = readonly [number, number];

interface FingerGeom {
  fingerIndex: 1 | 2 | 3 | 4 | 5;
  name: string;
  /** centre of the rounded fingertip */
  tip: Point;
  /** centre of the rounded knuckle end */
  base: Point;
  /** half-width at the fingertip */
  tipR: number;
  /** half-width at the knuckle */
  baseR: number;
}

/**
 * Traced from the alpha mask of hand-right.png: for each finger the silhouette
 * was scanned row by row and fitted to a tapered capsule. Every hotspot stays
 * inside the drawn finger, so highlights never spill onto the background.
 */
const RIGHT_FINGERS: FingerGeom[] = [
  { fingerIndex: 1, name: '엄지', tip: [160, 1200], base: [390, 1370], tipR: 85, baseR: 92 },
  { fingerIndex: 2, name: '검지', tip: [366, 545], base: [460, 940], tipR: 70, baseR: 85 },
  { fingerIndex: 3, name: '중지', tip: [675, 495], base: [677, 950], tipR: 74, baseR: 81 },
  { fingerIndex: 4, name: '약지', tip: [978, 550], base: [884, 935], tipR: 72, baseR: 76 },
  { fingerIndex: 5, name: '소지', tip: [1280, 825], base: [1112, 1050], tipR: 62, baseR: 84 },
];

/** hand-left.png is a mirror image of hand-right.png */
const LEFT_FINGERS: FingerGeom[] = RIGHT_FINGERS.map((f) => ({
  ...f,
  tip: [VB_W - f.tip[0], f.tip[1]] as Point,
  base: [VB_W - f.base[0], f.base[1]] as Point,
}));

/** Tapered capsule: round cap of `tipR` at `tip`, round cap of `baseR` at `base`. */
function capsulePath({ tip, base, tipR, baseR }: FingerGeom): string {
  const [tx, ty] = tip;
  const [bx, by] = base;
  const len = Math.hypot(bx - tx, by - ty) || 1;
  // unit vector tip → base, and its perpendicular
  const dx = (bx - tx) / len;
  const dy = (by - ty) / len;
  const tpx = -dy * tipR;
  const tpy = dx * tipR;
  const bpx = -dy * baseR;
  const bpy = dx * baseR;

  return [
    `M ${tx + tpx} ${ty + tpy}`,
    `A ${tipR} ${tipR} 0 0 1 ${tx - tpx} ${ty - tpy}`,
    `L ${bx - bpx} ${by - bpy}`,
    `A ${baseR} ${baseR} 0 0 1 ${bx + bpx} ${by + bpy}`,
    'Z',
  ].join(' ');
}

/** Names are shown on the fingertip, so keep them short; full name lives in the tooltip. */
function shortName(name: string) {
  const chars = Array.from(name.trim());
  return chars.length > 3 ? `${chars.slice(0, 3).join('')}…` : chars.join('');
}

interface FingerHotspotProps {
  geom: FingerGeom;
  hand: 'left' | 'right';
  character?: Character;
  interactive: boolean;
}

function FingerHotspot({ geom, hand, character, interactive }: FingerHotspotProps) {
  const [, setLocation] = useLocation();
  const [active, setActive] = useState(false);

  const id = `${hand}-${geom.fingerIndex}`;
  const handLabel = hand === 'left' ? '왼손' : '오른손';
  const hasChar = !!character?.name?.trim();
  const color = hasChar ? character!.color || '#ffffff' : null;
  const textColor = color ? getContrastColor(color) : '#4b5563';

  const [tx, ty] = geom.tip;
  const path = capsulePath(geom);

  const label = hasChar
    ? `${handLabel} ${geom.name} - ${character!.name}${character!.isCompleted ? ' (완성)' : ' (만드는 중)'}`
    : `${handLabel} ${geom.name} - 비어 있음, 새 인물 만들기`;

  // Fingertip name tag — kept inside the visible box so it is never clipped
  const display = hasChar ? shortName(character!.name) : '';
  const tagW = Math.max(200, Array.from(display).length * 64 + 56);
  const tagH = 96;
  const tagCx = Math.min(
    Math.max(tx, VIEW.x + tagW / 2 + 8),
    VIEW.x + VIEW.w - tagW / 2 - 8,
  );

  const go = () => setLocation(`/character/${id}`);

  if (!interactive) {
    return (
      <g aria-hidden="true">
        {color && <path d={path} fill={color} fillOpacity={0.9} stroke="rgba(0,0,0,0.12)" strokeWidth={4} />}
        {hasChar && (
          <>
            <rect
              x={tagCx - tagW / 2}
              y={ty - tagH / 2}
              width={tagW}
              height={tagH}
              rx={tagH / 2}
              fill="#ffffff"
              fillOpacity={0.94}
              stroke={color ?? '#d1d5db'}
              strokeWidth={5}
            />
            <text
              x={tagCx}
              y={ty}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={58}
              fontWeight={700}
              fill="#1f2937"
            >
              {display}
            </text>
          </>
        )}
      </g>
    );
  }

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={label}
      className="cursor-pointer focus:outline-none"
      style={{ pointerEvents: 'auto' }}
      onClick={go}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          go();
        }
      }}
      onPointerEnter={() => setActive(true)}
      onPointerLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
    >
      <title>{hasChar ? `${handLabel} ${geom.name} · ${character!.name}` : `${handLabel} ${geom.name} · 새 인물 만들기`}</title>

      {/* Assigned colour fills the finger itself — no frame, no outline box */}
      {color && (
        <path
          d={path}
          fill={color}
          fillOpacity={0.9}
          stroke="rgba(0,0,0,0.12)"
          strokeWidth={4}
          style={{ transition: 'fill 200ms ease' }}
        />
      )}

      {/* Hover / focus indicator: a glow shaped like the finger itself */}
      <path
        d={path}
        fill="#ffffff"
        stroke="hsl(var(--primary))"
        strokeWidth={18}
        style={{
          opacity: active ? 1 : 0,
          // A filled finger already reads clearly; don't wash out its colour.
          fillOpacity: hasChar ? 0.15 : 0.55,
          transition: 'opacity 180ms ease',
        }}
      />

      {/* Empty slot hint — a light fingertip dot instead of a frame */}
      {!hasChar && (
        <>
          <circle
            cx={tx}
            cy={ty}
            r={geom.tipR * 0.72}
            fill="#ffffff"
            fillOpacity={active ? 0.9 : 0.55}
            stroke="hsl(var(--primary))"
            strokeOpacity={active ? 0.9 : 0.35}
            strokeWidth={6}
            strokeDasharray={active ? undefined : '18 14'}
            style={{ transition: 'fill-opacity 180ms ease, stroke-opacity 180ms ease' }}
          />
          <path
            d={`M ${tx - geom.tipR * 0.28} ${ty} H ${tx + geom.tipR * 0.28} M ${tx} ${ty - geom.tipR * 0.28} V ${ty + geom.tipR * 0.28}`}
            stroke="hsl(var(--primary))"
            strokeWidth={11}
            strokeLinecap="round"
            strokeOpacity={active ? 1 : 0.6}
          />
        </>
      )}

      {/* Fingertip name tag */}
      {hasChar && (
        <>
          <rect
            x={tagCx - tagW / 2}
            y={ty - tagH / 2}
            width={tagW}
            height={tagH}
            rx={tagH / 2}
            fill="#ffffff"
            fillOpacity={0.94}
            stroke={color ?? '#d1d5db'}
            strokeWidth={5}
          />
          <text
            x={tagCx}
            y={ty}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={58}
            fontWeight={700}
            fill="#1f2937"
            style={{ pointerEvents: 'none' }}
          >
            {display}
          </text>
          {character!.isCompleted && (
            <g transform={`translate(${tagCx + tagW / 2 - 12} ${ty - tagH / 2 - 4})`}>
              <circle r={34} fill={color ?? '#22c55e'} stroke="#ffffff" strokeWidth={6} />
              <path
                d="M -14 1 L -4 12 L 15 -11"
                fill="none"
                stroke={textColor}
                strokeWidth={9}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
          )}
        </>
      )}

      {/* Invisible hit area — kept last so it always wins the pointer */}
      <path d={path} fill="transparent" stroke="transparent" strokeWidth={40} />
    </g>
  );
}

interface HandImageProps {
  hand: 'left' | 'right';
  fingers: FingerGeom[];
  characters: Character[];
  label: string;
  interactive: boolean;
}

function HandImage({ hand, fingers, characters, label, interactive }: HandImageProps) {
  return (
    <div className="flex w-full flex-col items-center">
      {label && (
        <span className="mb-2 rounded-full bg-white px-3 py-1 text-sm font-semibold text-muted-foreground shadow-sm">
          {label}
        </span>
      )}
      {/* Image and hotspots share one coordinate system, so they can never drift apart. */}
      <svg
        viewBox={`${VIEW.x} ${VIEW.y} ${VIEW.w} ${VIEW.h}`}
        className="w-full drop-shadow-lg"
        style={{ pointerEvents: 'none', aspectRatio: `${VIEW.w} / ${VIEW.h}` }}
        role={interactive ? 'group' : 'img'}
        aria-label={
          interactive
            ? `${label || '오른손'} 손가락 선택`
            : `${hand === 'left' ? '왼손' : '오른손'} 그림`
        }
      >
        <image
          href={`${import.meta.env.BASE_URL}hand-${hand}.png`}
          x={0}
          y={0}
          width={VB_W}
          height={VB_H}
          preserveAspectRatio="none"
        />
        {fingers.map((f) => (
          <FingerHotspot
            key={f.fingerIndex}
            geom={f}
            hand={hand}
            character={characters.find((c) => c.id === `${hand}-${f.fingerIndex}`)}
            interactive={interactive}
          />
        ))}
      </svg>
    </div>
  );
}

export function HandCanvas({ characters, showLeftHand, interactive = true }: HandCanvasProps) {
  return (
    <div className="flex w-full items-end justify-center gap-2 sm:gap-4 md:gap-8">
      {showLeftHand && (
        <div className="w-full max-w-[300px] flex-1 md:max-w-[340px]">
          <HandImage
            hand="left"
            fingers={LEFT_FINGERS}
            characters={characters}
            label="왼손"
            interactive={interactive}
          />
        </div>
      )}

      <div
        className={
          showLeftHand
            ? 'w-full max-w-[300px] flex-1 md:max-w-[340px]'
            : 'w-full max-w-[340px] md:max-w-[380px]'
        }
      >
        <HandImage
          hand="right"
          fingers={RIGHT_FINGERS}
          characters={characters}
          label={showLeftHand ? '오른손' : ''}
          interactive={interactive}
        />
      </div>
    </div>
  );
}
