import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Repeat,
  ListTodo,
  Timer,
  ShoppingBag,
  Flame,
  Sword,
  Zap,
  Target,
  Star,
  BookOpen,
  Trophy,
  TrendingUp,
  Heart,
  Sparkles,
  Plus,
  Trash2,
  Check,
  AlertTriangle,
  Grid,
  List,
  Play,
  Pause,
  Square,
  Save,
  Clock,
  Volume2,
  Quote,
  Youtube,
  Music,
  Coins,
  Lock,
  X,
  ChevronRight,
  ChevronLeft,
  Shuffle,
  Shield
} from 'lucide-react';

// ==========================================
// 1. DATA TYPES & CATALOGS
// ==========================================

export type ThemeColor = 'violet' | 'cyan' | 'emerald' | 'rose' | 'amber' | 'indigo' | 'teal' | 'fuchsia' | 'sky' | 'lime' | 'crimson';
export type SoundType = 'rain' | 'ocean' | 'cafe' | 'white' | 'pink' | 'brown' | 'binaural';
export type ShopItemType = 'title' | 'avatar' | 'frame' | 'theme';
export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface HeroState {
  name: string;
  level: number;
  xp: number;
  gold: number;
  streakDays: number;
  lastActiveDate: string;
  totalTasksCompleted: number;
  totalHabitsCompleted: number;
  totalFocusMinutes: number;
  totalBossesDefeated: number;
  profilePicture: string | null;
}

