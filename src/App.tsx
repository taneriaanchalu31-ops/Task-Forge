import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Flame, 
  Shield, 
  Music, 
  ShoppingBag, 
  User as UserIcon, 
  Plus, 
  Trash2, 
  Star, 
  Play, 
  Pause, 
  RotateCcw, 
  Award, 
  Zap, 
  Skull, 
  Volume2, 
  VolumeX,
  X,
  Menu,
  AlertTriangle,
  Edit2,
  Camera,
  Save,
  Archive,
  RotateCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- UTILS & CONSTANTS ---
const COOLDOWN = 60 * 60 * 1000; 

function getOrCreateUserId() {
  let id = localStorage.getItem('tf_user_id');
  if (!id) {
    id = 'user_' + Math.random().toString(36).substring(2, 11);
    localStorage.setItem('tf_user_id', id);
  }
  return id;
}

const UID = getOrCreateUserId();

// FIXED: TypeScript signature allows functional updates to prevent build crashes
function useStored<T>(key: string, initial: T): [T, (val: T | ((prev: T) => T)) => void] {
  const fullKey = `${key}_${UID}`;
  const [val, setVal] = useState<T>(() => {
    const s = localStorage.getItem(fullKey);
    if (!s) return initial;
    try { return JSON.parse(s); } catch { return initial; }
  });

  const update = (v: T | ((prev: T) => T)) => {
    setVal(prev => {
      const next = typeof v === 'function' ? (v as (p: T) => T)(prev) : v;
      localStorage.setItem(fullKey, JSON.stringify(next));
      return next;
    });
  };

  return [val, update];
}

const todayStr = () => new Date().toISOString().split('T')[0];
const xpForLevel = (lvl: number) => Math.round(80 + (lvl - 1) * 42);

// --- PREMIUM LOGO COMPONENT ---
function SwordLogo({ size = 44 }: { size?: number }) {
  return (
    <div
      className="rounded-full flex items-center justify-center relative overflow-hidden flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: 'linear-gradient(135deg, #4C1D95 0%, #7C3AED 55%, #A78BFA 100%)',
        boxShadow: '0 4px 18px rgba(124, 58, 237, 0.5)',
      }}
    >
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none">
        <path d="M12 2 L13.3 8.8 L15.8 10.2 L13.3 11 L12 20 L10.7 11 L8.2 10.2 L10.7 8.8 Z" fill="white" />
        <path d="M12 2 L13.3 8.8 L15.8 10.2 L13.3 11 L12 20 Z" fill="#E2E8F0" />
        <rect x="7" y="10.8" width="10" height="1.6" rx="0.4" fill="white" />
        <rect x="10.6" y="12.2" width="2.8" height="5.2" rx="0.3" fill="#CBD5E1" />
        <path d="M10.6 13.4 H13.4 M10.6 14.8 H13.4 M10.6 16.2 H13.4" stroke="#94A3B8" strokeWidth="0.45" />
        <circle cx="12" cy="18.6" r="1.35" fill="white" />
      </svg>
    </div>
  );
}

