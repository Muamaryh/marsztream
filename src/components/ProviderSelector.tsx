import { DramaProvider } from '@/types/drama';
import { 
  Sparkles, 
  Flame, 
  Crown, 
  Languages, 
  Clock, 
  Home, 
  Tv, 
  BookOpen, 
  ShieldAlert, 
  Smile 
} from 'lucide-react';

interface ProviderOption {
  id: DramaProvider;
  name: string;
  badge?: string;
  color: string;
  categories: { id: string; name: string; icon: any; params?: Record<string, any> }[];
}

export const PROVIDER_CONFIG: ProviderOption[] = [
  {
    id: 'dramabox',
    name: 'DramaBox',
    badge: 'Popular',
    color: 'from-purple-500 to-indigo-600',
    categories: [
      { id: 'foryou', name: 'Untukmu', icon: Sparkles },
      { id: 'trending', name: 'Trending', icon: Flame },
      { id: 'dubindo', name: 'Dub Indo', icon: Languages, params: { classify: 'terpopuler' } },
      { id: 'vip', name: 'VIP', icon: Crown },
      { id: 'latest', name: 'Terbaru', icon: Clock },
    ],
  },
  {
    id: 'pinedrama',
    name: 'PineDrama',
    badge: 'HD',
    color: 'from-emerald-500 to-teal-600',
    categories: [
      { id: 'foryou', name: 'Untukmu', icon: Sparkles },
      { id: 'trending', name: 'Trending', icon: Flame },
    ],
  },
  {
    id: 'reelshort',
    name: 'ReelShort',
    badge: 'Original',
    color: 'from-amber-500 to-orange-600',
    categories: [
      { id: 'foryou', name: 'Untukmu', icon: Sparkles },
      { id: 'homepage', name: 'Homepage', icon: Home },
    ],
  },
  {
    id: 'shortmax',
    name: 'ShortMax',
    badge: 'Fast',
    color: 'from-cyan-500 to-blue-600',
    categories: [
      { id: 'foryou', name: 'Untukmu', icon: Sparkles },
      { id: 'rekomendasi', name: 'Rekomendasi', icon: Flame },
      { id: 'latest', name: 'Terbaru', icon: Clock },
    ],
  },
  {
    id: 'melolo',
    name: 'Melolo',
    badge: 'Sub Indo',
    color: 'from-sky-500 to-indigo-500',
    categories: [
      { id: 'foryou', name: 'Untukmu', icon: Sparkles },
      { id: 'trending', name: 'Trending', icon: Flame },
      { id: 'latest', name: 'Terbaru', icon: Clock },
      { id: 'anime', name: 'Anime', icon: Smile },
    ],
  },
  {
    id: 'freereels',
    name: 'FreeReels',
    badge: 'No Limit',
    color: 'from-pink-500 to-rose-600',
    categories: [
      { id: 'foryou', name: 'Untukmu', icon: Sparkles },
      { id: 'homepage', name: 'Utama', icon: Home },
      { id: 'animepage', name: 'Anime', icon: Smile },
    ],
  },
  {
    id: 'dramanova',
    name: 'DramaNova',
    badge: 'New',
    color: 'from-rose-500 to-red-600',
    categories: [
      { id: 'home', name: 'Home', icon: Home },
      { id: 'drama18', name: 'Drama 18+', icon: ShieldAlert },
      { id: 'komik', name: 'Komik', icon: BookOpen },
    ],
  },
];

interface ProviderSelectorProps {
  activeProvider: DramaProvider;
  activeCategory: string;
  onSelectProvider: (provider: DramaProvider) => void;
  onSelectCategory: (category: string, params?: Record<string, any>) => void;
}

export function ProviderSelector({
  activeProvider,
  activeCategory,
  onSelectProvider,
  onSelectCategory,
}: ProviderSelectorProps) {
  const currentProviderConfig = PROVIDER_CONFIG.find((p) => p.id === activeProvider) || PROVIDER_CONFIG[0];

  return (
    <div id="providers" className="w-full space-y-4">
      {/* Provider Pill Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
        {PROVIDER_CONFIG.map((p) => {
          const isActive = p.id === activeProvider;
          return (
            <button
              key={p.id}
              onClick={() => onSelectProvider(p.id)}
              className={`relative shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-zinc-800 text-white shadow-lg border border-red-500/50'
                  : 'bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 border border-zinc-800/80'
              }`}
            >
              <span>{p.name}</span>
              {p.badge && (
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                    isActive
                      ? 'bg-red-500 text-white'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {p.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Category Pills for Current Provider */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {currentProviderConfig.categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = cat.id === activeCategory;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id, cat.params)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-red-600 text-white shadow-sm shadow-red-600/30'
                  : 'bg-zinc-900/40 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50 border border-zinc-800/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