export interface Todo {
  id: string;
  title: string;
  notes: string;
  urgent: boolean;
  important: boolean;
  completed: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface Habit {
  id: string;
  name: string;
  emoji: string;
  color: ThemeColor;
  streak: number;
  longestStreak: number;
  completedDates: string[];
  createdAt: string;
}

export interface Boss {
  id: string;
  name: string;
  emoji: string;
  level: number;
  maxHp: number;
  hp: number;
  date: string;
  defeatCount: number;
  rewardGold: number;
  rewardXp: number;
}

export interface FocusSession {
  id: string;
  date: string;
  minutes: number;
  label: string;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: ShopItemType;
  cost: number;
  icon: string;
  rarity: Rarity;
  value: string;
}

export interface EquippedItems {
  frame: string;
  theme: string;
  title: string;
  avatar: string;
}

export interface AppNotification {
  id: string;
  message: string;
  icon: string;
  tone: 'success' | 'levelup' | 'boss' | 'gold' | 'info';
  createdAt: number;
}

export interface Verse {
  text: string;
  ref: string;
}

// 80+ Scripture Database
const BIBLE_VERSES: Verse[] = [
  // Diligence & Work
  { text: "Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.", ref: "Colossians 3:23" },
  { text: "Commit to the Lord whatever you do, and he will establish your plans.", ref: "Proverbs 16:3" },
  { text: "All hard work brings a profit, but mere talk leads only to poverty.", ref: "Proverbs 14:23" },
  { text: "Whatever your hand finds to do, do it with all your might.", ref: "Ecclesiastes 9:10" },
  { text: "Diligent hands will rule, but laziness ends in forced labor.", ref: "Proverbs 12:24" },
  { text: "The plans of the diligent lead to profit as surely as haste leads to poverty.", ref: "Proverbs 21:5" },
  { text: "Go to the ant, consider its ways and be wise! It stores its provisions in summer.", ref: "Proverbs 6:6-8" },
  { text: "The hand of the diligent makes rich.", ref: "Proverbs 10:4" },
  { text: "Do you see someone skilled in their work? They will serve before kings.", ref: "Proverbs 22:29" },
  { text: "The sluggard craves and gets nothing, but the desires of the diligent are fully satisfied.", ref: "Proverbs 13:4" },
  
  // Strength & Courage
  { text: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13" },
  { text: "Those who hope in the Lord will renew their strength. They will soar on wings like eagles.", ref: "Isaiah 40:31" },
  { text: "Be strong and courageous. Do not be afraid; do not be discouraged.", ref: "Joshua 1:9" },
  { text: "God has not given us a spirit of fear, but of power, love, and a sound mind.", ref: "2 Timothy 1:7" },
  { text: "The Lord is my light and my salvation—whom shall I fear?", ref: "Psalm 27:1" },
  { text: "God is our refuge and strength, an ever-present help in trouble.", ref: "Psalm 46:1" },
  { text: "My grace is sufficient for you, for my power is made perfect in weakness.", ref: "2 Corinthians 12:9" },
  { text: "Let us not become weary in doing good, for at the proper time we will reap a harvest if we do not give up.", ref: "Galatians 6:9" },
  { text: "The Lord is my strength and my shield; my heart trusts in him.", ref: "Psalm 28:7" },
  { text: "He gives strength to the weary and increases the power of the weak.", ref: "Isaiah 40:29" },

  // Wisdom & Focus
  { text: "Trust in the Lord with all your heart and lean not on your own understanding.", ref: "Proverbs 3:5-6" },
  { text: "Above all else, guard your heart, for everything you do flows from it.", ref: "Proverbs 4:23" },
  { text: "In their hearts humans plan their course, but the Lord establishes their steps.", ref: "Proverbs 16:9" },
  { text: "If any of you lacks wisdom, you should ask God, who gives generously to all.", ref: "James 1:5" },
  { text: "Your word is a lamp for my feet, a light on my path.", ref: "Psalm 119:105" },
  { text: "Making the most of every opportunity, because the days are evil.", ref: "Ephesians 5:16" },
  { text: "Teach us to number our days, that we may gain a heart of wisdom.", ref: "Psalm 90:12" },

  // Peace & Calm
  { text: "Do not be anxious about anything, but in every situation present your requests to God.", ref: "Philippians 4:6-7" },
  { text: "The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures.", ref: "Psalm 23:1-2" },
  { text: "Peace I leave with you; my peace I give you. Do not let your hearts be troubled.", ref: "John 14:27" },
  { text: "Be still, and know that I am God.", ref: "Psalm 46:10" },
  { text: "You will keep in perfect peace those whose minds are steadfast.", ref: "Isaiah 26:3" },
  { text: "Come to me, all you who are weary and burdened, and I will give you rest.", ref: "Matthew 11:28" },
  { text: "Cast all your anxiety on him because he cares for you.", ref: "1 Peter 5:7" },

  // Hope & Victory
  { text: "For I know the plans I have for you, plans to prosper you and to give you hope and a future.", ref: "Jeremiah 29:11" },
  { text: "The steadfast love of the Lord never ceases; his mercies are new every morning.", ref: "Lamentations 3:22-23" },
  { text: "In all these things we are more than conquerors through him who loved us.", ref: "Romans 8:37" },
  { text: "I have fought the good fight, I have finished the race, I have kept the faith.", ref: "2 Timothy 4:7" },
  { text: "Seek first the kingdom of God and his righteousness, and all these things will be added to you.", ref: "Matthew 6:33" }
];

const SHOP_CATALOG: ShopItem[] = [
  // Titles
  { id: 'title-novice', name: 'Novice', description: 'Every legend begins with a single step.', type: 'title', cost: 0, icon: '📜', rarity: 'common', value: 'Novice' },
  { id: 'title-warrior', name: 'Warrior', description: 'Forged in daily focus battles.', type: 'title', cost: 60, icon: '⚔️', rarity: 'common', value: 'Warrior' },
  { id: 'title-scholar', name: 'Scholar', description: 'Master of knowledge and deep work.', type: 'title', cost: 90, icon: '📚', rarity: 'common', value: 'Scholar' },
  { id: 'title-champion', name: 'Champion', description: 'Crusher of deadlines and obstacles.', type: 'title', cost: 180, icon: '🏆', rarity: 'rare', value: 'Champion' },
  { id: 'title-archmage', name: 'Archmage', description: 'Wielder of extreme productivity arts.', type: 'title', cost: 350, icon: '🧙', rarity: 'epic', value: 'Archmage' },
  { id: 'title-legend', name: 'Mythic Legend', description: 'The pinnacle of legendary mastery.', type: 'title', cost: 600, icon: '👑', rarity: 'legendary', value: 'Mythic Legend' },

  // Avatars
  { id: 'avatar-fox', name: 'Swift Fox', description: 'Agile, cunning, and rapid.', type: 'avatar', cost: 0, icon: '🦊', rarity: 'common', value: '🦊' },
  { id: 'avatar-wolf', name: 'Lone Wolf', description: 'Unwavering focus and grit.', type: 'avatar', cost: 75, icon: '🐺', rarity: 'common', value: '🐺' },
  { id: 'avatar-eagle', name: 'Sky Eagle', description: 'High perspective, razor vision.', type: 'avatar', cost: 120, icon: '🦅', rarity: 'rare', value: '🦅' },
  { id: 'avatar-dragon', name: 'Solar Dragon', description: 'Unstoppable willpower.', type: 'avatar', cost: 250, icon: '🐉', rarity: 'epic', value: '🐉' },
  { id: 'avatar-phoenix', name: 'Reborn Phoenix', description: 'Rising through every trial.', type: 'avatar', cost: 400, icon: '🔥', rarity: 'epic', value: '🔥' },
  { id: 'avatar-unicorn', name: 'Starlight Unicorn', description: 'Rare magical brilliance.', type: 'avatar', cost: 550, icon: '🦄', rarity: 'legendary', value: '🦄' },

  // Frames
  { id: 'frame-none', name: 'Standard Border', description: 'Clean minimalist outline.', type: 'frame', cost: 0, icon: '⬜', rarity: 'common', value: 'none' },
  { id: 'frame-bronze', name: 'Bronze Ring', description: 'Solid metallic bronze border.', type: 'frame', cost: 50, icon: '🥉', rarity: 'common', value: 'bronze' },
  { id: 'frame-silver', name: 'Silver Crest', description: 'Sleek refined silver ring.', type: 'frame', cost: 120, icon: '🥈', rarity: 'rare', value: 'silver' },
  { id: 'frame-gold', name: 'Gold Aegis', description: 'Gleaming golden brilliance.', type: 'frame', cost: 280, icon: '🥇', rarity: 'epic', value: 'gold' },
  { id: 'frame-diamond', name: 'Diamond Aura', description: 'Crystalline neon diamond frame.', type: 'frame', cost: 550, icon: '💎', rarity: 'legendary', value: 'diamond' },
  { id: 'frame-fire', name: 'Inferno Ring', description: 'Radiating fire energy.', type: 'frame', cost: 350, icon: '🔥', rarity: 'epic', value: 'fire' },

  // Themes
  { id: 'theme-violet', name: 'Nebula Violet', description: 'Royal cosmic purple glow.', type: 'theme', cost: 0, icon: '💜', rarity: 'common', value: 'violet' },
  { id: 'theme-cyan', name: 'Cyber Cyan', description: 'Futuristic ocean cyan.', type: 'theme', cost: 60, icon: '💎', rarity: 'common', value: 'cyan' },
  { id: 'theme-emerald', name: 'Emerald Forest', description: 'Vitality and enduring strength.', type: 'theme', cost: 60, icon: '💚', rarity: 'common', value: 'emerald' },
  { id: 'theme-amber', name: 'Solar Amber', description: 'Radiant golden energy.', type: 'theme', cost: 90, icon: '🌟', rarity: 'rare', value: 'amber' },
  { id: 'theme-rose', name: 'Neon Rose', description: 'Passionate and fierce.', type: 'theme', cost: 90, icon: '🌹', rarity: 'rare', value: 'rose' },
  { id: 'theme-crimson', name: 'Crimson Flame', description: 'Maximum intensity power.', type: 'theme', cost: 220, icon: '❤️‍🔥', rarity: 'epic', value: 'crimson' },
];

const BOSS_TEMPLATES = [
  { name: 'The Procrastinator', emoji: '👹' },
  { name: 'Deadline Beast', emoji: '🐉' },
  { name: 'Distraction Lord', emoji: '👻' },
  { name: 'The Time Eater', emoji: '⏳' },
  { name: 'Chaos Titan', emoji: '⚔️' },
  { name: 'Entropy Wraith', emoji: '💀' },
];

const FOCUS_PRESETS = [
  { label: 'Quick Task', minutes: 10 },
  { label: 'Sprint', minutes: 25 },
  { label: 'Deep Work', minutes: 50 },
  { label: 'Marathon', minutes: 90 },
];

const YT_PRESET_STREAMS = [
  { id: 'lofi', name: 'Lofi Girl Focus Beats', videoId: 'jfKfPfyJRdk' },
  { id: 'synth', name: 'Synthwave Chill Radio', videoId: '4xDzrJKXOOY' },
  { id: 'classical', name: 'Peaceful Classical Focus', videoId: '8p_3V6V64_0' },
  { id: 'space', name: 'Deep Space Cosmic Drone', videoId: 'S_DFq9Rev8M' },
];

const HABIT_EMOJIS = ['💧', '🏋️', '📖', '🧘', '🥗', '💤', '🎯', '✍️', '🏃', '💻', '🌅', '🧠', '🍎', '📝'];
const QUICK_ATTACK_COOLDOWN_MS = 60 * 60 * 1000;

// ==========================================
// 2. UTILITIES & PROCEDURAL SOUND SYNTHESIZER
// ==========================================

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function todayStr(d: Date = new Date()): string {
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 10);
}

function xpForLevel(level: number): number {
  return Math.round(80 + (level - 1) * 42);
}

function computeStreak(dates: string[]): number {
  if (dates.length === 0) return 0;
  const set = new Set(dates);
  const today = todayStr();
  const cursor = new Date();

  if (!set.has(today)) {
    cursor.setDate(cursor.getDate() - 1);
    if (!set.has(todayStr(cursor))) return 0;
  }

  let streak = 0;
  while (true) {
    const key = todayStr(cursor);
    if (!set.has(key)) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function themeAccent(theme: string): string {
  const map: Record<string, string> = {
    violet: '#8B5CF6',
    cyan: '#06B6D4',
    emerald: '#10B981',
    rose: '#F43F5E',
    amber: '#F59E0B',
    indigo: '#6366F1',
    teal: '#14B8A6',
    fuchsia: '#D946EF',
    sky: '#0EA5E9',
    lime: '#84CC16',
    crimson: '#DC2626',
  };
  return map[theme] || '#8B5CF6';
}

function rarityColor(rarity: string): string {
  switch (rarity) {
    case 'common': return '#9CA3AF';
    case 'rare': return '#60A5FA';
    case 'epic': return '#A78BFA';
    case 'legendary': return '#FBBF24';
    default: return '#9CA3AF';
  }
}

// Web Audio API Procedural Synth Engine
class AmbientEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private masterVolume = 0.6;
  private layers: Map<SoundType, { volume: number; active: boolean; nodes: AudioNode[]; sources: AudioNode[] }> = new Map();

  private getOrCreateContext(): AudioContext {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.masterVolume;
      this.masterGain.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  async start(type: SoundType, volume = 0.5): Promise<void> {
    const ctx = this.getOrCreateContext();
    if (ctx.state === 'suspended') {
      try { await ctx.resume(); } catch { /* ignore */ }
    }
    this.stop(type);

    const gainNode = ctx.createGain();
    gainNode.gain.value = 0;
    if (this.masterGain) gainNode.connect(this.masterGain);

    const nodes: AudioNode[] = [gainNode];
    const sources: AudioNode[] = [];

    try {
      if (type === 'rain') {
        const buf = ctx.createBuffer(2, ctx.sampleRate * 2, ctx.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
          const data = buf.getChannelData(ch);
          for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.25;
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1200;
        src.connect(filter);
        filter.connect(gainNode);
        src.start();
        sources.push(src);
        nodes.push(filter);
      } else if (type === 'ocean') {
        const buf = ctx.createBuffer(2, ctx.sampleRate * 4, ctx.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
          const data = buf.getChannelData(ch);
          for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.2;
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 500;
        src.connect(filter);
        filter.connect(gainNode);
        src.start();
        sources.push(src);
        nodes.push(filter);
      } else if (type === 'cafe') {
        const buf = ctx.createBuffer(2, ctx.sampleRate * 2, ctx.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
          const data = buf.getChannelData(ch);
          for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.15;
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.loop = true;
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 850;
        filter.Q.value = 0.6;
        src.connect(filter);
        filter.connect(gainNode);
        src.start();
        sources.push(src);
        nodes.push(filter);
      } else if (type === 'white' || type === 'pink' || type === 'brown') {
        const buf = ctx.createBuffer(2, ctx.sampleRate * 2, ctx.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
          const data = buf.getChannelData(ch);
          let last = 0;
          for (let i = 0; i < data.length; i++) {
            const w = Math.random() * 2 - 1;
            if (type === 'white') data[i] = w * 0.2;
            else if (type === 'brown') {
              last = (last + 0.02 * w) / 1.02;
              data[i] = last * 2.5;
            } else {
              data[i] = w * 0.12;
            }
          }
        }
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.loop = true;
        src.connect(gainNode);
        src.start();
        sources.push(src);
      } else if (type === 'binaural') {
        const oscL = ctx.createOscillator();
        const oscR = ctx.createOscillator();
        oscL.frequency.value = 210;
        oscR.frequency.value = 220; // 10Hz Alpha beat
        const merger = ctx.createChannelMerger(2);
        oscL.connect(merger, 0, 0);
        oscR.connect(merger, 0, 1);
        merger.connect(gainNode);
        oscL.start();
        oscR.start();
        sources.push(oscL, oscR);
        nodes.push(merger);
      }

      gainNode.gain.setTargetAtTime(volume, ctx.currentTime, 0.2);
      this.layers.set(type, { volume, active: true, nodes, sources });
    } catch {
      // Audio fallback
    }
  }

  stop(type: SoundType): void {
    const layer = this.layers.get(type);
    if (!layer) return;
    layer.sources.forEach(s => {
      try { (s as AudioScheduledSourceNode).stop(); } catch { /* ignore */ }
      try { s.disconnect(); } catch { /* ignore */ }
    });
    layer.nodes.forEach(n => {
      try { n.disconnect(); } catch { /* ignore */ }
    });
    this.layers.delete(type);
  }

  setLayerVolume(type: SoundType, vol: number): void {
    const layer = this.layers.get(type);
    if (layer && this.ctx) {
      layer.volume = vol;
      const gain = layer.nodes[0] as GainNode;
      if (gain && gain.gain) gain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.1);
    }
  }

  setMasterVolume(vol: number): void {
    this.masterVolume = vol;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(vol, this.ctx.currentTime, 0.1);
    }
  }

  stopAll(): void {
    const keys = Array.from(this.layers.keys());
    keys.forEach(k => this.stop(k));
  }
}

const ambientEngine = new AmbientEngine();

// ==========================================
// 3. SEED & INITIAL STATE
// ==========================================

const INITIAL_HERO: HeroState = {
  name: "Aragorn",
  level: 1,
  xp: 0,
  gold: 40,
  streakDays: 1,
  lastActiveDate: todayStr(),
  totalTasksCompleted: 0,
  totalHabitsCompleted: 0,
  totalFocusMinutes: 0,
  totalBossesDefeated: 0,
  profilePicture: null
};

const INITIAL_EQUIPPED: EquippedItems = {
  frame: 'frame-none',
  theme: 'theme-violet',
  title: 'title-novice',
  avatar: 'avatar-fox',
};

function createBoss(level: number, defeatCount: number): Boss {
  const t = BOSS_TEMPLATES[Math.floor(Math.random() * BOSS_TEMPLATES.length)];
  const bossLvl = Math.max(1, level + defeatCount);
  const hp = Math.round(90 + bossLvl * 35);
  return {
    id: uid(),
    name: t.name,
    emoji: t.emoji,
    level: bossLvl,
    maxHp: hp,
    hp,
    date: todayStr(),
    defeatCount,
    rewardGold: Math.round(30 + bossLvl * 8),
    rewardXp: Math.round(40 + bossLvl * 10),
  };
}

// ==========================================
// 4. MAIN TASK FORGE APP COMPONENT
// ==========================================

export default function App() {
  // Navigation & Page State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'habits' | 'todos' | 'focus' | 'loot'>('dashboard');
  const [hasSeenTutorial, setHasSeenTutorial] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);

  // Core Persistent State
  const [hero, setHero] = useState<HeroState>(() => {
    const saved = localStorage.getItem('tf_hero');
    return saved ? JSON.parse(saved) : INITIAL_HERO;
  });

  const [equipped, setEquipped] = useState<EquippedItems>(() => {
    const saved = localStorage.getItem('tf_equipped');
    return saved ? JSON.parse(saved) : INITIAL_EQUIPPED;
  });

  const [inventory, setInventory] = useState<string[]>(() => {
    const saved = localStorage.getItem('tf_inventory');
    return saved ? JSON.parse(saved) : ['title-novice', 'avatar-fox', 'frame-none', 'theme-violet'];
  });

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('tf_habits');
    return saved ? JSON.parse(saved) : [
      { id: uid(), name: 'Drink 2L Water', emoji: '💧', color: 'cyan', streak: 2, longestStreak: 4, completedDates: [todayStr()], createdAt: todayStr() },
      { id: uid(), name: 'Deep Focus 45m', emoji: '🧠', color: 'violet', streak: 1, longestStreak: 3, completedDates: [], createdAt: todayStr() },
      { id: uid(), name: 'Workout / Cardio', emoji: '🏋️', color: 'rose', streak: 3, longestStreak: 3, completedDates: [todayStr()], createdAt: todayStr() },
    ];
  });

  const [todos, setTodos] = useState<Todo[]>(() => {
    const saved = localStorage.getItem('tf_todos');
    return saved ? JSON.parse(saved) : [
      { id: uid(), title: 'Deploy TaskForge v1.0 release', notes: 'Complete live test verification', urgent: true, important: true, completed: false, createdAt: todayStr() },
      { id: uid(), title: 'Plan weekly roadmap & milestones', notes: 'Organize high priority sprints', urgent: false, important: true, completed: false, createdAt: todayStr() },
      { id: uid(), title: 'Review team pull requests', notes: '', urgent: true, important: false, completed: false, createdAt: todayStr() },
    ];
  });

  const [boss, setBoss] = useState<Boss>(() => {
    const saved = localStorage.getItem('tf_boss');
    return saved ? JSON.parse(saved) : createBoss(1, 0);
  });

  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(() => {
    const saved = localStorage.getItem('tf_sessions');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [lastAttackAt, setLastAttackAt] = useState<number>(() => {
    const saved = localStorage.getItem('tf_last_attack');
    return saved ? Number(saved) : 0;
  });

  // Current Theme Accent
  const themeName = equipped.theme.replace('theme-', '');
  const accent = themeAccent(themeName);

  // Sync state changes to localStorage
  useEffect(() => { localStorage.setItem('tf_hero', JSON.stringify(hero)); }, [hero]);
  useEffect(() => { localStorage.setItem('tf_equipped', JSON.stringify(equipped)); }, [equipped]);
  useEffect(() => { localStorage.setItem('tf_inventory', JSON.stringify(inventory)); }, [inventory]);
  useEffect(() => { localStorage.setItem('tf_habits', JSON.stringify(habits)); }, [habits]);
  useEffect(() => { localStorage.setItem('tf_todos', JSON.stringify(todos)); }, [todos]);
  useEffect(() => { localStorage.setItem('tf_boss', JSON.stringify(boss)); }, [boss]);
  useEffect(() => { localStorage.setItem('tf_sessions', JSON.stringify(focusSessions)); }, [focusSessions]);
  useEffect(() => { localStorage.setItem('tf_last_attack', String(lastAttackAt)); }, [lastAttackAt]);

  // Push Notifications
  const notify = (message: string, icon: string, tone: AppNotification['tone'] = 'info') => {
    const n: AppNotification = { id: uid(), message, icon, tone, createdAt: Date.now() };
    setNotifications(prev => [n, ...prev.slice(0, 49)]);
  };

  // Activity and Streak logic
  const touchActivity = useCallback(() => {
    const today = todayStr();
    if (hero.lastActiveDate === today) return;
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yesterday = todayStr(y);
    const newStreak = hero.lastActiveDate === yesterday ? hero.streakDays + 1 : 1;
    setHero(h => ({ ...h, lastActiveDate: today, streakDays: newStreak }));
  }, [hero.lastActiveDate, hero.streakDays]);

  // Level & XP Engine
  const grantXp = (amount: number) => {
    setHero(h => {
      let { level, xp } = h;
      xp += amount;
      let leveled = false;
      while (xp >= xpForLevel(level)) {
        xp -= xpForLevel(level);
        level++;
        leveled = true;
      }
      if (leveled) {
        notify(`Level Up! You reached Level ${level}!`, '✨', 'levelup');
      }
      return { ...h, level, xp, gold: h.gold + (leveled ? 25 : 0) };
    });
  };

  const grantGold = (amount: number) => {
    setHero(h => ({ ...h, gold: Math.max(0, h.gold + amount) }));
  };

  // Boss Damage
  const damageBoss = (amount: number) => {
    setBoss(b => {
      const newHp = Math.max(0, b.hp - amount);
      if (newHp === 0 && b.hp > 0) {
        const nextDefeat = b.defeatCount + 1;
        notify(`Boss Defeated! ${b.emoji} ${b.name} fell! (+${b.rewardXp} XP, +${b.rewardGold} Gold)`, '💀', 'boss');
        grantXp(b.rewardXp);
        grantGold(b.rewardGold);
        setHero(h => ({ ...h, totalBossesDefeated: h.totalBossesDefeated + 1 }));
        return createBoss(hero.level, nextDefeat);
      }
      return { ...b, hp: newHp };
    });
  };

  // Quick Attack Cooldown
  const handleQuickAttack = () => {
    const now = Date.now();
    if (now - lastAttackAt < QUICK_ATTACK_COOLDOWN_MS) return;
    setLastAttackAt(now);
    const dmg = Math.round(12 + hero.level * 4);
    damageBoss(dmg);
    grantXp(15);
    notify(`Quick Attack landed! Dealt ${dmg} damage to boss!`, '⚡', 'success');
  };

  // Quest Actions
  const toggleTodo = (id: string) => {
    setTodos(prev => prev.map(t => {
      if (t.id !== id) return t;
      const willComplete = !t.completed;
      if (willComplete) {
        const xp = t.important ? 30 : 20;
        const gold = t.important ? 12 : 8;
        grantXp(xp);
        grantGold(gold);
        damageBoss(t.important ? 15 : 10);
        touchActivity();
        setHero(h => ({ ...h, totalTasksCompleted: h.totalTasksCompleted + 1 }));
        notify(`Quest Cleared: ${t.title} (+${xp} XP, +${gold} G)`, '✅', 'success');
        return { ...t, completed: true, completedAt: todayStr() };
      }
      return { ...t, completed: false, completedAt: undefined };
    }));
  };

  // Habit Actions
  const toggleHabit = (id: string) => {
    const today = todayStr();
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const isDone = h.completedDates.includes(today);
      if (!isDone) {
        const newDates = [...h.completedDates, today];
        const newStreak = computeStreak(newDates);
        grantXp(20);
        grantGold(8);
        damageBoss(10);
        touchActivity();
        setHero(prevHero => ({ ...prevHero, totalHabitsCompleted: prevHero.totalHabitsCompleted + 1 }));
        notify(`Habit Logged: ${h.emoji} ${h.name} (+20 XP)`, '🔥', 'success');
        return { ...h, completedDates: newDates, streak: newStreak, longestStreak: Math.max(h.longestStreak, newStreak) };
      } else {
        const newDates = h.completedDates.filter(d => d !== today);
        return { ...h, completedDates: newDates, streak: computeStreak(newDates) };
      }
    }));
  };