// --- DATA ---
const VERSES = [
  { text: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13" },
  { text: "Trust in the Lord with all your heart, lean not on your own understanding.", ref: "Proverbs 3:5" },
  { text: "For I know the plans I have for you, declares the Lord.", ref: "Jeremiah 29:11" },
  { text: "The Lord is my shepherd; I shall not want.", ref: "Psalm 23:1" },
  { text: "But seek first the kingdom of God and his righteousness.", ref: "Matthew 6:33" },
  { text: "Let all that you do be done in love.", ref: "1 Corinthians 16:14" },
  { text: "Be strong and courageous. Do not be afraid; do not be discouraged.", ref: "Joshua 1:9" },
  { text: "The Lord is my light and my salvation—whom shall I fear?", ref: "Psalm 27:1" },
  { text: "Faith is the assurance of things hoped for.", ref: "Hebrews 11:1" },
  { text: "Rejoice always, pray without ceasing.", ref: "1 Thessalonians 5:16" },
  { text: "Give thanks to the Lord, for he is good.", ref: "Psalm 107:1" },
  { text: "God is our refuge and strength, an ever-present help in trouble.", ref: "Psalm 46:1" },
  { text: "Peace I leave with you; my peace I give you.", ref: "John 14:27" },
  { text: "A joyful heart is good medicine.", ref: "Proverbs 17:22" },
  { text: "Your word is a lamp for my feet, a light on my path.", ref: "Psalm 119:105" }
];

const EMOJIS = ["🔥","⭐","📖","💪","🥗","💧","🧘","🧠","🛠️","🎸","🎨","💻","🏃","🚶","🏀","⚽","🍎","🥦","🥑","🥛","🍵","☕","🌅","🌙","✨","⚡","💎","🎯","🏹","🛡️","🚀","🛸","🏔️","🌊","🌳","🌿","🌻","🕊️","🦁","🐺","🦊","🐾","🏠","🧹","🧺","💰","📈","📚","🖋️","🎹","🥁","🎷","🎺","🎻","🧘‍♀️","🛌","🚿","🦷","🧸"];

const SHOP = [
  // Titles
  { id: 't-novice', type: 'title', name: 'The Novice', rarity: 'common', price: 0 },
  { id: 't-slayer', type: 'title', name: 'Goblin Slayer', rarity: 'uncommon', price: 150 },
  { id: 't-knight', type: 'title', name: 'Holy Knight', rarity: 'rare', price: 400 },
  { id: 't-grand', type: 'title', name: 'Grandmaster', rarity: 'epic', price: 900 },
  { id: 't-saint', type: 'title', name: 'The Sainted', rarity: 'legendary', price: 2000 },
  { id: 't-ethio', type: 'title', name: 'Lion of Judah', rarity: 'mythic', price: 5000 },
  { id: 't-monk', type: 'title', name: 'Silent Monk', rarity: 'rare', price: 450 },
  { id: 't-titan', type: 'title', name: 'Focus Titan', rarity: 'epic', price: 1100 },
  { id: 't-seraph', type: 'title', name: 'Seraphim', rarity: 'mythic', price: 5500 },
  { id: 't-conq', type: 'title', name: 'World Conqueror', rarity: 'legendary', price: 2500 },
  { id: 't-scribe', type: 'title', name: 'Ancient Scribe', rarity: 'uncommon', price: 200 },
  { id: 't-chosen', type: 'title', name: 'The Chosen', rarity: 'rare', price: 600 },
  { id: 't-valor', type: 'title', name: 'Heart of Valor', rarity: 'epic', price: 1300 },
  { id: 't-immortal', type: 'title', name: 'The Immortal', rarity: 'mythic', price: 10000 },
  { id: 't-lofi', type: 'title', name: 'Lofi Scholar', rarity: 'common', price: 50 },
  { id: 't-beast', type: 'title', name: 'The Beast', rarity: 'epic', price: 1500 },
  { id: 't-king', type: 'title', name: 'High King', rarity: 'legendary', price: 3500 },
  { id: 't-eternal', type: 'title', name: 'Eternal Soul', rarity: 'mythic', price: 8000 },

  // Avatars
  { id: 'a-fox', type: 'avatar', name: 'Swift Fox', rarity: 'common', price: 0 },
  { id: 'a-wolf', type: 'avatar', name: 'Grey Wolf', rarity: 'uncommon', price: 200 },
  { id: 'a-lion', type: 'avatar', name: 'Gold Lion', rarity: 'rare', price: 500 },
  { id: 'a-eagle', type: 'avatar', name: 'Soaring Eagle', rarity: 'epic', price: 1200 },
  { id: 'a-dragon', type: 'avatar', name: 'Ancient Drake', rarity: 'legendary', price: 3000 },
  { id: 'a-angel', type: 'avatar', name: 'Guardian', rarity: 'mythic', price: 7000 },
  { id: 'a-bear', type: 'avatar', name: 'Grizzly', rarity: 'uncommon', price: 250 },
  { id: 'a-tiger', type: 'avatar', name: 'White Tiger', rarity: 'rare', price: 600 },
  { id: 'a-owl', type: 'avatar', name: 'Wise Owl', rarity: 'common', price: 100 },
  { id: 'a-phoenix', type: 'avatar', name: 'Firebird', rarity: 'legendary', price: 3500 },
  { id: 'a-knight-1', type: 'avatar', name: 'Paladin', rarity: 'rare', price: 550 },
  { id: 'a-mage', type: 'avatar', name: 'Arcane Mage', rarity: 'epic', price: 1400 },
  { id: 'a-monk-1', type: 'avatar', name: 'Shaolin', rarity: 'rare', price: 650 },
  { id: 'a-ronin', type: 'avatar', name: 'Ronin', rarity: 'epic', price: 1600 },
  { id: 'a-valk', type: 'avatar', name: 'Valkyrie', rarity: 'legendary', price: 4000 },
  { id: 'a-spirit', type: 'avatar', name: 'Blue Spirit', rarity: 'mythic', price: 9000 },
  { id: 'a-cat', type: 'avatar', name: 'Void Cat', rarity: 'common', price: 150 },
  { id: 'a-deer', type: 'avatar', name: 'Silver Stag', rarity: 'rare', price: 700 },
  { id: 'a-hawk', type: 'avatar', name: 'Falcon', rarity: 'uncommon', price: 300 },
  { id: 'a-god', type: 'avatar', name: 'The Creator', rarity: 'mythic', price: 15000 },

  // Frames
  { id: 'f-none', type: 'frame', name: 'Simple Wood', rarity: 'common', price: 0 },
  { id: 'f-steel', type: 'frame', name: 'Cold Steel', rarity: 'uncommon', price: 300 },
  { id: 'f-gold', type: 'frame', name: 'Gilded Sun', rarity: 'rare', price: 750 },
  { id: 'f-ruby', type: 'frame', name: 'Ruby Shard', rarity: 'epic', price: 1500 },
  { id: 'f-diamond', type: 'frame', name: 'Frost Diamond', rarity: 'legendary', price: 4000 },
  { id: 'f-nebula', type: 'frame', name: 'Nebula Flow', rarity: 'mythic', price: 8500 },
  { id: 'f-nature', type: 'frame', name: 'Living Vine', rarity: 'rare', price: 800 },
  { id: 'f-shadow', type: 'frame', name: 'Void Edge', rarity: 'epic', price: 1800 },
  { id: 'f-royal', type: 'frame', name: 'Imperial', rarity: 'legendary', price: 4500 },
  { id: 'f-holy', type: 'frame', name: 'Halo Burst', rarity: 'mythic', price: 9500 },
  { id: 'f-copper', type: 'frame', name: 'Copper Gear', rarity: 'uncommon', price: 350 },
  { id: 'f-obsid', type: 'frame', name: 'Obsidian', rarity: 'rare', price: 900 },
  { id: 'f-prism', type: 'frame', name: 'Prism', rarity: 'epic', price: 2000 },
  { id: 'f-dragon', type: 'frame', name: 'Dragon Scale', rarity: 'legendary', price: 5000 },

  // Themes
  { id: 'th-violet', type: 'theme', name: 'Royal Violet', rarity: 'common', price: 0 },
  { id: 'th-emerald', type: 'theme', name: 'Forest Emerald', rarity: 'uncommon', price: 500 },
  { id: 'th-amber', type: 'theme', name: 'Golden Amber', rarity: 'rare', price: 1000 },
  { id: 'th-crimson', type: 'theme', name: 'Blood Crimson', rarity: 'epic', price: 2000 },
  { id: 'th-ocean', type: 'theme', name: 'Deep Ocean', rarity: 'rare', price: 1200 },
  { id: 'th-mono', type: 'theme', name: 'Obsidian', rarity: 'common', price: 100 },
  { id: 'th-rose', type: 'theme', name: 'Pink Rose', rarity: 'rare', price: 1100 },
  { id: 'th-cyber', type: 'theme', name: 'Cyber Neon', rarity: 'epic', price: 2500 },
  { id: 'th-heaven', type: 'theme', name: 'Cloud White', rarity: 'legendary', price: 5000 },
  { id: 'th-void', type: 'theme', name: 'The Void', rarity: 'mythic', price: 12000 },
  { id: 'th-sunset', type: 'theme', name: 'Sunset', rarity: 'uncommon', price: 600 },
  { id: 'th-mint', type: 'theme', name: 'Mint Leaf', rarity: 'uncommon', price: 550 },
  { id: 'th-ice', type: 'theme', name: 'Glacier', rarity: 'rare', price: 1300 },
  { id: 'th-gold', type: 'theme', name: 'Solid Gold', rarity: 'legendary', price: 6000 },
  { id: 'th-nebula', type: 'theme', name: 'Deep Space', rarity: 'mythic', price: 15000 },
  { id: 'th-lava', type: 'theme', name: 'Magma', rarity: 'epic', price: 2800 },
  { id: 'th-coffee', type: 'theme', name: 'Espresso', rarity: 'common', price: 200 },
  { id: 'th-dracula', type: 'theme', name: 'Vampire', rarity: 'rare', price: 1400 },
];

const BOSSES = [
  { name: 'Sloth Demon', img: '🦥' },
  { name: 'Procrastination King', img: '👑' },
  { name: 'Distraction Hydra', img: '🐍' },
  { name: 'Chaos Elemental', img: '🌀' },
  { name: 'Doubt Shadow', img: '👤' },
  { name: 'Time Thief', img: '⏳' },
];

const SPOTIFY_PLAYLISTS = [
  { id: '0vvXsWCc8UbPnJsJQ6COjM', name: 'Lofi Study', category: 'Lofi' },
  { id: '37i9dQZF1DWWQRwui0ExPn', name: 'Chill Lofi', category: 'Lofi' },
  { id: '37i9dQZF1DXbITWG1ZJKYt', name: 'Smooth Jazz', category: 'Jazz' },
  { id: '37i9dQZF1DX0SM0LYsmbMT', name: 'Jazz Vibes', category: 'Jazz' },
  { id: '37i9dQZF1DX2sUQwCrRBp3', name: 'Christian Worship', category: 'Christian' },
  { id: '37i9dQZF1DWVYgqMRn8LPz', name: 'Worship Focus', category: 'Christian' },
  { id: '37i9dQZF1DWU0sBdra9L8j', name: 'Gospel Choirs', category: 'Christian' },
  { id: '37i9dQZF1DWYkaFifGgcCR', name: 'Ethiopian 🇪🇹', category: 'Ethiopian' },
  { id: '37i9dQZF1DWYV7OOteHjSD', name: 'African Gospel', category: 'Ethiopian' },
  { id: '37i9dQZF1DX4sWSpwq3LiO', name: 'Peaceful Piano', category: 'Piano' },
  { id: '37i9dQZF1DWWEJlAGA9gs0', name: 'Classical Study', category: 'Classical' },
  { id: '37i9dQZF1DX4aYNO8X5RpR', name: 'Nature Sounds', category: 'Nature' },
  { id: '37i9dQZF1DXbcPC6Vvqudd', name: 'Rain Sounds', category: 'Nature' },
  { id: '37i9dQZF1DXdLEN7aqioXM', name: 'Synthwave', category: 'Electronic' },
  { id: '37i9dQZF1DWZeKCadgRdKQ', name: 'Deep Focus', category: 'Focus' },
  { id: '37i9dQZF1DX9sIqqvKsj3N', name: 'Instrumental', category: 'Focus' },
];

const FOCUS_PRESETS = [
  { label: 'Quick 10', mins: 10 },
  { label: 'Sprint 25', mins: 25 },
  { label: 'Deep 50', mins: 50 },
  { label: 'Marathon 90', mins: 90 },
];

// --- SOUND ENGINE ---
type SoundType = 'rain' | 'ocean' | 'cafe' | 'white' | 'pink' | 'brown' | 'binaural';

class FocusAudio {
  private ctx: AudioContext | null = null;
  private nodes: Map<SoundType, { gain: GainNode; source: AudioNode }> = new Map();

  private init() {
    if (!this.ctx) {
      // FIXED: Safely instantiate AudioContext for TypeScript
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  toggle(type: SoundType, volume: number) {
    this.init();
    if (this.nodes.has(type)) {
      const { gain } = this.nodes.get(type)!;
      gain.gain.linearRampToValueAtTime(0, this.ctx!.currentTime + 0.5);
      setTimeout(() => {
        this.nodes.get(type)?.source.disconnect();
        this.nodes.delete(type);
      }, 600);
    } else {
      const gain = this.ctx!.createGain();
      gain.gain.setValueAtTime(0, this.ctx!.currentTime);
      gain.connect(this.ctx!.destination);
      gain.gain.linearRampToValueAtTime(volume, this.ctx!.currentTime + 1);
      
      const source = this.createNode(type);
      source.connect(gain);
      this.nodes.set(type, { gain, source });
    }
  }

  updateVolume(type: SoundType, volume: number) {
    if (this.nodes.has(type)) {
      this.nodes.get(type)!.gain.gain.setTargetAtTime(volume, this.ctx!.currentTime, 0.1);
    }
  }

  private createNode(type: SoundType): AudioNode {
    const bufferSize = 2 * this.ctx!.sampleRate;
    const node = this.ctx!.createScriptProcessor(bufferSize, 1, 1);
    
    if (type === 'white' || type === 'pink' || type === 'brown' || type === 'rain' || type === 'ocean' || type === 'cafe') {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      let lastOut = 0;
      
      node.onaudioprocess = (e) => {
        const out = e.outputBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          if (type === 'white') out[i] = white;
          else if (type === 'pink') {
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            out[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            out[i] *= 0.11;
            b6 = white * 0.115926;
          } else if (type === 'brown' || type === 'ocean') {
            const softness = type === 'ocean' ? 0.03 : 0.02;
            lastOut = (lastOut + (softness * white)) / 1.02;
            out[i] = lastOut * 3.5;
            if (type === 'ocean') out[i] *= (0.5 + 0.5 * Math.sin(i / 10000));
          } else if (type === 'rain') {
            lastOut = (lastOut + (0.04 * white)) / 1.01;
            out[i] = (lastOut + (Math.random() > 0.98 ? white * 0.2 : 0)) * 0.5;
          } else if (type === 'cafe') {
            lastOut = (lastOut + (0.02 * white)) / 1.01;
            const chatter = Math.sin(i / 50) * 0.02 * Math.random();
            out[i] = lastOut + chatter;
          }
        }
      };
      return node;
    } else {
      const osc1 = this.ctx!.createOscillator();
      const osc2 = this.ctx!.createOscillator();
      osc1.type = 'sine'; osc2.type = 'sine';
      osc1.frequency.value = 100; 
      osc2.frequency.value = 110; 
      osc1.start(); osc2.start();
      const m = this.ctx!.createGain();
      osc1.connect(m); osc2.connect(m);
      return m;
    }
  }
}
const audioMgr = new FocusAudio();

// --- COMPONENTS ---

const Notification = ({ msg, onClear }: { msg: string, onClear: () => void }) => {
  useEffect(() => { const t = setTimeout(onClear, 3000); return () => clearTimeout(t); }, [onClear]);
  return (
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}
      className="fixed bottom-24 right-6 bg-violet-600 text-white px-6 py-3 rounded-2xl shadow-xl z-50 flex items-center gap-3 border border-violet-400/30">
      <Award className="text-yellow-300" /> {msg}
    </motion.div>
  );
};

function makeBoss(defeatCount: number, heroLevel: number) {
  const template = BOSSES[defeatCount % BOSSES.length];
  const lvl = Math.max(1, heroLevel + defeatCount);
  const hp = Math.round(90 + lvl * 35);
  return { 
    ...template, 
    level: lvl, 
    hp, 
    maxHp: hp, 
    rewardGold: Math.round(30 + lvl * 8), 
    rewardXp: Math.round(40 + lvl * 10),
    defeatCount
  };
}

export default function TaskForge() {
  const [activeTab, setActiveTab] = useStored('tf_tab_v4', 'dash');
  const [hero, setHero] = useStored('tf_hero_v4', { 
    name: 'Hero', level: 1, xp: 0, gold: 40, streak: 1, lastLogin: todayStr() 
  });
  const [eq, setEq] = useStored('tf_eq_v4', { 
    frame: 'f-none', theme: 'th-violet', title: 't-novice', avatar: 'a-fox' 
  });
  const [inv, setInv] = useStored('tf_inv_v4', ['t-novice', 'a-fox', 'f-none', 'th-violet']);
  const [habits, setHabits] = useStored<any[]>('tf_habits_v4', []);
  const [todos, setTodos] = useStored<any[]>('tf_todos_v4', []);
  const [boss, setBoss] = useStored('tf_boss_v4', makeBoss(0, 1));
  const [notif, setNotif] = useState<string | null>(null);
  const [showTut, setShowTut] = useStored('tf_show_tutorial', true);
  const [tutStep, setTutStep] = useState(0);
  const [lastAtk, setLastAtk] = useStored('tf_atk_v4', 0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Focus States
  const [hiddenPlaylists, setHiddenPlaylists] = useStored<string[]>('tf_hidden_spotify_v1', []);
  const [customPlaylists, setCustomPlaylists] = useStored<any[]>('tf_custom_spotify_v1', []);
  const [showHiddenBin, setShowHiddenBin] = useState(false);

  const touch = () => setHero({ ...hero });

  const grantXp = (amt: number) => {
    let newXp = hero.xp + amt;
    let newLvl = hero.level;
    let bonusGold = 0;
    while (newXp >= xpForLevel(newLvl)) {
      newXp -= xpForLevel(newLvl);
      newLvl++;
      bonusGold += 25;
    }
    setHero({ ...hero, level: newLvl, xp: newXp, gold: hero.gold + bonusGold });
    if (bonusGold > 0) setNotif(`LEVEL UP! Reached lvl ${newLvl}. +${bonusGold} Gold!`);
  };

  const grantGold = (amt: number) => setHero(h => ({ ...h, gold: h.gold + amt }));

  const damageBoss = (dmg: number) => {
    const newHp = Math.max(0, boss.hp - dmg);
    if (newHp === 0) {
      setNotif(`VICTORY! Defeated ${boss.name}! +${boss.rewardGold} Gold.`);
      grantGold(boss.rewardGold);
      grantXp(boss.rewardXp);
      setBoss(makeBoss(boss.defeatCount + 1, hero.level));
    } else {
      setBoss({ ...boss, hp: newHp });
    }
  };

  const dailyReset = () => {
    const t = todayStr();
    if (hero.lastLogin !== t) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().split('T')[0];
      const newStreak = (hero.lastLogin === yStr) ? hero.streak + 1 : 1;
      setHero({ ...hero, streak: newStreak, lastLogin: t });
    }
  };
  useEffect(dailyReset, []);

  const themeColor = useMemo(() => {
    const themes: any = {
      'th-violet': 'from-violet-600 to-indigo-700',
      'th-emerald': 'from-emerald-600 to-teal-700',
      'th-amber': 'from-amber-500 to-orange-600',
      'th-crimson': 'from-red-600 to-rose-700',
      'th-ocean': 'from-blue-500 to-cyan-600',
      'th-mono': 'from-gray-700 to-slate-900',
      'th-rose': 'from-pink-500 to-rose-400',
      'th-cyber': 'from-fuchsia-600 to-blue-500',
      'th-heaven': 'from-blue-200 to-indigo-300',
      'th-void': 'from-purple-900 to-black',
      'th-sunset': 'from-orange-400 to-red-500',
      'th-mint': 'from-green-300 to-emerald-500',
      'th-ice': 'from-cyan-200 to-blue-400',
      'th-gold': 'from-yellow-400 to-amber-600',
      'th-nebula': 'from-indigo-600 to-purple-800',
      'th-lava': 'from-orange-700 to-red-800',
      'th-coffee': 'from-stone-600 to-orange-900',
      'th-dracula': 'from-purple-900 to-red-900',
    };
    return themes[eq.theme] || themes['th-violet'];
  }, [eq.theme]);

  // --- VIEWS ---

  const Sidebar = () => (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/90 backdrop-blur-xl border-r border-slate-800 transition-transform lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-6 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-10">
          <SwordLogo size={42} />
          <h1 className="text-xl font-black tracking-tighter bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">TASK FORGE</h1>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'dash', icon: LayoutDashboard, label: 'Sanctum' },
            { id: 'habits', icon: Flame, label: 'Habit Forge' },
            { id: 'todos', icon: CheckSquare, label: 'Quest Log' },
            { id: 'focus', icon: Music, label: 'Focus Chamber' },
            { id: 'loot', icon: ShoppingBag, label: 'Loot Locker' },
          ].map(t => (
            <button key={t.id} onClick={() => { setActiveTab(t.id); setIsMobileMenuOpen(false); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === t.id ? 'bg-violet-600 text-white shadow-lg shadow-violet-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <t.icon size={20} />
              <span className="font-bold">{t.label}</span>
            </button>
          ))}
        </nav>

        <div className="mt-auto p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-600 flex items-center justify-center font-bold text-white">
              {hero.level}
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-black">Level</p>
              <p className="text-sm font-bold text-white">{hero.xp} / {xpForLevel(hero.level)} XP</p>
            </div>
          </div>
          <div className="mt-3 h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-violet-500" style={{ width: `${(hero.xp / xpForLevel(hero.level)) * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );

  const Tut = () => {
    const steps = [
      { t: "Welcome, Warrior", d: "Forge your life into an RPG. Complete habits and quests to level up and defeat bosses." },
      { t: "The Sanctum", d: "Your profile is here. Upload a photo, change your name, and see your daily Bible verse." },
      { t: "Quest Log Secrets", d: "Quests help you slay the boss. Mark them Urgent (Today) or Important (Future Goals).", extra: (
        <div className="grid grid-cols-2 gap-2 text-left text-[11px] mt-2">
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <div className="font-black text-red-400 mb-1 flex items-center gap-1"><AlertTriangle size={12} /> URGENT</div>
            <p className="text-gray-400 italic">Do it now or it burns.</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
            <div className="font-black text-blue-400 mb-1 flex items-center gap-1"><Star size={12} /> IMPORTANT</div>
            <p className="text-gray-400 italic">Matters for your future self.</p>
          </div>
        </div>
      )},
      { t: "Habit Forge", d: "Build consistency. Toggle habits daily. You only get rewards once per day—no cheating!" },
      { t: "The Daily Boss", d: "Your activities damage the Boss. Defeat them for massive Gold and XP rewards." },
      { t: "Focus Chamber", d: "Use the deep-work timer and built-in noise engine/Spotify vibes to stay productive." },
      { t: "Loot Locker", d: "Spend your earned gold on new titles, avatars, frames, and themes." },
      { t: "One More Thing...", d: "Your data is private to you on this device. Now, go conquer your day!" }
    ];
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="bg-slate-900 border border-violet-500/30 p-8 rounded-3xl max-w-md w-full shadow-2xl text-center">
          <div className="w-20 h-20 bg-violet-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg shadow-violet-900/40">
            <Shield size={40} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-wide">{steps[tutStep].t}</h2>
          <p className="text-slate-400 leading-relaxed mb-6">{steps[tutStep].d}</p>
          {steps[tutStep].extra}
          <div className="flex gap-3">
            {tutStep > 0 && <button onClick={() => setTutStep(s => s - 1)} className="flex-1 py-3 rounded-xl bg-slate-800 text-white font-bold">Back</button>}
            <button onClick={() => tutStep < steps.length - 1 ? setTutStep(s => s + 1) : setShowTut(false)}
              className="flex-1 py-3 rounded-xl bg-violet-600 text-white font-bold shadow-lg shadow-violet-900/30">
              {tutStep === steps.length - 1 ? "Let's Go!" : "Continue"}
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  const Dashboard = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [newName, setNewName] = useState(hero.name);
    const hour = new Date().getHours();
    const verse = VERSES[hour % VERSES.length];

    const handleProfileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 200; canvas.height = 200;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, 200, 200);
            localStorage.setItem(`tf_pfp_${UID}`, canvas.toDataURL());
            touch();
          };
          img.src = ev.target?.result as string;
        };
        reader.readAsDataURL(file);
      }
    };

    const pfp = localStorage.getItem(`tf_pfp_${UID}`) || null;

    const quickAttack = () => {
      const now = Date.now();
      if (now - lastAtk < COOLDOWN) return;
      const dmg = 12 + hero.level * 4;
      damageBoss(dmg);
      grantXp(15);
      setLastAtk(now);
      setNotif(`Quick Attack! -${dmg} HP to Boss.`);
    };

    const nextAtk = lastAtk + COOLDOWN;
    const isAtkReady = Date.now() >= nextAtk;

    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className={`relative p-8 rounded-[2.5rem] bg-gradient-to-br ${themeColor} shadow-2xl overflow-hidden border border-white/10 group`}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-white/20 transition-all duration-700" />
          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full border-4 ${eq.frame === 'f-gold' ? 'border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.5)]' : eq.frame === 'f-steel' ? 'border-slate-300' : 'border-white/20'} overflow-hidden bg-slate-800 shadow-xl`}>
                {pfp ? (
                  <img src={pfp} className="w-full h-full object-cover" alt="Profile" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-700">
                    <UserIcon size={48} className="text-slate-400" />
                  </div>
                )}
              </div>
              <label className="absolute bottom-1 right-1 w-10 h-10 bg-white text-violet-600 rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 active:scale-95 transition-all">
                <Camera size={18} />
                <input type="file" hidden accept="image/*" onChange={handleProfileUpload} />
              </label>
            </div>

            <div className="text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input autoFocus className="bg-white/20 border-b-2 border-white text-white font-black text-3xl outline-none px-2 w-48 rounded" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && (setHero({ ...hero, name: newName }), setIsEditing(false))} />
                    <button onClick={() => { setHero({ ...hero, name: newName }); setIsEditing(false); }} className="p-2 bg-white text-violet-600 rounded-lg"><Save size={20} /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <h2 className="text-4xl font-black text-white tracking-tight drop-shadow-sm">{hero.name}</h2>
                    <button onClick={() => setIsEditing(true)} className="text-white/60 hover:text-white transition-colors"><Edit2 size={20} /></button>
                  </div>
                )}
              </div>
              <p className="text-white/80 font-black text-lg mb-6 flex items-center justify-center md:justify-start gap-2">
                <Award size={20} /> {SHOP.find(s => s.id === eq.title)?.name || 'The Novice'}
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                <div className="bg-black/20 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
                  <p className="text-white/60 text-[10px] uppercase font-black">Gold Crystals</p>
                  <p className="text-2xl font-black text-yellow-300">🪙 {hero.gold}</p>
                </div>
                <div className="bg-black/20 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10">
                  <p className="text-white/60 text-[10px] uppercase font-black">Daily Streak</p>
                  <p className="text-2xl font-black text-orange-400">🔥 {hero.streak}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-[2rem] flex flex-col items-center justify-center text-center">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Light for the Hour</h3>
            <p className="text-4xl md:text-5xl font-black text-white italic leading-tight mb-4 tracking-tight drop-shadow-md">"{verse.text}"</p>
            <p className="text-violet-400 font-bold uppercase tracking-widest">- {verse.ref}</p>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Skull size={120} />
            </div>
            <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
              <div>
                <p className="text-xs font-black text-red-500 uppercase tracking-wider mb-1">Active Boss Fight</p>
                <h3 className="text-3xl font-black text-white">{boss.name} <span className="text-slate-500 text-lg">LVL {boss.level}</span></h3>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-slate-500 uppercase">Reward Pool</p>
                <p className="text-xl font-black text-yellow-400">🪙 {boss.rewardGold}   <span className="text-violet-400">✨ {boss.rewardXp}</span></p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="relative h-14 bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-inner">
                <motion.div initial={{ width: 0 }} animate={{ width: `${(boss.hp / boss.maxHp) * 100}%` }}
                  className="h-full bg-gradient-to-r from-red-600 to-rose-500 shadow-[0_0_20px_rgba(225,29,72,0.4)]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-black text-lg drop-shadow-md">{boss.hp} / {boss.maxHp} HP</span>
                </div>
              </div>
              
              <button 
                onClick={quickAttack}
                disabled={!isAtkReady}
                className={`w-full py-5 rounded-2xl flex items-center justify-center gap-3 font-black text-xl transition-all shadow-xl ${isAtkReady ? 'bg-red-600 text-white hover:bg-red-500 hover:-translate-y-1 shadow-red-900/20' : 'bg-slate-800 text-slate-500 grayscale cursor-not-allowed opacity-50'}`}>
                <Zap size={24} className={isAtkReady ? "fill-white" : ""} />
                {isAtkReady ? 'QUICK ATTACK' : 'CHARGING ATTACK...'}
              </button>
              {!isAtkReady && (
                <p className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Ready in {Math.ceil((nextAtk - Date.now()) / 60000)} mins
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Habits = () => {
    const [newHabit, setNewHabit] = useState('');
    const [newIcon, setNewIcon] = useState('🔥');
    const today = todayStr();

    const addHabit = () => {
      if (!newHabit) return;
      const h = { id: Date.now(), title: newHabit, icon: newIcon, streak: 0, longestStreak: 0, completedDates: [], rewardedDates: [] };
      setHabits([...habits, h]);
      setNewHabit('');
    };

    const toggleHabit = (id: number) => {
      const updated = habits.map(h => {
        if (h.id !== id) return h;
        const newDates = h.completedDates.includes(today) ? h.completedDates.filter((d: string) => d !== today) : [...h.completedDates, today];
        const alreadyRewarded = h.rewardedDates?.includes(today);
        
        let newStreak = h.streak;
        if (newDates.includes(today)) {
          newStreak++;
          if (!alreadyRewarded) {
            grantXp(20); grantGold(8); damageBoss(10); touch();
            setNotif("Consistency pays off! +8 Gold, +20 XP");
          }
        } else {
          newStreak = Math.max(0, newStreak - 1);
        }

        return { 
          ...h, 
          completedDates: newDates, 
          streak: newStreak, 
          longestStreak: Math.max(h.longestStreak || 0, newStreak),
          rewardedDates: alreadyRewarded ? h.rewardedDates : (newDates.includes(today) ? [...(h.rewardedDates || []), today] : h.rewardedDates)
        };
      });
      setHabits(updated);
    };

    const deleteHabit = (id: number) => {
      if (confirm('Delete this habit? Progress will be lost.')) setHabits(habits.filter(h => h.id !== id));
    };

    return (
      <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-6 duration-700">
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-black text-white mb-2">HABIT FORGE</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest">Build consistent strength daily</p>
        </div>

        <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 mb-8 flex gap-4">
          <div className="relative group">
            <button className="w-14 h-14 bg-slate-800 rounded-2xl flex items-center justify-center text-2xl hover:bg-slate-700 transition-colors border border-slate-700">{newIcon}</button>
            <div className="absolute top-full left-0 mt-2 p-3 bg-slate-800 border border-slate-700 rounded-2xl hidden group-hover:grid grid-cols-6 gap-2 z-50 shadow-2xl w-64 h-64 overflow-y-auto custom-scroll">
              {EMOJIS.map(e => <button key={e} onClick={() => setNewIcon(e)} className="hover:bg-slate-700 p-2 rounded-lg transition-colors">{e}</button>)}
            </div>
          </div>
          <input className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-6 font-bold text-white focus:ring-2 focus:ring-violet-500 outline-none placeholder:text-slate-600"
            placeholder="Add new habit... (e.g. Read Word, Exercise)" value={newHabit} onChange={e => setNewHabit(e.target.value)} onKeyDown={e => e.key === 'Enter' && addHabit()} />
          <button onClick={addHabit} className="bg-violet-600 hover:bg-violet-500 text-white px-8 rounded-2xl font-black transition-all active:scale-95 shadow-lg shadow-violet-900/20">ADD</button>
        </div>

        <div className="grid gap-4">
          {habits.map(h => {
            const doneToday = h.completedDates.includes(today);
            return (
              <motion.div layout key={h.id} className={`p-6 rounded-3xl border transition-all ${doneToday ? 'bg-violet-600/10 border-violet-500/50' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}>
                <div className="flex items-center gap-6">
                  <button onClick={() => toggleHabit(h.id)} className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl transition-all transform active:scale-90 shadow-lg ${doneToday ? 'bg-violet-600 shadow-violet-900/40 rotate-6' : 'bg-slate-800 grayscale border border-slate-700'}`}>
                    {h.icon}
                  </button>
                  <div className="flex-1">
                    <h4 className={`text-xl font-black mb-1 ${doneToday ? 'text-white' : 'text-slate-300'}`}>{h.title}</h4>
                    <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest">
                      <span className="text-orange-500 flex items-center gap-1"><Flame size={14} /> {h.streak} Day Streak</span>
                      <span className="text-slate-500">Best: {h.longestStreak || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex gap-1">
                      {[...Array(7)].map((_, i) => {
                        const d = new Date(); d.setDate(d.getDate() - (6 - i));
                        const dS = d.toISOString().split('T')[0];
                        const active = h.completedDates.includes(dS);
                        return <div key={i} className={`w-3 h-8 rounded-full ${active ? 'bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.5)]' : 'bg-slate-800'}`} />;
                      })}
                    </div>
                    <button onClick={() => deleteHabit(h.id)} className="p-2 text-slate-600 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </div>
              </motion.div>
            );
          })}
          {habits.length === 0 && <div className="text-center py-20 text-slate-600 font-bold bg-slate-900/30 rounded-[3rem] border-2 border-dashed border-slate-800">No habits forged yet. Create one above!</div>}
        </div>
      </div>
    );
  };

  const Todos = () => {
    const [newTodo, setNewTodo] = useState('');
    const [urgent, setUrgent] = useState(false);
    const [important, setImportant] = useState(false);

    const addTodo = () => {
      if (!newTodo) return;
      const t = { id: Date.now(), text: newTodo, urgent, important, completed: false, rewardClaimed: false };
      setTodos([...todos, t]);
      setNewTodo(''); setUrgent(false); setImportant(false);
    };

    const toggleTodo = (id: number) => {
      setTodos(todos.map(t => {
        if (t.id !== id) return t;
        if (t.completed) return { ...t, completed: false };
        
        if (!t.rewardClaimed) {
          const xp = t.important ? 30 : 20;
          const gold = t.important ? 12 : 8;
          const dmg = t.urgent ? 15 : 10;
          grantXp(xp); grantGold(gold); damageBoss(dmg);
          setNotif(`Quest Complete! +${gold} Gold, +${xp} XP`);
          return { ...t, completed: true, rewardClaimed: true };
        }
        return { ...t, completed: true };
      }));
    };

    const deleteTodo = (id: number) => {
      if (confirm('Abandon this quest?')) setTodos(todos.filter(t => t.id !== id));
    };

    return (
      <div className="max-w-3xl mx-auto animate-in zoom-in-95 duration-700">
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-black text-white mb-2 tracking-tight">QUEST LOG</h2>
          <p className="text-slate-400 font-bold uppercase tracking-widest">Slay your tasks, earn your glory</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl mb-12">
          <input className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-6 py-4 font-bold text-xl text-white outline-none focus:ring-2 focus:ring-violet-500 mb-6 placeholder:text-slate-600 shadow-inner"
            placeholder="What is your next mission?" value={newTodo} onChange={e => setNewTodo(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTodo()} />
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-3">
              <button onClick={() => setUrgent(!urgent)} className={`px-5 py-3 rounded-xl font-black text-xs transition-all flex items-center gap-2 border ${urgent ? 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-900/30' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                <AlertTriangle size={16} /> URGENT
              </button>
              <button onClick={() => setImportant(!important)} className={`px-5 py-3 rounded-xl font-black text-xs transition-all flex items-center gap-2 border ${important ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/30' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
                <Star size={16} /> IMPORTANT
              </button>
            </div>
            <button onClick={addTodo} className="bg-violet-600 hover:bg-violet-500 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-xl shadow-violet-900/20 active:scale-95 transition-all">POST QUEST</button>
          </div>
        </div>

        <div className="space-y-4">
          {todos.map(t => (
            <motion.div layout key={t.id} className={`p-6 rounded-[2rem] border transition-all ${t.completed ? 'bg-slate-900/40 border-slate-800/50 opacity-60' : 'bg-slate-900 border-slate-800 shadow-lg'}`}>
              <div className="flex items-center gap-6">
                <button onClick={() => toggleTodo(t.id)} className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${t.completed ? 'bg-green-500 border-green-500 text-white' : 'border-slate-700 hover:border-violet-500'}`}>
                  {t.completed && <CheckSquare size={20} />}
                </button>
                <div className="flex-1">
                  <p className={`text-xl font-bold ${t.completed ? 'line-through text-slate-600' : 'text-slate-200'}`}>{t.text}</p>
                  <div className="flex gap-2 mt-2">
                    {t.urgent && <span className="bg-red-600/10 text-red-500 text-[10px] font-black px-2 py-0.5 rounded border border-red-500/20">URGENT</span>}
                    {t.important && <span className="bg-blue-600/10 text-blue-500 text-[10px] font-black px-2 py-0.5 rounded border border-blue-500/20">IMPORTANT</span>}
                  </div>
                </div>
                <button onClick={() => deleteTodo(t.id)} className="p-2 text-slate-700 hover:text-red-500 transition-colors"><Trash2 size={20} /></button>
              </div>
            </motion.div>
          ))}
          {todos.length === 0 && <div className="text-center py-24 bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-slate-800 text-slate-600 font-bold uppercase tracking-widest">Your quest log is empty.</div>}
        </div>
      </div>
    );
  };

  const Focus = () => {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [selectedNoise, setSelectedNoise] = useState<SoundType | null>(null);
    const [noiseVol, setNoiseVol] = useState(0.5);
    const [activeSpotify, setActiveSpotify] = useState<string | null>(null);
    const [customLink, setCustomLink] = useState('');

    useEffect(() => {
      let t: any;
      if (isActive && timeLeft > 0) {
        t = setInterval(() => setTimeLeft(l => l - 1), 1000);
      } else if (timeLeft === 0) {
        setIsActive(false);
        const mins = 25;
        grantXp(mins * 2); grantGold(Math.round(mins * 0.8)); damageBoss(Math.round(mins * 0.6));
        setNotif("Focus Session Complete! Massive Gains!");
      }
      return () => clearInterval(t);
    }, [isActive, timeLeft]);

    const addCustomSpotify = () => {
      try {
        const id = customLink.split('playlist/')[1]?.split('?')[0];
        if (id) {
          const newItem = { id, name: 'Custom List', category: 'User' };
          setCustomPlaylists([...customPlaylists, newItem]);
          setCustomLink('');
        }
      } catch (e) { alert('Invalid Spotify Link'); }
    };

    const hidePlaylist = (id: string) => {
      setHiddenPlaylists(prev => prev.includes(id) ? prev : [...prev, id]);
      if (activeSpotify === id) setActiveSpotify(null);
    };

    const restorePlaylist = (id: string) => {
      setHiddenPlaylists(prev => prev.filter(x => x !== id));
      if (hiddenPlaylists.length <= 1) setShowHiddenBin(false);
    };

    const allPlaylists = [...SPOTIFY_PLAYLISTS, ...customPlaylists].filter(p => !hiddenPlaylists.includes(p.id));

    return (
      <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-1000">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[3rem] text-center shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-violet-600/5 pointer-events-none" />
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-10">Neural Focus Timer</h3>
              
              <div className="relative inline-block mb-10">
                <svg className="w-64 h-64 -rotate-90">
                  <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                  <motion.circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={754}
                    strokeDashoffset={754 - (754 * timeLeft) / (25 * 60)} strokeLinecap="round" className="text-violet-600" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-6xl font-black text-white tabular-nums tracking-tighter">
                    {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                  </span>
                  <span className="text-xs font-black text-slate-500 uppercase mt-2">Remains</span>
                </div>
              </div>

              <div className="flex gap-4 justify-center mb-8">
                <button onClick={() => setIsActive(!isActive)} className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${isActive ? 'bg-slate-800 text-white' : 'bg-violet-600 text-white shadow-lg shadow-violet-900/40'}`}>
                  {isActive ? <Pause size={32} /> : <Play size={32} className="ml-2" />}
                </button>
                <button onClick={() => { setIsActive(false); setTimeLeft(25 * 60); }} className="w-20 h-20 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center hover:text-white transition-all">
                  <RotateCcw size={32} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {FOCUS_PRESETS.map(p => (
                  <button key={p.label} onClick={() => { setIsActive(false); setTimeLeft(p.mins * 60); }}
                    className="py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-2xl font-black text-xs transition-all border border-slate-700/50">
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem]">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6">Procedural Soundscape</h3>
              <div className="space-y-4">
                {[
                  { id: 'rain', label: 'Heavy Rain' },
                  { id: 'ocean', label: 'Deep Ocean' },
                  { id: 'cafe', label: 'Busy Cafe' },
                  { id: 'white', label: 'White Noise' },
                  { id: 'binaural', label: 'Binaural 40Hz' },
                ].map((s: any) => (
                  <button key={s.id} onClick={() => { audioMgr.toggle(s.id, noiseVol); setSelectedNoise(selectedNoise === s.id ? null : s.id); }}
                    className={`w-full p-4 rounded-2xl flex items-center justify-between transition-all border ${selectedNoise === s.id ? 'bg-violet-600/10 border-violet-500 text-white' : 'bg-slate-800/30 border-slate-800 text-slate-400 hover:border-slate-700'}`}>
                    <span className="font-bold">{s.label}</span>
                    {selectedNoise === s.id ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  </button>
                ))}
                <div className="pt-4">
                  <p className="text-[10px] font-black text-slate-600 uppercase mb-3">Engine Volume</p>
                  <input type="range" min="0" max="1" step="0.01" value={noiseVol} onChange={e => {
                    const v = parseFloat(e.target.value);
                    setNoiseVol(v);
                    if (selectedNoise) audioMgr.updateVolume(selectedNoise, v);
                  }} className="w-full h-1.5 bg-slate-800 rounded-full appearance-none accent-violet-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            {activeSpotify ? (
              <div className="bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-800 aspect-video relative group">
                <iframe src={`https://open.spotify.com/embed/playlist/${activeSpotify}?utm_source=generator&theme=0`}
                  width="100%" height="100%" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" />
                <button onClick={() => setActiveSpotify(null)} className="absolute top-4 right-4 p-3 bg-black/60 backdrop-blur-md text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={20} />
                </button>
              </div>
            ) : (
              <div className="bg-slate-900 border-2 border-dashed border-slate-800 rounded-[2.5rem] aspect-video flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-600"><Music size={40} /></div>
                <h3 className="text-2xl font-black text-white mb-3">Atmospheric Resonance</h3>
                <p className="text-slate-500 font-bold max-w-sm">Select a sonic environment below or paste a Spotify playlist link to begin your deep work session.</p>
                <div className="mt-8 flex gap-3 w-full max-w-md">
                  <input className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder="Spotify Playlist URL..." value={customLink} onChange={e => setCustomLink(e.target.value)} />
                  <button onClick={addCustomSpotify} className="bg-violet-600 p-4 rounded-xl text-white hover:bg-violet-500 transition-all"><Plus size={20} /></button>
                </div>
              </div>
            )}

            {/* Archive Button + Header above Grid */}
            <div className="flex justify-between items-center px-2 mb-2">
               <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Soundscapes</h3>
               <button 
                  onClick={() => setShowHiddenBin(!showHiddenBin)}
                  disabled={hiddenPlaylists.length === 0}
                  className={`relative p-2.5 rounded-xl transition-all flex items-center justify-center ${hiddenPlaylists.length > 0 ? 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 cursor-pointer' : 'text-slate-700 cursor-not-allowed'}`}
                  title="Archive / Hidden Suggestions"
               >
                  <Archive size={18} />
                  {hiddenPlaylists.length > 0 && (
                     <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white ring-2 ring-black">
                        {hiddenPlaylists.length}
                     </span>
                  )}
               </button>
            </div>

            {/* Hidden Bin Panel */}
            <AnimatePresence>
               {showHiddenBin && hiddenPlaylists.length > 0 && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                     <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl mb-6 shadow-xl">
                        <div className="flex flex-wrap gap-2">
                           {hiddenPlaylists.map(id => {
                              const p = [...SPOTIFY_PLAYLISTS, ...customPlaylists].find(x => x.id === id);
                              if (!p) return null;
                              return (
                                 <div key={id} className="flex items-center gap-3 bg-slate-800 border border-slate-700 pl-3 pr-2 py-1.5 rounded-xl text-sm">
                                    <span className="font-bold text-slate-300">{p.name}</span>
                                    <button type="button" onClick={() => restorePlaylist(id)} className="text-slate-500 hover:text-violet-400 p-1 bg-slate-900/50 rounded-md transition-colors" title="Restore">
                                       <RotateCw size={14} />
                                    </button>
                                 </div>
                              );
                           })}
                        </div>
                     </div>
                  </motion.div>
               )}
            </AnimatePresence>

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {allPlaylists.map(p => (
                <div key={p.id} className="relative group">
                  <button onClick={() => setActiveSpotify(p.id)}
                    className="w-full p-6 bg-slate-900 border border-slate-800 rounded-3xl text-left hover:border-violet-500 transition-all flex flex-col items-start gap-4">
                    <div className="w-12 h-12 bg-violet-600/10 rounded-2xl flex items-center justify-center text-violet-500 group-hover:bg-violet-600 group-hover:text-white transition-all">
                      <Play size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{p.category}</p>
                      <p className="font-bold text-white leading-tight">{p.name}</p>
                    </div>
                  </button>
                  {/* Strict Hover X */}
                  <button
                    type="button"
                    title="Hide suggestion"
                    onClick={(e) => { e.stopPropagation(); hidePlaylist(p.id); }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-800/90 text-slate-400 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto hover:text-red-400 hover:bg-red-500/20 transition-all z-10"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>

            {allPlaylists.length === 0 && !showHiddenBin && (
               <div className="text-center py-10 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
                 <p className="text-slate-500 font-bold mb-4">All suggestions hidden.</p>
                 <button onClick={() => setShowHiddenBin(true)} className="text-violet-500 font-black text-xs uppercase flex items-center justify-center gap-1 mx-auto">
                   <Archive size={14} /> Open Archive
                 </button>
               </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const Loot = () => {
    const [filter, setFilter] = useState('title');
    const items = SHOP.filter(s => s.type === filter);

    const buy = (item: any) => {
      if (inv.includes(item.id)) {
        setEq({ ...eq, [item.type]: item.id });
        return;
      }
      if (hero.gold >= item.price) {
        setHero({ ...hero, gold: hero.gold - item.price });
        setInv([...inv, item.id]);
        setEq({ ...eq, [item.type]: item.id });
        setNotif(`Unlocked: ${item.name}!`);
      } else {
        alert("Not enough Gold Crystals!");
      }
    };

    return (
      <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-right-4 duration-700">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
          <div>
            <h2 className="text-4xl font-black text-white mb-2">LOOT LOCKER</h2>
            <p className="text-slate-400 font-bold uppercase tracking-widest">Customize your legend</p>
          </div>
          <div className="flex bg-slate-900 p-2 rounded-2xl border border-slate-800">
            {['title', 'avatar', 'frame', 'theme'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-6 py-3 rounded-xl font-black text-xs uppercase transition-all ${filter === f ? 'bg-violet-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}>
                {f}s
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map(item => {
            const owned = inv.includes(item.id);
            const active = eq[item.type as keyof typeof eq] === item.id;
            const rarityColor = 
              item.rarity === 'mythic' ? 'text-amber-400' : 
              item.rarity === 'legendary' ? 'text-orange-500' :
              item.rarity === 'epic' ? 'text-purple-500' :
              item.rarity === 'rare' ? 'text-blue-500' : 'text-slate-400';

            return (
              <button key={item.id} onClick={() => buy(item)}
                className={`p-6 rounded-[2rem] border-2 text-left transition-all relative overflow-hidden group ${active ? 'bg-violet-600/10 border-violet-500 shadow-xl' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className={`text-[10px] font-black uppercase tracking-tighter px-2 py-1 rounded ${rarityColor} bg-white/5`}>
                    {item.rarity}
                  </div>
                  {owned ? <Award className={active ? "text-violet-500" : "text-slate-600"} size={20} /> : <div className="text-yellow-400 font-black">🪙 {item.price}</div>}
                </div>
                <h4 className="text-xl font-black text-white mb-2 group-hover:translate-x-1 transition-transform">{item.name}</h4>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{owned ? (active ? 'EQUIPPED' : 'OWNED') : 'AVAILABLE'}</p>
                {active && <div className="absolute top-0 right-0 w-12 h-12 bg-violet-600 text-white flex items-center justify-center rounded-bl-3xl"><CheckSquare size={16} /></div>}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-slate-200 font-sans selection:bg-violet-500/30">
      <Sidebar />
      
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-20 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 z-40 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SwordLogo size={36} />
          <h1 className="text-lg font-black tracking-tighter text-white">TASK FORGE</h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-white bg-slate-800 rounded-xl">
          <Menu size={24} />
        </button>
      </div>

      <main className="lg:ml-64 pt-28 lg:pt-10 p-6 md:p-10 pb-32">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            {activeTab === 'dash' && <Dashboard />}
            {activeTab === 'habits' && <Habits />}
            {activeTab === 'todos' && <Todos />}
            {activeTab === 'focus' && <Focus />}
            {activeTab === 'loot' && <Loot />}
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>{notif && <Notification msg={notif} onClear={() => setNotif(null)} />}</AnimatePresence>
      {showTut && <Tut />}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: #0f172a; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #4c1d95; border-radius: 10px; }
      `}</style>
    </div>
  );
}
