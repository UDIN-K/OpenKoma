import { ThemeName } from '../types';

export const getThemeGradient = (theme: ThemeName) => {
  switch (theme) {
    case 'cyan-blue': return 'from-[#00D4FF] to-[#7B61FF]';
    case 'rose-orange': return 'from-[#F43F5E] to-[#F97316]';
    case 'emerald-teal': return 'from-[#10B981] to-[#14B8A6]';
    case 'purple-pink': return 'from-[#A855F7] to-[#EC4899]';
    default: return 'from-[#00D4FF] to-[#7B61FF]';
  }
};

export const getThemeColor = (theme: ThemeName) => {
  switch (theme) {
    case 'cyan-blue': return '#00D4FF';
    case 'rose-orange': return '#F43F5E';
    case 'emerald-teal': return '#10B981';
    case 'purple-pink': return '#A855F7';
    default: return '#00D4FF';
  }
};
