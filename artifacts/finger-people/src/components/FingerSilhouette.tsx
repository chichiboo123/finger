import { tintColor } from '@/lib/utils';

/**
 * The drawing surface is a single finger in a 320 × 480 box. The editor, the
 * character card and the hand canvas all render the same artwork from these
 * constants, so a drawing always lines up with the finger it was made on.
 */
export const FINGER_BOX = { w: 320, h: 480 } as const;

/** Bounding box of the finger body inside FINGER_BOX. */
export const FINGER_BODY = { x: 86, y: 34, w: 148, h: 412 } as const;

export const FINGER_BODY_PATH =
  'M 160 446 C 108 442 86 412 86 366 C 86 290 87 198 100 118 C 110 57 132 36 160 34 C 188 36 210 57 220 118 C 233 198 234 290 234 366 C 234 412 212 442 160 446 Z';

interface FingerSilhouetteProps {
  /** Character colour; tinted towards white so it stays drawable/readable. */
  baseColor: string;
  className?: string;
}

/** Finger body plus knuckle creases, drawn in FINGER_BOX coordinates. */
export function FingerSilhouetteShapes({ baseColor }: { baseColor: string }) {
  return (
    <>
      <path
        d={FINGER_BODY_PATH}
        fill={tintColor(baseColor)}
        stroke="#D4A070"
        strokeWidth="2.5"
        strokeLinejoin="round"
        className="transition-colors duration-300"
      />
      <path d="M 90 228 Q 160 220 230 228" fill="none" stroke="#C49060" strokeWidth="1.4" strokeLinecap="round" opacity="0.35" />
      <path d="M 88 338 Q 160 330 232 338" fill="none" stroke="#C49060" strokeWidth="1.4" strokeLinecap="round" opacity="0.35" />
      <path d="M 88 410 Q 160 418 232 410" fill="none" stroke="#C49060" strokeWidth="1" strokeLinecap="round" opacity="0.25" />
    </>
  );
}

export function FingerSilhouette({ baseColor, className }: FingerSilhouetteProps) {
  return (
    <svg
      viewBox={`0 0 ${FINGER_BOX.w} ${FINGER_BOX.h}`}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <FingerSilhouetteShapes baseColor={baseColor} />
    </svg>
  );
}
