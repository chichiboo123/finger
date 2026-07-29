import { Character } from '@/lib/db';
import { motion } from 'framer-motion';
import { getContrastColor } from '@/lib/utils';
import { useLocation } from 'wouter';

interface HandCanvasProps {
  characters: Character[];
  showRightHand: boolean;
}

interface FingerConfig {
  id: string;
  hand: 'left' | 'right';
  fingerIndex: 1 | 2 | 3 | 4 | 5;
  name: string;
  /** SVG path for the finger shape (viewBox "0 0 240 320") */
  path: string;
  /** Knuckle accent paths for illustration detail */
  knucklePaths?: string[];
  /** Center x for label text */
  cx: number;
  /** Y for the icon/label cluster center */
  labelY: number;
}

// ─── LEFT HAND (palm facing viewer) ──────────────────────────────────────────
// Thumb exits from lower-left of palm at ~135°
const LEFT_FINGERS: FingerConfig[] = [
  {
    id: 'left-1',
    hand: 'left',
    fingerIndex: 1,
    name: '엄지',
    path: 'M 36 235 C 19 207 6 168 8 142 Q 20 122 36 143 C 44 168 54 208 62 235 Z',
    knucklePaths: ['M 16 198 Q 34 192 52 198'],
    cx: 35,
    labelY: 194,
  },
  {
    id: 'left-2',
    hand: 'left',
    fingerIndex: 2,
    name: '검지',
    path: 'M 67 181 C 65 134 67 78 69 59 Q 82 31 95 59 C 97 78 99 134 97 181 Z',
    knucklePaths: ['M 69 140 Q 82 134 95 140', 'M 70 110 Q 82 104 95 110'],
    cx: 82,
    labelY: 128,
  },
  {
    id: 'left-3',
    hand: 'left',
    fingerIndex: 3,
    name: '중지',
    path: 'M 100 176 C 98 129 101 62 103 42 Q 116 14 129 42 C 131 62 134 129 132 176 Z',
    knucklePaths: ['M 102 135 Q 116 129 130 135', 'M 103 105 Q 116 99 129 105'],
    cx: 116,
    labelY: 112,
  },
  {
    id: 'left-4',
    hand: 'left',
    fingerIndex: 4,
    name: '약지',
    path: 'M 134 179 C 132 133 134 77 136 59 Q 149 31 162 59 C 164 77 166 133 164 179 Z',
    knucklePaths: ['M 135 138 Q 149 132 163 138', 'M 136 108 Q 149 102 163 108'],
    cx: 149,
    labelY: 128,
  },
  {
    id: 'left-5',
    hand: 'left',
    fingerIndex: 5,
    name: '소지',
    path: 'M 165 186 C 163 149 164 113 166 88 Q 178 62 190 88 C 192 113 193 149 191 186 Z',
    knucklePaths: ['M 166 148 Q 178 142 190 148', 'M 167 122 Q 178 116 190 122'],
    cx: 178,
    labelY: 148,
  },
];

// ─── RIGHT HAND (mirror: x' = 240 − x) ──────────────────────────────────────
const RIGHT_FINGERS: FingerConfig[] = [
  {
    id: 'right-1',
    hand: 'right',
    fingerIndex: 1,
    name: '엄지',
    path: 'M 204 235 C 221 207 234 168 232 142 Q 220 122 204 143 C 196 168 186 208 178 235 Z',
    knucklePaths: ['M 224 198 Q 206 192 188 198'],
    cx: 205,
    labelY: 194,
  },
  {
    id: 'right-2',
    hand: 'right',
    fingerIndex: 2,
    name: '검지',
    path: 'M 173 181 C 175 134 173 78 171 59 Q 158 31 145 59 C 143 78 141 134 143 181 Z',
    knucklePaths: ['M 171 140 Q 158 134 145 140', 'M 170 110 Q 158 104 145 110'],
    cx: 158,
    labelY: 128,
  },
  {
    id: 'right-3',
    hand: 'right',
    fingerIndex: 3,
    name: '중지',
    path: 'M 140 176 C 142 129 139 62 137 42 Q 124 14 111 42 C 109 62 106 129 108 176 Z',
    knucklePaths: ['M 138 135 Q 124 129 110 135', 'M 137 105 Q 124 99 111 105'],
    cx: 124,
    labelY: 112,
  },
  {
    id: 'right-4',
    hand: 'right',
    fingerIndex: 4,
    name: '약지',
    path: 'M 106 179 C 108 133 106 77 104 59 Q 91 31 78 59 C 76 77 74 133 76 179 Z',
    knucklePaths: ['M 105 138 Q 91 132 77 138', 'M 104 108 Q 91 102 77 108'],
    cx: 91,
    labelY: 128,
  },
  {
    id: 'right-5',
    hand: 'right',
    fingerIndex: 5,
    name: '소지',
    path: 'M 75 186 C 77 149 76 113 74 88 Q 62 62 50 88 C 48 113 47 149 49 186 Z',
    knucklePaths: ['M 74 148 Q 62 142 50 148', 'M 73 122 Q 62 116 50 122'],
    cx: 62,
    labelY: 148,
  },
];

