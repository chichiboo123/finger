import { Character } from '@/lib/db';
import { MaterialIcon } from './MaterialIcon';
import { motion } from 'framer-motion';
import { getContrastColor, cn } from '@/lib/utils';
import { Link } from 'wouter';

interface HandCanvasProps {
  characters: Character[];
  showRightHand: boolean;
}

interface FingerConfig {
  hand: 'left' | 'right';
  index: 1 | 2 | 3 | 4 | 5;
  name: string;
  rotation: string;
  left: string;
  top: string;
  height: string;
  width: string;
  origin: string;
}

const LEFT_FINGERS: FingerConfig[] = [
  { hand: 'left', index: 1, name: '엄지', rotation: '-45deg', left: '8%', top: '55%', width: '16%', height: '35%', origin: 'bottom center' },
  { hand: 'left', index: 2, name: '검지', rotation: '-15deg', left: '22%', top: '20%', width: '16%', height: '45%', origin: 'bottom center' },
  { hand: 'left', index: 3, name: '중지', rotation: '0deg', left: '42%', top: '10%', width: '16%', height: '50%', origin: 'bottom center' },
  { hand: 'left', index: 4, name: '약지', rotation: '15deg', left: '62%', top: '20%', width: '16%', height: '45%', origin: 'bottom center' },
  { hand: 'left', index: 5, name: '새끼', rotation: '35deg', left: '76%', top: '40%', width: '16%', height: '40%', origin: 'bottom center' },
];

const RIGHT_FINGERS: FingerConfig[] = [
  { hand: 'right', index: 5, name: '새끼', rotation: '-35deg', left: '8%', top: '40%', width: '16%', height: '40%', origin: 'bottom center' },
  { hand: 'right', index: 4, name: '약지', rotation: '-15deg', left: '22%', top: '20%', width: '16%', height: '45%', origin: 'bottom center' },
  { hand: 'right', index: 3, name: '중지', rotation: '0deg', left: '42%', top: '10%', width: '16%', height: '50%', origin: 'bottom center' },
  { hand: 'right', index: 2, name: '검지', rotation: '15deg', left: '62%', top: '20%', width: '16%', height: '45%', origin: 'bottom center' },
  { hand: 'right', index: 1, name: '엄지', rotation: '45deg', left: '76%', top: '55%', width: '16%', height: '35%', origin: 'bottom center' },
];

function Hand({ type, characters }: { type: 'left' | 'right', characters: Character[] }) {
  const configs = type === 'left' ? LEFT_FINGERS : RIGHT_FINGERS;
  
  return (
    <div className="relative w-full max-w-[320px] aspect-square mx-auto">
      {/* Palm */}
      <div className="absolute left-[20%] top-[50%] w-[60%] h-[50%] bg-white rounded-[40px] shadow-sm border border-border z-10" />
      
      {/* Fingers */}
      {configs.map((config) => {
        const charId = `${config.hand}-${config.index}`;
        const character = characters.find(c => c.id === charId);
        
        return (
          <Link key={charId} href={`/character/${charId}`} className="block">
            <motion.div
              className={cn(
                "absolute rounded-t-full rounded-b-2xl border-2 cursor-pointer transition-colors z-0 flex flex-col items-center pt-4",
                character?.isCompleted 
                  ? "border-transparent shadow-md" 
                  : character 
                    ? "border-primary border-dashed bg-primary/5" 
                    : "border-border bg-white hover:bg-muted"
              )}
              style={{
                left: config.left,
                top: config.top,
                width: config.width,
                height: config.height,
                rotate: config.rotation,
                transformOrigin: config.origin,
                backgroundColor: character?.color || (character ? undefined : '#ffffff'),
              }}
              whileHover={{ scale: 1.05, y: -10 }}
              whileTap={{ scale: 0.95 }}
            >
              {character?.isCompleted ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-1 overflow-hidden">
                    {character.drawingDataUrl ? (
                       <img src={character.drawingDataUrl} alt={character.name} className="w-full h-full object-cover" />
                    ) : (
                      <MaterialIcon name="face" className="text-white text-lg" />
                    )}
                  </div>
                  <span 
                    className="text-xs font-bold px-1 text-center truncate w-full"
                    style={{ color: getContrastColor(character.color) }}
                  >
                    {character.name || config.name}
                  </span>
                </>
              ) : character ? (
                <div className="flex flex-col items-center text-primary">
                  <MaterialIcon name="draw" className="mb-1" />
                  <span className="text-xs font-bold truncate max-w-[90%]">{character.name || "작성중"}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-muted-foreground">
                  <MaterialIcon name="add" className="text-xl mb-1" />
                  <span className="text-[10px] font-medium">{config.name}</span>
                </div>
              )}
            </motion.div>
          </Link>
        );
      })}
    </div>
  );
}

export function HandCanvas({ characters, showRightHand }: HandCanvasProps) {
  return (
    <div className={cn(
      "w-full flex items-center justify-center gap-4 md:gap-12 transition-all duration-500",
      showRightHand ? "flex-col md:flex-row" : "flex-row"
    )}>
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-sm"
      >
        <h3 className="text-center font-display font-bold text-lg mb-6 text-foreground">왼손</h3>
        <Hand type="left" characters={characters} />
      </motion.div>
      
      {showRightHand && (
        <motion.div 
          initial={{ opacity: 0, x: 20, width: 0 }}
          animate={{ opacity: 1, x: 0, width: '100%' }}
          className="w-full max-w-sm"
        >
          <h3 className="text-center font-display font-bold text-lg mb-6 text-foreground">오른손</h3>
          <Hand type="right" characters={characters} />
        </motion.div>
      )}
    </div>
  );
}