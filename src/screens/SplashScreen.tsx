import { useEffect } from 'react';
import { motion } from 'motion/react';
import { OpenKomaLogo } from '../components/OpenKomaLogo';

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500); // 2.5 seconds duration
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#070B14] relative h-full w-full overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.8, 
          ease: [0.16, 1, 0.3, 1]
        }}
        className="flex flex-col items-center gap-6"
      >
        <motion.div 
          initial={{ y: 20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
          className="drop-shadow-[0_0_32px_rgba(106,196,184,0.3)]"
        >
          <OpenKomaLogo size={120} className="text-white" />
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">OpenKoma</h1>
          <p className="text-[#94A3B8] text-sm tracking-widest uppercase font-medium">AI Intelligence</p>
        </motion.div>
      </motion.div>
      
      {/* Loading Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="absolute bottom-16 flex flex-col items-center gap-3"
      >
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
              className="w-2 h-2 bg-[#6AC4B8] rounded-full"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
