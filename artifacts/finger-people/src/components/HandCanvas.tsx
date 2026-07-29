import { Character } from '@/lib/db';
import { motion } from 'framer-motion';
import { getContrastColor } from '@/lib/utils';
import { useLocation } from 'wouter';

export interface HandCanvasProps {
  characters: Character[];
  /** false = only right hand (image 1); true = both hands */
  showLeftHand: boolean;
}

interface FingerHotspotCfg {
  id: string;
  hand: 'left' | 'right';
  fingerIndex: 1 | 2 | 3 | 4 | 5;
  name: string;
  /** % of image container width  */
  left: number;
  /** % of image container height */
  top: number;
  /** % of image container width  */
  width: number;
  /** % of image container height */
  height: number;
  /** CSS rotation degrees */
  rotate: number;
  isThumb?: boolean;
}

// ─── hand-right.png  (image 1, right hand, thumb at lower-left) ───────────────
// Image native size: 4419 × 6250  (aspect ≈ 0.707)
const RIGHT_HOTSPOTS: FingerHotspotCfg[] = [
  { id: 'right-1', hand: 'right', fingerIndex: 1, name: '엄지', left:  6, top: 59, width: 22, height: 27, rotate: -42, isThumb: true },
  { id: 'right-2', hand: 'right', fingerIndex: 2, name: '검지', left: 20, top: 12, width: 15, height: 43, rotate:  -8 },
  { id: 'right-3', hand: 'right', fingerIndex: 3, name: '중지', left: 36, top:  8, width: 17, height: 46, rotate:   0 },
  { id: 'right-4', hand: 'right', fingerIndex: 4, name: '약지', left: 53, top: 12, width: 15, height: 43, rotate:   6 },
  { id: 'right-5', hand: 'right', fingerIndex: 5, name: '소지', left: 69, top: 33, width: 18, height: 28, rotate:  20 },
];

// ─── hand-left.png  (image 2, left hand, thumb at lower-right) ───────────────
const LEFT_HOTSPOTS: FingerHotspotCfg[] = [
  { id: 'left-5',  hand: 'left',  fingerIndex: 5, name: '소지', left: 13, top: 33, width: 18, height: 28, rotate: -20 },
  { id: 'left-4',  hand: 'left',  fingerIndex: 4, name: '약지', left: 32, top: 12, width: 15, height: 43, rotate:  -6 },
  { id: 'left-3',  hand: 'left',  fingerIndex: 3, name: '중지', left: 47, top:  8, width: 17, height: 46, rotate:   0 },
  { id: 'left-2',  hand: 'left',  fingerIndex: 2, name: '검지', left: 65, top: 12, width: 15, height: 43, rotate:   8 },
  { id: 'left-1',  hand: 'left',  fingerIndex: 1, name: '엄지', left: 72, top: 59, width: 22, height: 27, rotate:  42, isThumb: true },
];

// ─── Single finger hotspot button ─────────────────────────────────────────────
function FingerHotspotBtn({
  cfg,
  character,
}: {
  cfg: FingerHotspotCfg;
  character?: Character;
}) {
  const [, setLocation] = useLocation();
  const hasChar = !!character;
  const charColor = character?.color ?? null;
  const isComplete = character?.isCompleted ?? false;
  const labelColor = charColor ? getContrastColor(charColor) : '#555555';

  return (
    <motion.button
      onClick={() => setLocation(`/character/${cfg.id}`)}
      className="absolute flex items-center justify-center cursor-pointer focus-visible:outline-2 focus-visible:outline-primary"
      style={{
        left:   `${cfg.left}%`,
        top:    `${cfg.top}%`,
        width:  `${cfg.width}%`,
        height: `${cfg.height}%`,
        transform:       `rotate(${cfg.rotate}deg)`,
        transformOrigin: 'center center',
        borderRadius: cfg.isThumb
          ? '50%'
          : '50% 50% 35% 35% / 35% 35% 25% 25%',
        backgroundColor: charColor ? `${charColor}72` : 'rgba(255,255,255,0.08)',
        border: hasChar
          ? `2.5px solid ${charColor}`
          : '2px dashed rgba(80,80,80,0.20)',
        transition: 'background-color 0.25s, border-color 0.25s',
      }}
      whileHover={{ scale: 1.09 }}
      whileTap={{ scale: 0.93 }}
      aria-label={`${cfg.name} 손가락 - ${character?.name ?? '인물 만들기'}`}
    >
      {/* Content is counter-rotated so text always reads upright */}
      <div
        className="flex flex-col items-center justify-center gap-0.5 w-full select-none"
        style={{ transform: `rotate(${-cfg.rotate}deg)` }}
      >
        {!hasChar ? (
          <>
            <span className="text-[11px] font-bold text-gray-400 leading-none">+</span>
            <span className="text-[7px] font-semibold text-gray-400 leading-none tracking-tight">{cfg.name}</span>
          </>
        ) : (
          <>
            {isComplete && (
              <span className="text-[9px] leading-none font-bold" style={{ color: labelColor }}>✓</span>
            )}
            <span
              className="text-[8px] font-bold leading-none text-center px-0.5 truncate max-w-full"
              style={{ color: labelColor }}
            >
              {(character!.name || cfg.name).slice(0, 4)}
            </span>
          </>
        )}
      </div>
    </motion.button>
  );
}

// ─── Single hand with PNG background + hotspots ───────────────────────────────
function HandImage({
  imgSrc,
  hotspots,
  characters,
  label,
}: {
  imgSrc: string;
  hotspots: FingerHotspotCfg[];
  characters: Character[];
  label: string;
}) {
  return (
    <div className="flex flex-col items-center w-full">
      {label && (
        <span className="text-sm font-semibold text-muted-foreground mb-2">{label}</span>
      )}
      {/* Preserve native aspect ratio 4419 : 6250 */}
      <div
        className="relative w-full drop-shadow-lg"
        style={{ aspectRatio: '4419 / 6250' }}
      >
        <img
          src={imgSrc}
          alt={label || '손'}
          className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
          draggable={false}
        />
        {hotspots.map((hs) => (
          <FingerHotspotBtn
            key={hs.id}
            cfg={hs}
            character={characters.find((c) => c.id === hs.id)}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function HandCanvas({ characters, showLeftHand }: HandCanvasProps) {
  return (
    <div className="w-full flex items-end justify-center gap-4 md:gap-10 transition-all duration-500">
      {/* Left hand (image 2) — slides in from left when expanded */}
      {showLeftHand && (
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 26 }}
          className="flex-1 max-w-[230px] md:max-w-[260px]"
        >
          <HandImage
            imgSrc="/hand-left.png"
            hotspots={LEFT_HOTSPOTS}
            characters={characters}
            label="왼손"
          />
        </motion.div>
      )}

      {/* Right hand (image 1) — always visible; shrinks when left hand appears */}
      <motion.div
        layout
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className={
          showLeftHand
            ? 'flex-1 max-w-[230px] md:max-w-[260px]'
            : 'w-full max-w-[270px] md:max-w-[310px]'
        }
      >
        <HandImage
          imgSrc="/hand-right.png"
          hotspots={RIGHT_HOTSPOTS}
          characters={characters}
          label={showLeftHand ? '오른손' : ''}
        />
      </motion.div>
    </div>
  );
}