  // Focus Session Logger
  const handleFocusFinish = (mins: number, label: string) => {
    const s: FocusSession = { id: uid(), date: todayStr(), minutes: mins, label };
    setFocusSessions(prev => [s, ...prev]);
    const xp = Math.round(mins * 2);
    const gold = Math.round(mins * 0.8);
    grantXp(xp);
    grantGold(gold);
    damageBoss(Math.round(mins * 0.6));
    touchActivity();
    setHero(h => ({ ...h, totalFocusMinutes: h.totalFocusMinutes + mins }));
    notify(`Focus Chamber logged: ${mins}m ${label} (+${xp} XP, +${gold} G)`, '⏱️', 'success');
  };

  // Daily Verse Component with Shuffle
  const DailyVerseCard = () => {
    const [verseIdx, setVerseIdx] = useState(() => {
      const d = new Date();
      return Math.floor((d.getTime() - new Date(d.getFullYear(), 0, 0).getTime()) / 86400000) % BIBLE_VERSES.length;
    });

    const currentVerse = BIBLE_VERSES[verseIdx];

    const shuffle = () => {
      setVerseIdx(Math.floor(Math.random() * BIBLE_VERSES.length));
    };

    return (
      <div className="glass-card p-5 border border-white/10 relative overflow-hidden bg-white/[0.02]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Quote size={20} className="flex-shrink-0 mt-0.5 text-white/40" style={{ color: accent }} />
            <div>
              <p className="text-sm md:text-base text-gray-200 italic font-serif leading-relaxed">
                "{currentVerse.text}"
              </p>
              <p className="text-xs font-semibold mt-2 tracking-wide uppercase" style={{ color: accent }}>
                — {currentVerse.ref}
              </p>
            </div>
          </div>
          <button
            onClick={shuffle}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all flex items-center gap-1.5 text-xs flex-shrink-0"
            title="Random Verse"
          >
            <Shuffle size={14} /> <span className="hidden sm:inline">Shuffle</span>
          </button>
        </div>
      </div>
    );
  };