// Palm path for left hand
const LEFT_PALM =
  'M 60 200 C 54 222 46 260 48 284 C 50 310 80 322 120 322 C 160 322 190 310 192 284 C 194 260 186 222 180 200 C 170 192 152 187 132 184 C 124 183 116 183 108 184 C 88 187 70 192 60 200 Z';

// Palm path for right hand (mirrored)
const RIGHT_PALM =
  'M 180 200 C 186 222 194 260 192 284 C 190 310 160 322 120 322 C 80 322 50 310 48 284 C 46 260 54 222 60 200 C 70 192 88 187 108 184 C 116 183 124 183 132 184 C 152 187 170 192 180 200 Z';

// Fingernail path builder (SVG path for a small oval nail at fingertip)
function nailPath(cx: number, tipY: number, w = 10, h = 14): string {
  const l = cx - w;
  const r = cx + w;
  const t = tipY + 2;
  const b = tipY + h;
  return `M ${l} ${t + h / 2} Q ${l} ${t} ${cx} ${t} Q ${r} ${t} ${r} ${t + h / 2} Q ${r} ${b} ${cx} ${b} Q ${l} ${b} ${l} ${t + h / 2} Z`;
}

// ─── Single finger slot ───────────────────────────────────────────────────────
function FingerSlot({
  config,
  character,
}: {
  config: FingerConfig;
  character?: Character;
}) {
  const [, setLocation] = useLocation();
  const hasCharacter = !!character;
  const isCompleted = character?.isCompleted ?? false;
  const charColor = character?.color ?? null;

  // Skin fill & colors
  const fingerFill = charColor ?? '#FDDDB8';
  const strokeColor = charColor ? charColor : '#D4A070';
  const textColor = charColor ? getContrastColor(charColor) : '#8B5E3C';

  // Fingertip y for nail placement
  const nailTipY =
    config.fingerIndex === 1
      ? config.labelY - 65
      : config.cx === 116 || config.cx === 124 // middle
        ? 26
        : config.cx === 82 || config.cx === 158 // index
          ? 43
          : config.cx === 149 || config.cx === 91 // ring
            ? 43
            : 74; // pinky

  return (
    <motion.g
      onClick={() => setLocation(`/character/${config.id}`)}
      className="cursor-pointer"
      whileHover={{ y: config.fingerIndex === 1 ? 0 : -8, x: config.fingerIndex === 1 ? 6 : 0 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      role="button"
      aria-label={`${config.name} - ${character?.name ?? '인물 만들기'}`}
    >
      {/* Clip path for drawing preview */}
      <defs>
        <clipPath id={`clip-${config.id}`}>
          <path d={config.path} />
        </clipPath>
      </defs>

      {/* Finger body */}
      <path
        d={config.path}
        fill={fingerFill}
        stroke={strokeColor}
        strokeWidth="1.8"
        strokeLinejoin="round"
        opacity={hasCharacter ? 1 : 0.85}
        style={{ filter: isCompleted ? 'drop-shadow(0 3px 6px rgba(0,0,0,0.18))' : 'none' }}
      />

      {/* Fingernail */}
      {config.fingerIndex !== 1 && (
        <path
          d={nailPath(config.cx, nailTipY)}
          fill="#F5E6CC"
          stroke={strokeColor}
          strokeWidth="0.9"
          opacity="0.75"
        />
      )}

      {/* Knuckle lines */}
      {config.knucklePaths?.map((kp, i) => (
        <path
          key={i}
          d={kp}
          fill="none"
          stroke={charColor ? strokeColor : '#C49060'}
          strokeWidth="0.9"
          strokeLinecap="round"
          opacity="0.35"
        />
      ))}

      {/* Drawing preview inside finger */}
      {character?.drawingDataUrl && (
        <image
          href={character.drawingDataUrl}
          x={config.cx - 18}
          y={config.labelY - 32}
          width="36"
          height="52"
          preserveAspectRatio="xMidYMid meet"
          clipPath={`url(#clip-${config.id})`}
          opacity="0.92"
        />
      )}

      {/* No character: show + and finger name */}
      {!hasCharacter && (
        <>
          <text
            x={config.cx}
            y={config.labelY - 8}
            textAnchor="middle"
            fontSize="18"
            fontWeight="700"
            fill="#9CA3AF"
            style={{ fontFamily: 'sans-serif' }}
          >
            +
          </text>
          <text
            x={config.cx}
            y={config.labelY + 10}
            textAnchor="middle"
            fontSize="8.5"
            fontWeight="600"
            fill="#9CA3AF"
            style={{ fontFamily: 'Pretendard, sans-serif' }}
          >
            {config.name}
          </text>
        </>
      )}

      {/* Has character (no drawing preview yet): show name */}
      {hasCharacter && !character.drawingDataUrl && (
        <text
          x={config.cx}
          y={config.labelY + 4}
          textAnchor="middle"
          fontSize="8"
          fontWeight="700"
          fill={textColor}
          style={{ fontFamily: 'Pretendard, sans-serif' }}
        >
          {(character.name || config.name).slice(0, 5)}
        </text>
      )}

      {/* Has drawing: show name below preview */}
      {hasCharacter && character.drawingDataUrl && (
        <text
          x={config.cx}
          y={config.labelY + 24}
          textAnchor="middle"
          fontSize="7.5"
          fontWeight="700"
          fill={textColor}
          style={{ fontFamily: 'Pretendard, sans-serif' }}
        >
          {(character.name || config.name).slice(0, 5)}
        </text>
      )}

      {/* Completion badge */}
      {isCompleted && (
        <circle cx={config.cx + 14} cy={config.labelY - 30} r="6" fill="#22C55E" />
      )}
    </motion.g>
  );
}

// ─── Hand SVG ─────────────────────────────────────────────────────────────────
function HandSVG({
  type,
  characters,
}: {
  type: 'left' | 'right';
  characters: Character[];
}) {
  const configs = type === 'left' ? LEFT_FINGERS : RIGHT_FINGERS;
  const palmPath = type === 'left' ? LEFT_PALM : RIGHT_PALM;

  return (
    <svg
      viewBox="0 0 240 330"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[300px] mx-auto drop-shadow-md"
      role="img"
      aria-label={`${type === 'left' ? '왼손' : '오른손'} 손가락 선택`}
    >
      {/* Palm */}
      <path
        d={palmPath}
        fill="#FDDDB8"
        stroke="#D4A070"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />

      {/* Subtle palm crease */}
      <path
        d={
          type === 'left'
            ? 'M 65 260 Q 100 252 140 255 Q 168 258 185 262'
            : 'M 175 260 Q 140 252 100 255 Q 72 258 55 262'
        }
        fill="none"
        stroke="#C49060"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.3"
      />

      {/* Fingers (thumb last so it's on top) */}
      {configs
        .filter((c) => c.fingerIndex !== 1)
        .map((config) => (
          <FingerSlot
            key={config.id}
            config={config}
            character={characters.find((ch) => ch.id === config.id)}
          />
        ))}
      {/* Thumb on top */}
      {configs
        .filter((c) => c.fingerIndex === 1)
        .map((config) => (
          <FingerSlot
            key={config.id}
            config={config}
            character={characters.find((ch) => ch.id === config.id)}
          />
        ))}
    </svg>
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────
export function HandCanvas({ characters, showRightHand }: HandCanvasProps) {
  return (
    <div
      className={`w-full flex items-end justify-center gap-2 md:gap-10 transition-all duration-500 ${
        showRightHand ? 'flex-col md:flex-row' : 'flex-row'
      }`}
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex flex-col items-center w-full max-w-[280px]"
      >
        <span className="text-sm font-semibold text-muted-foreground mb-2">왼손</span>
        <HandSVG type="left" characters={characters} />
      </motion.div>

      {showRightHand && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col items-center w-full max-w-[280px]"
        >
          <span className="text-sm font-semibold text-muted-foreground mb-2">오른손</span>
          <HandSVG type="right" characters={characters} />
        </motion.div>
      )}
    </div>
  );
}