  // Avatar icon rendering
  const getAvatarDisplay = () => {
    const item = SHOP_CATALOG.find(i => i.id === equipped.avatar);
    return item ? item.icon : '🦊';
  };

  const getFrameStyles = (): React.CSSProperties => {
    switch (equipped.frame) {
      case 'frame-bronze': return { border: '3px solid #CD7F32', boxShadow: '0 0 12px #CD7F3244' };
      case 'frame-silver': return { border: '3px solid #E5E7EB', boxShadow: '0 0 12px #E5E7EB44' };
      case 'frame-gold': return { border: '3px solid #FBBF24', boxShadow: '0 0 16px #FBBF2466' };
      case 'frame-diamond': return { border: '3px solid #38BDF8', boxShadow: '0 0 20px #38BDF877' };
      case 'frame-fire': return { border: '3px solid #EF4444', boxShadow: '0 0 18px #EF444466' };
      default: return { border: '3px solid rgba(255,255,255,0.1)' };
    }
  };

  return (
    <div className="min-h-screen text-gray-100 flex flex-col md:flex-row bg-[#08060F] font-sans selection:bg-purple-500 selection:text-white">
      
      {/* Toast Notification Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-sm pointer-events-none">
        <AnimatePresence>
          {notifications.slice(0, 3).map(n => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl flex items-center gap-3 pointer-events-auto"
              style={{
                background: 'rgba(15, 12, 28, 0.95)',
                borderColor: `${accent}40`,
                boxShadow: `0 8px 30px ${accent}25`
              }}
            >
              <span className="text-xl">{n.icon}</span>
              <p className="text-xs font-medium text-white">{n.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-[#0b0816]/80 backdrop-blur-xl p-5 justify-between">
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl" style={{ background: `${accent}25`, color: accent }}>
              ⚒
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-wider font-mono" style={{ color: accent }}>TASK FORGE</h1>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Productivity RPG</p>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'habits', label: 'Habit Forge', icon: Repeat },
              { id: 'todos', label: 'Quest Log', icon: ListTodo },
              { id: 'focus', label: 'Focus Chamber', icon: Timer },
              { id: 'loot', label: 'Loot Locker', icon: ShoppingBag },
            ].map(item => {
              const active = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as typeof activeTab)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                    active ? 'text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]'
                  }`}
                  style={active ? { background: `${accent}20`, color: accent, border: `1px solid ${accent}30` } : {}}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
          <div className="text-xs text-yellow-400 font-bold flex items-center justify-center gap-1.5 mb-1">
            <Coins size={14} /> {hero.gold} Gold
          </div>
          <p className="text-[10px] text-gray-500 font-mono">v1.0 Production Build</p>
        </div>
      </aside>

      {/* MAIN CONTENT REGION */}
      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full pb-24 md:pb-8 overflow-y-auto">

        {/* 1. DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-wide font-mono" style={{ color: accent }}>
                  COMMAND CENTER
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Character status & active campaigns</p>
              </div>
              <button
                onClick={() => setShowTutorial(true)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-xs flex items-center gap-1.5 transition-all"
              >
                <BookOpen size={14} /> Tutorial
              </button>
            </div>

            {/* Daily Verse Banner */}
            <DailyVerseCard />

            {/* Top Grid: Hero Profile + Daily Boss + Progress */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Hero Status Card */}
              <div className="glass-card p-6 border border-white/10 rounded-2xl bg-white/[0.02] flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-3 overflow-hidden bg-white/5" style={getFrameStyles()}>
                  {hero.profilePicture ? (
                    <img src={hero.profilePicture} alt="Hero" className="w-full h-full object-cover" />
                  ) : (
                    <span>{getAvatarDisplay()}</span>
                  )}
                </div>
                <h3 className="font-bold text-lg text-white">{hero.name}</h3>
                <span className="text-xs text-gray-400 uppercase tracking-widest font-mono mb-4">
                  {equipped.title.replace('title-', '')}
                </span>

                {/* Level & XP Meter */}
                <div className="w-full space-y-1.5 mb-5">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-purple-400 font-bold">Level {hero.level}</span>
                    <span className="text-gray-400">{hero.xp} / {xpForLevel(hero.level)} XP</span>
                  </div>
                  <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(100, (hero.xp / xpForLevel(hero.level)) * 100)}%`,
                        background: `linear-gradient(90deg, ${accent}, ${accent}CC)`
                      }}
                    />
                  </div>
                </div>

                {/* Quick stats grid */}
                <div className="grid grid-cols-2 gap-2 w-full text-xs">
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="font-bold text-yellow-400 flex items-center justify-center gap-1">
                      <Coins size={13} /> {hero.gold}
                    </div>
                    <span className="text-[10px] text-gray-500 uppercase">Treasury</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="font-bold text-orange-400 flex items-center justify-center gap-1">
                      <Flame size={13} /> {hero.streakDays}d
                    </div>
                    <span className="text-[10px] text-gray-500 uppercase">Active Streak</span>
                  </div>
                </div>
              </div>

              {/* Daily Boss Card */}
              <div className="glass-card p-6 border border-white/10 rounded-2xl bg-white/[0.02] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold font-mono text-red-400 flex items-center gap-1.5 uppercase">
                      <Sword size={14} /> Boss Encounter
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-mono">
                      Level {boss.level}
                    </span>
                  </div>

                  <div className="text-center my-3">
                    <div className="text-5xl mb-2 filter drop-shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-bounce">
                      {boss.emoji}
                    </div>
                    <h4 className="font-extrabold text-base text-white">{boss.name}</h4>
                    <p className="text-[10px] text-gray-400 font-mono">Defeated: {boss.defeatCount} times</p>
                  </div>

                  {/* HP Bar */}
                  <div className="space-y-1 mb-4">
                    <div className="flex justify-between text-xs font-mono text-gray-400">
                      <span className="flex items-center gap-1 text-red-400"><Heart size={12} /> HP</span>
                      <span>{boss.hp} / {boss.maxHp}</span>
                    </div>
                    <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden border border-white/5">
                      <div
                        className="h-full bg-gradient-to-r from-red-600 to-rose-400 transition-all duration-300"
                        style={{ width: `${Math.max(0, (boss.hp / boss.maxHp) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleQuickAttack}
                  disabled={Date.now() - lastAttackAt < QUICK_ATTACK_COOLDOWN_MS}
                  className="w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background: Date.now() - lastAttackAt >= QUICK_ATTACK_COOLDOWN_MS ? `${accent}25` : 'rgba(255,255,255,0.03)',
                    color: Date.now() - lastAttackAt >= QUICK_ATTACK_COOLDOWN_MS ? accent : '#777',
                    border: `1px solid ${Date.now() - lastAttackAt >= QUICK_ATTACK_COOLDOWN_MS ? accent + '40' : 'transparent'}`
                  }}
                >
                  <Zap size={14} />
                  {Date.now() - lastAttackAt >= QUICK_ATTACK_COOLDOWN_MS ? 'Perform Quick Strike' : 'Cooldown Active'}
                </button>
              </div>

              {/* Progress Summary Card */}
              <div className="glass-card p-6 border border-white/10 rounded-2xl bg-white/[0.02] flex flex-col justify-between">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold font-mono text-gray-300 uppercase flex items-center gap-1.5">
                    <TrendingUp size={14} style={{ color: accent }} /> Today's Campaign
                  </h4>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs p-2 rounded-xl bg-white/[0.02]">
                      <span className="text-gray-400 flex items-center gap-2"><Target size={14} /> Quests Cleared</span>
                      <span className="font-bold text-white">{todos.filter(t => t.completedAt === todayStr()).length}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs p-2 rounded-xl bg-white/[0.02]">
                      <span className="text-gray-400 flex items-center gap-2"><Flame size={14} /> Habits Done</span>
                      <span className="font-bold text-white">{habits.filter(h => h.completedDates.includes(todayStr())).length} / {habits.length}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs p-2 rounded-xl bg-white/[0.02]">
                      <span className="text-gray-400 flex items-center gap-2"><Clock size={14} /> Focus Minutes</span>
                      <span className="font-bold text-white">{focusSessions.filter(s => s.date === todayStr()).reduce((a, b) => a + b.minutes, 0)}m</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/5">
                  <div className="flex justify-between text-[11px] text-gray-500 font-mono">
                    <span>Lifetime Tasks: {hero.totalTasksCompleted}</span>
                    <span>Bosses Slain: {hero.totalBossesDefeated}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Quick Navigation Shortcuts */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { tab: 'todos', label: 'Quest Log', desc: `${todos.filter(t => !t.completed).length} active`, icon: Target },
                { tab: 'habits', label: 'Habit Forge', desc: `${habits.length} tracked`, icon: Flame },
                { tab: 'focus', label: 'Focus Chamber', desc: 'Audio & Timer', icon: Timer },
                { tab: 'loot', label: 'Loot Locker', desc: `${inventory.length} unlocked`, icon: ShoppingBag },
              ].map(card => {
                const Icon = card.icon;
                return (
                  <button
                    key={card.tab}
                    onClick={() => setActiveTab(card.tab as typeof activeTab)}
                    className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/15 text-left transition-all group"
                  >
                    <Icon size={20} className="mb-2 transition-transform group-hover:scale-110" style={{ color: accent }} />
                    <div className="font-bold text-sm text-white">{card.label}</div>
                    <div className="text-xs text-gray-500">{card.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. HABITS VIEW */}
        {activeTab === 'habits' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-wide font-mono" style={{ color: accent }}>
                  HABIT FORGE
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Build discipline & maintain continuous streaks</p>
              </div>
            </div>

            <DailyVerseCard />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {habits.map(habit => {
                const isDone = habit.completedDates.includes(todayStr());
                const hAccent = themeAccent(habit.color);

                return (
                  <div key={habit.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleHabit(habit.id)}
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all"
                        style={{
                          background: isDone ? `${hAccent}30` : 'rgba(255,255,255,0.03)',
                          border: `2px solid ${isDone ? hAccent : 'rgba(255,255,255,0.1)'}`
                        }}
                      >
                        {isDone ? <Check size={20} style={{ color: hAccent }} /> : habit.emoji}
                      </button>
                      <div>
                        <h4 className={`text-sm font-bold ${isDone ? 'line-through text-gray-500' : 'text-white'}`}>
                          {habit.name}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5 font-mono">
                          <span className="flex items-center gap-0.5 text-orange-400"><Flame size={12} /> {habit.streak}d streak</span>
                          <span>· Best: {habit.longestStreak}d</span>
                        </div>
                      </div>
                    </div>

                    {/* 7-day mini heatmap */}
                    <div className="flex gap-1">
                      {Array.from({ length: 7 }).map((_, idx) => {
                        const d = new Date();
                        d.setDate(d.getDate() - (6 - idx));
                        const ds = todayStr(d);
                        const done = habit.completedDates.includes(ds);
                        return (
                          <div
                            key={idx}
                            className="w-2.5 h-6 rounded-sm transition-all"
                            style={{ background: done ? hAccent : 'rgba(255,255,255,0.05)' }}
                            title={ds}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. QUEST LOG (TODOS) VIEW */}
        {activeTab === 'todos' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-wide font-mono" style={{ color: accent }}>
                  QUEST LOG
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Eisenhower matrix task matrix & XP missions</p>
              </div>
            </div>

            <DailyVerseCard />

            {/* Task Quadrants */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'Do First (Urgent & Important)', u: true, i: true, color: '#EF4444' },
                { title: 'Schedule (Important)', u: false, i: true, color: '#3B82F6' },
                { title: 'Delegate (Urgent)', u: true, i: false, color: '#F59E0B' },
                { title: 'Backlog', u: false, i: false, color: '#6B7280' },
              ].map(quadrant => {
                const items = todos.filter(t => t.urgent === quadrant.u && t.important === quadrant.i);
                return (
                  <div key={quadrant.title} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between min-h-[160px]">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: quadrant.color }} />
                        <h4 className="text-xs font-bold font-mono text-gray-300 uppercase">{quadrant.title}</h4>
                      </div>

                      <div className="space-y-2">
                        {items.length === 0 ? (
                          <p className="text-xs text-gray-600 italic py-2">No active missions in this sector</p>
                        ) : (
                          items.map(todo => (
                            <div
                              key={todo.id}
                              onClick={() => toggleTodo(todo.id)}
                              className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                                todo.completed ? 'bg-white/[0.01] border-white/5 opacity-50' : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div className={`w-4 h-4 rounded flex items-center justify-center text-[10px] ${
                                  todo.completed ? 'bg-green-500 text-black font-bold' : 'border border-white/20'
                                }`}>
                                  {todo.completed && '✓'}
                                </div>
                                <span className={`text-xs ${todo.completed ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                                  {todo.title}
                                </span>
                              </div>
                              <span className="text-[10px] font-mono text-gray-500">
                                {todo.important ? '+30 XP' : '+20 XP'}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. FOCUS CHAMBER (TIMER + YOUTUBE AURA BEATS + SYNTH) */}
        {activeTab === 'focus' && (
          <FocusChamberView
            accent={accent}
            focusSessions={focusSessions}
            onSessionComplete={handleFocusFinish}
          />
        )}

        {/* 5. LOOT LOCKER (CUSTOMIZATION SHOP) */}
        {activeTab === 'loot' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold tracking-wide font-mono" style={{ color: accent }}>
                  LOOT LOCKER
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">Customize cosmetic titles, borders, avatars and theme aura</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold font-mono">
                <Coins size={14} /> {hero.gold} Gold Available
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {SHOP_CATALOG.map(item => {
                const owned = inventory.includes(item.id);
                const isEquipped = (
                  (item.type === 'title' && equipped.title === item.id) ||
                  (item.type === 'avatar' && equipped.avatar === item.id) ||
                  (item.type === 'frame' && equipped.frame === item.id) ||
                  (item.type === 'theme' && equipped.theme === item.id)
                );
                const rc = rarityColor(item.rarity);

                return (
                  <div key={item.id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col justify-between relative overflow-hidden">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="text-3xl">{item.icon}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{item.name}</h4>
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded font-mono" style={{ background: `${rc}20`, color: rc }}>
                            {item.rarity}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{item.description}</p>
                      </div>
                    </div>

                    {isEquipped ? (
                      <div className="py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                        <Check size={14} /> Equipped
                      </div>
                    ) : owned ? (
                      <button
                        onClick={() => {
                          setEquipped(e => ({ ...e, [item.type]: item.id }));
                          notify(`Equipped: ${item.name}`, '⚡', 'info');
                        }}
                        className="w-full py-2 rounded-xl text-xs font-bold transition-all hover:opacity-90"
                        style={{ background: `${accent}25`, color: accent, border: `1px solid ${accent}40` }}
                      >
                        Equip Item
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (hero.gold < item.cost) {
                            notify("Not enough gold!", "⚠️", "info");
                            return;
                          }
                          setHero(h => ({ ...h, gold: h.gold - item.cost }));
                          setInventory(inv => [...inv, item.id]);
                          notify(`Unlocked: ${item.name}!`, '🛒', 'gold');
                        }}
                        disabled={hero.gold < item.cost}
                        className="w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{
                          background: hero.gold >= item.cost ? accent : 'rgba(255,255,255,0.03)',
                          color: hero.gold >= item.cost ? '#000' : '#666'
                        }}
                      >
                        {hero.gold >= item.cost ? (
                          <><Coins size={13} /> Buy · {item.cost} Gold</>
                        ) : (
                          <><Lock size={13} /> {item.cost} Gold</>
                        )}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#090714]/95 backdrop-blur-xl border-t border-white/5 flex items-center justify-around py-2 px-1">
        {[
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { id: 'habits', label: 'Habits', icon: Repeat },
          { id: 'todos', label: 'Quests', icon: ListTodo },
          { id: 'focus', label: 'Focus', icon: Timer },
          { id: 'loot', label: 'Loot', icon: ShoppingBag },
        ].map(item => {
          const active = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as typeof activeTab)}
              className={`flex flex-col items-center gap-1 px-3 py-1 text-[10px] font-medium transition-all ${
                active ? 'text-white' : 'text-gray-500'
              }`}
              style={active ? { color: accent } : {}}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ONBOARDING MODAL */}
      {showTutorial && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="glass-card max-w-md w-full p-6 border border-white/10 rounded-2xl bg-[#0f0c1d] text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl" style={{ background: `${accent}20`, color: accent }}>
              ⚒
            </div>
            <h3 className="text-xl font-bold font-mono" style={{ color: accent }}>WELCOME TO TASK FORGE</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Task Forge turns your real-world tasks, habits, and deep focus sessions into character progression. Complete quests to gain XP, unlock themes, and defeat daily bosses!
            </p>
            <button
              onClick={() => setShowTutorial(false)}
              className="w-full py-3 rounded-xl text-xs font-bold text-black"
              style={{ background: accent }}
            >
              Enter The Forge
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

// ==========================================
// 5. FOCUS CHAMBER COMPONENT WITH AUDIO & YOUTUBE
// ==========================================

function FocusChamberView({
  accent,
  focusSessions,
  onSessionComplete
}: {
  accent: string;
  focusSessions: FocusSession[];
  onSessionComplete: (mins: number, label: string) => void;
}) {
  const [selectedPreset, setSelectedPreset] = useState(1);
  const [totalSeconds, setTotalSeconds] = useState(FOCUS_PRESETS[1].minutes * 60);
  const [remainingSeconds, setRemainingSeconds] = useState(FOCUS_PRESETS[1].minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // YouTube Audio Controller State
  const [ytActiveStream, setYtActiveStream] = useState(YT_PRESET_STREAMS[0].id);
  const [ytCustomUrl, setYtCustomUrl] = useState('');
  const [ytIsPlaying, setYtIsPlaying] = useState(false);
  const [streamsList, setStreamsList] = useState(YT_PRESET_STREAMS);

  // Procedural Synth State
  const [activeSynth, setActiveSynth] = useState<Set<SoundType>>(new Set());

  // Timer Tick Logic
  useEffect(() => {
    let iv: number | null = null;
    if (isRunning && !isPaused) {
      iv = window.setInterval(() => {
        setRemainingSeconds(prev => {
          if (prev <= 1) {
            onSessionComplete(FOCUS_PRESETS[selectedPreset].minutes, FOCUS_PRESETS[selectedPreset].label);
            setIsRunning(false);
            setIsPaused(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (iv) clearInterval(iv); };
  }, [isRunning, isPaused, selectedPreset, onSessionComplete]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      ambientEngine.stopAll();
    };
  }, []);

  const handleStart = () => {
    if (remainingSeconds <= 0) {
      setRemainingSeconds(FOCUS_PRESETS[selectedPreset].minutes * 60);
    }
    setIsRunning(true);
    setIsPaused(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setRemainingSeconds(FOCUS_PRESETS[selectedPreset].minutes * 60);
  };

  const toggleSynthSound = (type: SoundType) => {
    if (activeSynth.has(type)) {
      ambientEngine.stop(type);
      setActiveSynth(prev => {
        const next = new Set(prev);
        next.delete(type);
        return next;
      });
    } else {
      ambientEngine.start(type, 0.5);
      setActiveSynth(prev => new Set(prev).add(type));
    }
  };

  const addCustomYouTube = () => {
    const input = ytCustomUrl.trim();
    if (!input) return;
    let vid = '';
    if (input.includes('watch?v=')) vid = input.split('v=')[1]?.split('&')[0] || '';
    else if (input.includes('youtu.be/')) vid = input.split('youtu.be/')[1]?.split('?')[0] || '';
    else vid = input;

    if (vid.length === 11) {
      const newStream = { id: `custom-${Date.now()}`, name: 'Custom Focus Audio', videoId: vid };
      setStreamsList(prev => [...prev, newStream]);
      setYtActiveStream(newStream.id);
      setYtIsPlaying(true);
      setYtCustomUrl('');
    } else {
      alert("Please paste a valid YouTube video URL or 11-digit video ID.");
    }
  };

  const activeStreamObj = streamsList.find(s => s.id === ytActiveStream) || streamsList[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-wide font-mono" style={{ color: accent }}>
            FOCUS CHAMBER
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Deep work timer, procedural noise & YouTube Aura Beats</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Pomodoro Circular Timer */}
        <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center">
          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {FOCUS_PRESETS.map((p, idx) => (
              <button
                key={p.label}
                disabled={isRunning}
                onClick={() => {
                  setSelectedPreset(idx);
                  setTotalSeconds(p.minutes * 60);
                  setRemainingSeconds(p.minutes * 60);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                  selectedPreset === idx ? 'text-white' : 'text-gray-500 bg-white/[0.02]'
                }`}
                style={selectedPreset === idx ? { background: `${accent}25`, color: accent, border: `1px solid ${accent}40` } : {}}
              >
                {p.label} ({p.minutes}m)
              </button>
            ))}
          </div>

          {/* Timer Display */}
          <div className="relative w-56 h-56 flex items-center justify-center mb-8">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
              <circle
                cx="100" cy="100" r="85" fill="none"
                stroke={accent}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 85}
                strokeDashoffset={2 * Math.PI * 85 * (1 - (totalSeconds > 0 ? (totalSeconds - remainingSeconds) / totalSeconds : 0))}
                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
              />
            </svg>
            <div className="absolute text-center">
              <div className="text-4xl font-extrabold font-mono tracking-wider text-white">
                {formatTime(remainingSeconds)}
              </div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono mt-1 block">
                {FOCUS_PRESETS[selectedPreset].label}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            {!isRunning ? (
              <button
                onClick={handleStart}
                className="px-8 py-3 rounded-xl text-xs font-bold text-black flex items-center gap-2 transition-all shadow-lg"
                style={{ background: accent }}
              >
                <Play size={16} fill="black" /> Engage Focus
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                  style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}40` }}
                >
                  {isPaused ? <Play size={14} /> : <Pause size={14} />} {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 text-gray-400"
                >
                  <Square size={14} />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Right Column: YouTube Focus Audio + Procedural Noise */}
        <div className="space-y-6">

          {/* YouTube Aura Beats Player */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold font-mono uppercase text-red-400 flex items-center gap-2">
                <Youtube size={16} /> Aura Beats (YouTube Focus)
              </h4>
              <button
                onClick={() => setYtIsPlaying(!ytIsPlaying)}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  ytIsPlaying ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-white/5 text-gray-400'
                }`}
              >
                {ytIsPlaying ? <Pause size={12} /> : <Play size={12} />}
                {ytIsPlaying ? 'Stream Active' : 'Stream Paused'}
              </button>
            </div>

            {/* Custom URL Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={ytCustomUrl}
                onChange={e => setYtCustomUrl(e.target.value)}
                placeholder="Paste YouTube Link or Video ID..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
              />
              <button
                onClick={addCustomYouTube}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold flex items-center gap-1"
              >
                <Plus size={14} /> Add
              </button>
            </div>

            {/* Curated Stream Selector */}
            <div className="grid grid-cols-2 gap-2">
              {streamsList.map(stream => {
                const active = ytActiveStream === stream.id;
                return (
                  <button
                    key={stream.id}
                    onClick={() => {
                      setYtActiveStream(stream.id);
                      setYtIsPlaying(true);
                    }}
                    className={`p-2.5 rounded-xl text-left text-xs transition-all border ${
                      active ? 'bg-white/10 text-white' : 'bg-white/[0.02] text-gray-400 border-white/5 hover:border-white/10'
                    }`}
                    style={active ? { borderColor: `${accent}50`, color: accent } : {}}
                  >
                    <div className="font-bold truncate">{stream.name}</div>
                    <div className="text-[10px] text-gray-500 font-mono">ID: {stream.videoId}</div>
                  </button>
                );
              })}
            </div>

            {/* Hidden Embed / Active Player Frame */}
            {ytIsPlaying && (
              <div className="rounded-xl overflow-hidden aspect-video w-full max-h-48 border border-white/10">
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${activeStreamObj.videoId}?autoplay=1&controls=1&modestbranding=1&rel=0`}
                  title="YouTube Focus Stream"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>
            )}
          </div>

          {/* Procedural Ambient Sound Layers */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
            <h4 className="text-xs font-bold font-mono uppercase text-gray-300 flex items-center gap-2">
              <Volume2 size={15} style={{ color: accent }} /> Procedural Noise Mixer
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { type: 'rain' as SoundType, label: 'Rain', icon: '🌧️' },
                { type: 'ocean' as SoundType, label: 'Ocean', icon: '🌊' },
                { type: 'cafe' as SoundType, label: 'Café', icon: '☕' },
                { type: 'white' as SoundType, label: 'White', icon: '📻' },
                { type: 'pink' as SoundType, label: 'Pink', icon: '🩷' },
                { type: 'brown' as SoundType, label: 'Brown', icon: '🟤' },
                { type: 'binaural' as SoundType, label: 'Alpha', icon: '🧠' },
              ].map(s => {
                const active = activeSynth.has(s.type);
                return (
                  <button
                    key={s.type}
                    onClick={() => toggleSynthSound(s.type)}
                    className={`p-2.5 rounded-xl text-xs flex items-center gap-2 transition-all border ${
                      active ? 'text-white' : 'bg-white/[0.02] text-gray-500 border-white/5'
                    }`}
                    style={active ? { background: `${accent}25`, borderColor: `${accent}40`, color: accent } : {}}
                  >
                    <span>{s.icon}</span>
                    <span className="font-bold">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
