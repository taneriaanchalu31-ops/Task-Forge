import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Repeat, ListTodo, Timer, ShoppingBag,
  Flame, Sword, Zap, Target, BookOpen, Heart, Plus, Trash2, Check,
  Play, Pause, Square, Clock, Volume2, Quote, Youtube,
  Coins, Lock, X, Shuffle, TrendingUp, Edit3, Music, AlertTriangle, Star,
  ChevronRight, ChevronLeft, User, RefreshCw
} from 'lucide-react';

// ============================================
// TYPES
// ============================================
type SoundType = 'rain' | 'ocean' | 'cafe' | 'white' | 'pink' | 'brown' | 'binaural';
type ShopType = 'title' | 'avatar' | 'frame' | 'theme';
type Rarity = 'common' | 'rare' | 'epic' | 'legendary' | 'mythic';

interface Hero {
  name: string; level: number; xp: number; gold: number;
  streakDays: number; lastActiveDate: string;
  totalTasks: number; totalHabits: number; totalFocus: number; totalBosses: number;
  profilePic: string | null;
  userId: string;
}
interface Todo {
  id: string; title: string; notes: string;
  urgent: boolean; important: boolean;
  completed: boolean; rewardClaimed: boolean;
  createdAt: string; completedAt?: string;
}
interface Habit {
  id: string; name: string; emoji: string; color: string;
  streak: number; longestStreak: number;
  completedDates: string[]; createdAt: string;
  rewardedDates: string[];
}
interface Boss {
  id: string; name: string; emoji: string;
  level: number; maxHp: number; hp: number;
  date: string; defeatCount: number;
  rewardGold: number; rewardXp: number;
}
interface FocusSession { id: string; date: string; minutes: number; label: string; }
interface ShopItem {
  id: string; name: string; description: string;
  type: ShopType; cost: number; icon: string;
  rarity: Rarity; value: string;
}
interface Equipped { frame: string; theme: string; title: string; avatar: string; }
interface Toast { id: string; message: string; icon: string; tone: string; }
interface Verse { text: string; ref: string; }

// ============================================
// DATA
// ============================================
const VERSES: Verse[] = [
  { text: "Whatever you do, work at it with all your heart, as working for the Lord.", ref: "Colossians 3:23" },
  { text: "Commit to the Lord whatever you do, and he will establish your plans.", ref: "Proverbs 16:3" },
  { text: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13" },
  { text: "Those who hope in the Lord will renew their strength.", ref: "Isaiah 40:31" },
  { text: "Be strong and courageous. Do not be afraid; do not be discouraged.", ref: "Joshua 1:9" },
  { text: "Trust in the Lord with all your heart and lean not on your own understanding.", ref: "Proverbs 3:5-6" },
  { text: "For God has not given us a spirit of fear, but of power, love, and a sound mind.", ref: "2 Timothy 1:7" },
  { text: "All hard work brings a profit, but mere talk leads only to poverty.", ref: "Proverbs 14:23" },
  { text: "The plans of the diligent lead to profit as surely as haste leads to poverty.", ref: "Proverbs 21:5" },
  { text: "Whatever your hand finds to do, do it with all your might.", ref: "Ecclesiastes 9:10" },
  { text: "God is our refuge and strength, an ever-present help in trouble.", ref: "Psalm 46:1" },
  { text: "My grace is sufficient for you, for my power is made perfect in weakness.", ref: "2 Corinthians 12:9" },
  { text: "Let us not become weary in doing good, for at the proper time we will reap a harvest.", ref: "Galatians 6:9" },
  { text: "The Lord is my shepherd, I lack nothing.", ref: "Psalm 23:1" },
  { text: "Peace I leave with you; my peace I give you.", ref: "John 14:27" },
  { text: "Be still, and know that I am God.", ref: "Psalm 46:10" },
  { text: "You will keep in perfect peace those whose minds are steadfast.", ref: "Isaiah 26:3" },
  { text: "Come to me, all you who are weary and burdened, and I will give you rest.", ref: "Matthew 11:28" },
  { text: "Cast all your anxiety on him because he cares for you.", ref: "1 Peter 5:7" },
  { text: "For I know the plans I have for you, plans to prosper you and to give you hope.", ref: "Jeremiah 29:11" },
  { text: "The steadfast love of the Lord never ceases; his mercies are new every morning.", ref: "Lamentations 3:22-23" },
  { text: "In all these things we are more than conquerors through him who loved us.", ref: "Romans 8:37" },
  { text: "I have fought the good fight, I have finished the race, I have kept the faith.", ref: "2 Timothy 4:7" },
  { text: "Seek first the kingdom of God, and all these things will be added to you.", ref: "Matthew 6:33" },
  { text: "Above all else, guard your heart, for everything you do flows from it.", ref: "Proverbs 4:23" },
  { text: "If any of you lacks wisdom, you should ask God, who gives generously.", ref: "James 1:5" },
  { text: "Your word is a lamp for my feet, a light on my path.", ref: "Psalm 119:105" },
];

const SHOP: ShopItem[] = [
  // TITLES (18)
  { id: 't-novice', name: 'Novice', description: 'Every legend begins here.', type: 'title', cost: 0, icon: '📜', rarity: 'common', value: 'Novice' },
  { id: 't-warrior', name: 'Warrior', description: 'Battle-tested and ready.', type: 'title', cost: 60, icon: '⚔️', rarity: 'common', value: 'Warrior' },
  { id: 't-scholar', name: 'Scholar', description: 'Master of knowledge.', type: 'title', cost: 90, icon: '📚', rarity: 'common', value: 'Scholar' },
  { id: 't-ranger', name: 'Ranger', description: 'Silent stalker of tasks.', type: 'title', cost: 120, icon: '🏹', rarity: 'common', value: 'Ranger' },
  { id: 't-monk', name: 'Monk', description: 'Focus is your temple.', type: 'title', cost: 140, icon: '🧘', rarity: 'common', value: 'Monk' },
  { id: 't-champion', name: 'Champion', description: 'Crusher of obstacles.', type: 'title', cost: 180, icon: '🏆', rarity: 'rare', value: 'Champion' },
  { id: 't-shadow', name: 'Shadow Blade', description: 'Works in silence.', type: 'title', cost: 220, icon: '🗡️', rarity: 'rare', value: 'Shadow Blade' },
  { id: 't-viking', name: 'Viking Chief', description: 'Fearless conqueror.', type: 'title', cost: 250, icon: '🛡️', rarity: 'rare', value: 'Viking Chief' },
  { id: 't-samurai', name: 'Samurai', description: 'Honor bound warrior.', type: 'title', cost: 280, icon: '🎌', rarity: 'rare', value: 'Samurai' },
  { id: 't-archmage', name: 'Archmage', description: 'Wielder of productivity arts.', type: 'title', cost: 300, icon: '🧙', rarity: 'epic', value: 'Archmage' },
  { id: 't-phoenix', name: 'Phoenix Lord', description: 'Reborn from every failure.', type: 'title', cost: 380, icon: '🔥', rarity: 'epic', value: 'Phoenix Lord' },
  { id: 't-void', name: 'Void Walker', description: 'Master of the impossible.', type: 'title', cost: 450, icon: '🌌', rarity: 'epic', value: 'Void Walker' },
  { id: 't-dragonlord', name: 'Dragon Lord', description: 'Tamer of chaos.', type: 'title', cost: 500, icon: '🐉', rarity: 'epic', value: 'Dragon Lord' },
  { id: 't-legend', name: 'Mythic Legend', description: 'Only true grinders reach here.', type: 'title', cost: 600, icon: '👑', rarity: 'legendary', value: 'Mythic Legend' },
  { id: 't-god', name: 'Godslayer', description: 'You defeated the impossible.', type: 'title', cost: 900, icon: '⚡', rarity: 'legendary', value: 'Godslayer' },
  { id: 't-immortal', name: 'The Immortal', description: 'Beyond death itself.', type: 'title', cost: 1100, icon: '💫', rarity: 'legendary', value: 'The Immortal' },
  { id: 't-eternal', name: 'The Eternal One', description: 'Transcended reality.', type: 'title', cost: 1500, icon: '✨', rarity: 'mythic', value: 'The Eternal One' },
  { id: 't-cosmic', name: 'Cosmic Emperor', description: 'Ruler of dimensions.', type: 'title', cost: 2000, icon: '🌠', rarity: 'mythic', value: 'Cosmic Emperor' },

  // AVATARS (20)
  { id: 'a-fox', name: 'Swift Fox', description: 'Quick and cunning.', type: 'avatar', cost: 0, icon: '🦊', rarity: 'common', value: '🦊' },
  { id: 'a-wolf', name: 'Lone Wolf', description: 'Fierce independence.', type: 'avatar', cost: 75, icon: '🐺', rarity: 'common', value: '🐺' },
  { id: 'a-bear', name: 'Grizzly Bear', description: 'Raw strength.', type: 'avatar', cost: 90, icon: '🐻', rarity: 'common', value: '🐻' },
  { id: 'a-panda', name: 'Zen Panda', description: 'Calm & focused.', type: 'avatar', cost: 95, icon: '🐼', rarity: 'common', value: '🐼' },
  { id: 'a-owl', name: 'Wise Owl', description: 'Deep insight.', type: 'avatar', cost: 100, icon: '🦉', rarity: 'rare', value: '🦉' },
  { id: 'a-eagle', name: 'Sky Eagle', description: 'Soars above obstacles.', type: 'avatar', cost: 120, icon: '🦅', rarity: 'rare', value: '🦅' },
  { id: 'a-lion', name: 'Golden Lion', description: 'King of the hunt.', type: 'avatar', cost: 150, icon: '🦁', rarity: 'rare', value: '🦁' },
  { id: 'a-tiger', name: 'Shadow Tiger', description: 'Silent predator.', type: 'avatar', cost: 180, icon: '🐯', rarity: 'rare', value: '🐯' },
  { id: 'a-shark', name: 'Deep Shark', description: 'Never stops moving.', type: 'avatar', cost: 200, icon: '🦈', rarity: 'rare', value: '🦈' },
  { id: 'a-robot', name: 'Focus Bot', description: 'Maximum efficiency.', type: 'avatar', cost: 220, icon: '🤖', rarity: 'epic', value: '🤖' },
  { id: 'a-ninja', name: 'Silent Ninja', description: 'Strike and vanish.', type: 'avatar', cost: 260, icon: '🥷', rarity: 'epic', value: '🥷' },
  { id: 'a-dragon', name: 'Solar Dragon', description: 'Unstoppable power.', type: 'avatar', cost: 280, icon: '🐉', rarity: 'epic', value: '🐉' },
  { id: 'a-phoenix', name: 'Reborn Phoenix', description: 'Rises from ashes.', type: 'avatar', cost: 400, icon: '🔥', rarity: 'epic', value: '🔥' },
  { id: 'a-wizard', name: 'Grand Wizard', description: 'Master of arcane arts.', type: 'avatar', cost: 450, icon: '🧙', rarity: 'epic', value: '🧙' },
  { id: 'a-unicorn', name: 'Starlight Unicorn', description: 'Rare magical brilliance.', type: 'avatar', cost: 500, icon: '🦄', rarity: 'legendary', value: '🦄' },
  { id: 'a-alien', name: 'Cosmic Alien', description: 'From another dimension.', type: 'avatar', cost: 650, icon: '👽', rarity: 'legendary', value: '👽' },
  { id: 'a-angel', name: 'Guardian Angel', description: 'Heavenly protection.', type: 'avatar', cost: 750, icon: '😇', rarity: 'legendary', value: '😇' },
  { id: 'a-crystal', name: 'Crystal Being', description: 'Made of pure focus.', type: 'avatar', cost: 800, icon: '💎', rarity: 'legendary', value: '💎' },
  { id: 'a-galaxy', name: 'Galaxy Spirit', description: 'Transcendent existence.', type: 'avatar', cost: 1200, icon: '🌟', rarity: 'mythic', value: '🌟' },
  { id: 'a-god', name: 'The Divine', description: 'Ultimate ascendance.', type: 'avatar', cost: 1800, icon: '☀️', rarity: 'mythic', value: '☀️' },

  // FRAMES (14)
  { id: 'f-none', name: 'Standard', description: 'Clean minimalist border.', type: 'frame', cost: 0, icon: '⬜', rarity: 'common', value: 'none' },
  { id: 'f-bronze', name: 'Bronze Ring', description: 'Solid bronze border.', type: 'frame', cost: 50, icon: '🥉', rarity: 'common', value: 'bronze' },
  { id: 'f-silver', name: 'Silver Crest', description: 'Polished silver ring.', type: 'frame', cost: 120, icon: '🥈', rarity: 'rare', value: 'silver' },
  { id: 'f-emerald', name: 'Emerald Halo', description: "Nature's glow.", type: 'frame', cost: 180, icon: '🟢', rarity: 'rare', value: 'emerald' },
  { id: 'f-ruby', name: 'Ruby Circle', description: 'Bright red border.', type: 'frame', cost: 220, icon: '🔴', rarity: 'rare', value: 'ruby' },
  { id: 'f-sapphire', name: 'Sapphire Ring', description: 'Deep blue elegance.', type: 'frame', cost: 250, icon: '🔵', rarity: 'rare', value: 'sapphire' },
  { id: 'f-gold', name: 'Gold Aegis', description: 'Gleaming brilliance.', type: 'frame', cost: 280, icon: '🥇', rarity: 'epic', value: 'gold' },
  { id: 'f-fire', name: 'Inferno Ring', description: 'Radiating fire energy.', type: 'frame', cost: 350, icon: '🔥', rarity: 'epic', value: 'fire' },
  { id: 'f-ice', name: 'Frost Halo', description: 'Cold and unbreakable.', type: 'frame', cost: 400, icon: '❄️', rarity: 'epic', value: 'ice' },
  { id: 'f-thunder', name: 'Thunder Frame', description: 'Crackling lightning.', type: 'frame', cost: 450, icon: '⚡', rarity: 'epic', value: 'thunder' },
  { id: 'f-diamond', name: 'Diamond Aura', description: 'Crystalline brilliance.', type: 'frame', cost: 550, icon: '💎', rarity: 'legendary', value: 'diamond' },
  { id: 'f-cosmic', name: 'Cosmic Ring', description: 'Space-time frame.', type: 'frame', cost: 800, icon: '🌌', rarity: 'legendary', value: 'cosmic' },
  { id: 'f-holy', name: 'Holy Halo', description: 'Divine sanctified glow.', type: 'frame', cost: 1000, icon: '😇', rarity: 'legendary', value: 'holy' },
  { id: 'f-rainbow', name: 'Prism Halo', description: 'All colors, all power.', type: 'frame', cost: 1500, icon: '🌈', rarity: 'mythic', value: 'rainbow' },

  // THEMES (18)
  { id: 'th-violet', name: 'Nebula Violet', description: 'Royal cosmic purple.', type: 'theme', cost: 0, icon: '💜', rarity: 'common', value: 'violet' },
  { id: 'th-cyan', name: 'Cyber Cyan', description: 'Futuristic blue.', type: 'theme', cost: 60, icon: '💎', rarity: 'common', value: 'cyan' },
  { id: 'th-emerald', name: 'Emerald Forest', description: 'Vital green energy.', type: 'theme', cost: 60, icon: '💚', rarity: 'common', value: 'emerald' },
  { id: 'th-amber', name: 'Solar Amber', description: 'Golden warmth.', type: 'theme', cost: 90, icon: '🌟', rarity: 'rare', value: 'amber' },
  { id: 'th-rose', name: 'Neon Rose', description: 'Passionate fire.', type: 'theme', cost: 90, icon: '🌹', rarity: 'rare', value: 'rose' },
  { id: 'th-sky', name: 'Sky Blue', description: 'Limitless horizons.', type: 'theme', cost: 100, icon: '🩵', rarity: 'rare', value: 'sky' },
  { id: 'th-lime', name: 'Toxic Lime', description: 'Electric green.', type: 'theme', cost: 100, icon: '🟢', rarity: 'rare', value: 'lime' },
  { id: 'th-teal', name: 'Ocean Teal', description: 'Balanced calm.', type: 'theme', cost: 110, icon: '🌊', rarity: 'rare', value: 'teal' },
  { id: 'th-orange', name: 'Sunset Orange', description: 'Warm evening glow.', type: 'theme', cost: 120, icon: '🧡', rarity: 'rare', value: 'orange' },
  { id: 'th-indigo', name: 'Deep Indigo', description: 'Cosmic depths.', type: 'theme', cost: 130, icon: '🔮', rarity: 'epic', value: 'indigo' },
  { id: 'th-fuchsia', name: 'Neon Fuchsia', description: 'Bold electric pink.', type: 'theme', cost: 180, icon: '💗', rarity: 'epic', value: 'fuchsia' },
  { id: 'th-crimson', name: 'Blood Crimson', description: 'Maximum intensity.', type: 'theme', cost: 220, icon: '❤️‍🔥', rarity: 'epic', value: 'crimson' },
  { id: 'th-jade', name: 'Imperial Jade', description: 'Ancient wealth.', type: 'theme', cost: 260, icon: '🟩', rarity: 'epic', value: 'jade' },
  { id: 'th-mint', name: 'Mint Frost', description: 'Cool refreshing tone.', type: 'theme', cost: 350, icon: '🧊', rarity: 'legendary', value: 'mint' },
  { id: 'th-gold', name: 'Royal Gold', description: 'Wealth and power.', type: 'theme', cost: 400, icon: '👑', rarity: 'legendary', value: 'gold' },
  { id: 'th-platinum', name: 'Platinum White', description: 'Ultimate purity.', type: 'theme', cost: 600, icon: '⚪', rarity: 'legendary', value: 'platinum' },
  { id: 'th-void', name: 'Void Black', description: 'Deep space aura.', type: 'theme', cost: 900, icon: '🌑', rarity: 'mythic', value: 'void' },
  { id: 'th-prism', name: 'Prism Aurora', description: 'Ever-shifting colors.', type: 'theme', cost: 1500, icon: '🌈', rarity: 'mythic', value: 'prism' },
];

const BOSSES = [
  { name: 'The Procrastinator', emoji: '👹' },
  { name: 'Deadline Beast', emoji: '🐉' },
  { name: 'Distraction Lord', emoji: '👻' },
  { name: 'The Time Eater', emoji: '⏳' },
  { name: 'Chaos Titan', emoji: '⚔️' },
  { name: 'Entropy Wraith', emoji: '💀' },
];

const FOCUS_PRESETS = [
  { label: 'Quick', minutes: 10 },
  { label: 'Sprint', minutes: 25 },
  { label: 'Deep Work', minutes: 50 },
  { label: 'Marathon', minutes: 90 },
];

// YouTube streams — MULTIPLE fallback IDs per category so if one fails another plays
const YT_CATEGORIES: { id: string; name: string; tag: string; videos: string[] }[] = [
  { id: 'lofi', name: 'Lofi Focus Beats', tag: 'Lofi', videos: ['jfKfPfyJRdk', '5qap5aO4i9A', 'DWcJFNfaw9c', 'rUxyKA_-grg'] },
  { id: 'jazz', name: 'Smooth Jazz Radio', tag: 'Jazz', videos: ['Dx5qFachd3A', 'neV3EPgvZ3g', 'fEvM-OUbaKs', 'DSGyEsJ17cI'] },
  { id: 'birds', name: 'Forest Birds Singing', tag: 'Nature', videos: ['xNN7iTA57jM', 'OdIJ2x3nxzQ', 'mPZkdNFkNps', 'eKFTSSKCzWA'] },
  { id: 'ethio-worship', name: 'Ethiopian Worship 🇪🇹', tag: 'Christian', videos: ['dCbOTU8DvNo', 'V-vJDA76m2M', 'w82L0DK-RTM', 'yhg5FKl0ADI'] },
  { id: 'ethio-mezmur', name: 'Ethiopian Mezmur 🇪🇹', tag: 'Christian', videos: ['ZzWXFrRVSTM', 'DBQ2ap1UDPI', 'GKgLzT_HRVo', 'yhg5FKl0ADI'] },
  { id: 'christian-worship', name: 'English Worship', tag: 'Christian', videos: ['h55G_UB4c1U', 'BsB3RyaBIkc', 'q_lRTGBnvbo', 'HqmvHRJVE2E'] },
  { id: 'christian-instrumental', name: 'Christian Instrumental', tag: 'Christian', videos: ['XljqNBiRitk', 'FA-4E_yZDvE', 'sPO2E4hp4Mk', 'lIU7ke9dqQU'] },
  { id: 'hillsong', name: 'Hillsong Worship', tag: 'Christian', videos: ['fnDeeI6oOsY', 'BsB3RyaBIkc', 'BwOYhXsw0Ck', 'HqmvHRJVE2E'] },
  { id: 'kingdom-sounds', name: 'Kingdom Sounds', tag: 'Christian', videos: ['FA-4E_yZDvE', 'sPO2E4hp4Mk', 'XljqNBiRitk', 'lIU7ke9dqQU'] },
  { id: 'synth', name: 'Synthwave Radio', tag: 'Synth', videos: ['4xDzrJKXOOY', 'MVPTGNGiI-4', 'JcVDwOAsvR8'] },
  { id: 'classical', name: 'Classical Focus', tag: 'Classical', videos: ['jgpJVI3tDbY', '9E6b3swbnWg', 'mIYzp5rcTvU'] },
  { id: 'piano', name: 'Peaceful Piano', tag: 'Piano', videos: ['4oStw0r33so', 'lTRiuFIWV54', 'M-Vmn3yTNZE'] },
  { id: 'rain-forest', name: 'Rain in Forest', tag: 'Nature', videos: ['nDq6TstdEi8', 'q76bMs-NwRk', 'JCLL6EiuVeQ'] },
  { id: 'space', name: 'Deep Space Ambient', tag: 'Ambient', videos: ['S_DFq9Rev8M', 'i9dgm3O43yo', 'H8YM6NojdAI'] },
];

const EMOJIS = [
  '💧','🏋️','📖','🧘','🥗','💤','🎯','✍️','🏃','💻','🌅','🧠','🍎','📝','🎨','🎵','🧹','☕','🌱','⭐',
  '🔥','💪','🚀','🌊','🌙','🍵','📱','💊','🎮','🎸','🚴','🏊','🥑','🧴','🕯️','📞','🥋','🏄','🎤','🕊️',
  '💰','📷','🎬','🌸','🌻','🍀','🎪','🎁','🎳','🎨','🖌️','📚','🔬','🎓','🏅','⚽','🏀','🎾','⛹️','🎯'
];

const COOLDOWN = 60 * 60 * 1000;

// ============================================
// UTILITIES
// ============================================
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

const todayStr = (d = new Date()) => {
  const off = d.getTimezoneOffset();
  return new Date(d.getTime() - off * 60000).toISOString().slice(0, 10);
};

const xpForLevel = (lvl: number) => Math.round(80 + (lvl - 1) * 42);

const computeStreak = (dates: string[]) => {
  if (!dates.length) return 0;
  const set = new Set(dates);
  const today = todayStr();
  const cursor = new Date();
  if (!set.has(today)) {
    cursor.setDate(cursor.getDate() - 1);
    if (!set.has(todayStr(cursor))) return 0;
  }
  let streak = 0;
  while (set.has(todayStr(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

const formatTime = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

const themeAccent = (t: string): string => {
  const map: Record<string, string> = {
    violet: '#8B5CF6', cyan: '#06B6D4', emerald: '#10B981',
    rose: '#F43F5E', amber: '#F59E0B', indigo: '#6366F1',
    teal: '#14B8A6', fuchsia: '#D946EF', sky: '#0EA5E9',
    lime: '#84CC16', crimson: '#DC2626', gold: '#EAB308',
    mint: '#5EEAD4', void: '#6B7280', orange: '#F97316',
    jade: '#059669', platinum: '#E5E7EB', prism: '#EC4899',
  };
  return map[t] || map.violet;
};

const rarityColor = (r: Rarity): string => ({
  common: '#9CA3AF', rare: '#60A5FA', epic: '#A78BFA',
  legendary: '#FBBF24', mythic: '#F472B6'
}[r]);

// ============================================
// AUDIO ENGINE
// ============================================
class AudioEngine {
  ctx: AudioContext | null = null;
  master: GainNode | null = null;
  layers = new Map<SoundType, { vol: number; nodes: AudioNode[]; sources: AudioNode[] }>();

  init() {
    if (!this.ctx || this.ctx.state === 'closed') {
      const AC = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0.6;
      this.master.connect(this.ctx.destination);
    }
    return this.ctx;
  }

  async start(type: SoundType, vol = 0.5) {
    const ctx = this.init();
    if (ctx.state === 'suspended') await ctx.resume();
    this.stop(type);

    const g = ctx.createGain();
    g.gain.value = 0;
    g.connect(this.master!);
    const nodes: AudioNode[] = [g];
    const sources: AudioNode[] = [];

    const noise = (secs: number) => {
      const buf = ctx.createBuffer(2, ctx.sampleRate * secs, ctx.sampleRate);
      for (let c = 0; c < 2; c++) {
        const d = buf.getChannelData(c);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * 0.3;
      }
      return buf;
    };

    if (type === 'rain' || type === 'ocean' || type === 'cafe' || type === 'white' || type === 'pink' || type === 'brown') {
      const src = ctx.createBufferSource();
      src.buffer = noise(type === 'ocean' ? 4 : 2);
      src.loop = true;
      if (type === 'brown') {
        const b = src.buffer.getChannelData(0);
        let last = 0;
        for (let i = 0; i < b.length; i++) { last = (last + 0.02 * b[i]) / 1.02; b[i] = last * 2.5; }
      }
      if (type !== 'white' && type !== 'brown') {
        const f = ctx.createBiquadFilter();
        f.type = type === 'cafe' ? 'bandpass' : 'lowpass';
        f.frequency.value = type === 'rain' ? 1200 : type === 'ocean' ? 500 : 850;
        src.connect(f); f.connect(g);
        nodes.push(f);
      } else {
        src.connect(g);
      }
      src.start();
      sources.push(src);
    } else if (type === 'binaural') {
      const oL = ctx.createOscillator();
      const oR = ctx.createOscillator();
      oL.frequency.value = 210;
      oR.frequency.value = 220;
      const m = ctx.createChannelMerger(2);
      oL.connect(m, 0, 0); oR.connect(m, 0, 1);
      m.connect(g);
      oL.start(); oR.start();
      sources.push(oL, oR); nodes.push(m);
    }

    g.gain.setTargetAtTime(vol, ctx.currentTime, 0.2);
    this.layers.set(type, { vol, nodes, sources });
  }

  stop(type: SoundType) {
    const l = this.layers.get(type);
    if (!l) return;
    l.sources.forEach(s => { try { (s as any).stop(); } catch {} try { s.disconnect(); } catch {} });
    l.nodes.forEach(n => { try { n.disconnect(); } catch {} });
    this.layers.delete(type);
  }

  stopAll() { Array.from(this.layers.keys()).forEach(k => this.stop(k)); }
}

const engine = new AudioEngine();

// ============================================
// PERSISTENCE (Per User)
// ============================================
const getOrCreateUserId = (): string => {
  try {
    let id = localStorage.getItem('tf_user_id');
    if (!id) {
      id = 'user_' + uid();
      localStorage.setItem('tf_user_id', id);
    }
    return id;
  } catch {
    return 'user_' + uid();
  }
};

const useStored = <T,>(key: string, initial: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const userKey = `${key}_${getOrCreateUserId()}`;
  const [val, setVal] = useState<T>(() => {
    try {
      const s = localStorage.getItem(userKey);
      return s ? JSON.parse(s) : initial;
    } catch { return initial; }
  });
  useEffect(() => {
    try { localStorage.setItem(userKey, JSON.stringify(val)); } catch {}
  }, [userKey, val]);
  return [val, setVal];
};

const makeBoss = (heroLevel: number, defeatCount: number): Boss => {
  const t = BOSSES[Math.floor(Math.random() * BOSSES.length)];
  const lvl = Math.max(1, heroLevel + defeatCount);
  const hp = Math.round(90 + lvl * 35);
  return {
    id: uid(), name: t.name, emoji: t.emoji,
    level: lvl, maxHp: hp, hp, date: todayStr(),
    defeatCount, rewardGold: Math.round(30 + lvl * 8), rewardXp: Math.round(40 + lvl * 10),
  };
};

// ============================================
// MAIN APP
// ============================================
export default function App() {
  const [tab, setTab] = useState<'dash' | 'habits' | 'todos' | 'focus' | 'loot'>('dash');
  const [showTut, setShowTut] = useStored<boolean>('tf_show_tutorial', true);
  const [showTutorialModal, setShowTutorialModal] = useState(false);

  useEffect(() => {
    if (showTut) setShowTutorialModal(true);
  }, []);

  const [hero, setHero] = useStored<Hero>('tf_hero_v3', {
    name: 'Hero', level: 1, xp: 0, gold: 40,
    streakDays: 1, lastActiveDate: todayStr(),
    totalTasks: 0, totalHabits: 0, totalFocus: 0, totalBosses: 0,
    profilePic: null, userId: getOrCreateUserId(),
  });

  const [equipped, setEquipped] = useStored<Equipped>('tf_eq_v3', {
    frame: 'f-none', theme: 'th-violet', title: 't-novice', avatar: 'a-fox',
  });

  const [inventory, setInventory] = useStored<string[]>('tf_inv_v3',
    ['t-novice', 'a-fox', 'f-none', 'th-violet']);

  const [habits, setHabits] = useStored<Habit[]>('tf_habits_v3', []);
  const [todos, setTodos] = useStored<Todo[]>('tf_todos_v3', []);
  const [boss, setBoss] = useStored<Boss>('tf_boss_v3', makeBoss(1, 0));
  const [sessions, setSessions] = useStored<FocusSession[]>('tf_sess_v3', []);
  const [lastAtk, setLastAtk] = useStored<number>('tf_atk_v3', 0);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const themeName = SHOP.find(s => s.id === equipped.theme)?.value || 'violet';
  const accent = themeAccent(themeName);

  const notify = useCallback((msg: string, icon: string, tone = 'info') => {
    const t: Toast = { id: uid(), message: msg, icon, tone };
    setToasts(p => [t, ...p].slice(0, 3));
    setTimeout(() => setToasts(p => p.filter(x => x.id !== t.id)), 3200);
  }, []);

  const touch = useCallback(() => {
    const today = todayStr();
    setHero(h => {
      if (h.lastActiveDate === today) return h;
      const y = new Date(); y.setDate(y.getDate() - 1);
      const newStreak = h.lastActiveDate === todayStr(y) ? h.streakDays + 1 : 1;
      return { ...h, lastActiveDate: today, streakDays: newStreak };
    });
  }, [setHero]);

  const grantXp = useCallback((amt: number) => {
    setHero(h => {
      let { level, xp } = h; xp += amt;
      let leveled = false;
      while (xp >= xpForLevel(level)) { xp -= xpForLevel(level); level++; leveled = true; }
      if (leveled) setTimeout(() => notify(`⬆️ Level Up! Now Level ${level}!`, '✨', 'levelup'), 100);
      return { ...h, level, xp, gold: h.gold + (leveled ? 25 : 0) };
    });
  }, [setHero, notify]);

  const grantGold = useCallback((a: number) => setHero(h => ({ ...h, gold: Math.max(0, h.gold + a) })), [setHero]);

  const damageBoss = useCallback((dmg: number) => {
    setBoss(b => {
      const newHp = Math.max(0, b.hp - dmg);
      if (newHp === 0 && b.hp > 0) {
        setTimeout(() => {
          notify(`💀 Boss slain: ${b.name}! +${b.rewardXp} XP, +${b.rewardGold} Gold`, '💀', 'boss');
          grantXp(b.rewardXp); grantGold(b.rewardGold);
          setHero(h => ({ ...h, totalBosses: h.totalBosses + 1 }));
        }, 100);
        return makeBoss(hero.level, b.defeatCount + 1);
      }
      return { ...b, hp: newHp };
    });
  }, [hero.level, setBoss, setHero, grantXp, grantGold, notify]);

  const quickAtk = () => {
    const now = Date.now();
    if (now - lastAtk < COOLDOWN) return;
    setLastAtk(now);
    const dmg = 12 + hero.level * 4;
    damageBoss(dmg);
    grantXp(15);
    notify(`⚡ Quick Attack! -${dmg} HP`, '⚡', 'success');
  };

  // TASKS
  const completeTask = (id: string) => {
    setTodos(prev => prev.map(t => {
      if (t.id !== id) return t;
      if (t.rewardClaimed) return { ...t, completed: true, completedAt: todayStr() };
      const xp = t.important ? 30 : 20;
      const gold = t.important ? 12 : 8;
      grantXp(xp); grantGold(gold);
      damageBoss(t.important ? 15 : 10);
      touch();
      setHero(h => ({ ...h, totalTasks: h.totalTasks + 1 }));
      notify(`✅ Quest done! +${xp} XP, +${gold} Gold`, '✅', 'success');
      return { ...t, completed: true, completedAt: todayStr(), rewardClaimed: true };
    }));
  };

  const uncompleteTask = (id: string) => setTodos(prev => prev.map(t => t.id !== id ? t : { ...t, completed: false }));
  const deleteTask = (id: string) => setTodos(prev => prev.filter(t => t.id !== id));
  const addTask = (title: string, notes: string, urgent: boolean, important: boolean) => {
    if (!title.trim()) return;
    setTodos(p => [{
      id: uid(), title: title.trim(), notes: notes.trim(),
      urgent, important, completed: false, rewardClaimed: false, createdAt: todayStr(),
    }, ...p]);
    notify(`New quest added!`, '📜', 'info');
  };

  // HABITS — TRUE ANTI-CHEAT
  const toggleHabit = (id: string) => {
    const today = todayStr();
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const isDone = h.completedDates.includes(today);
      if (isDone) {
        const newDates = h.completedDates.filter(d => d !== today);
        return { ...h, completedDates: newDates, streak: computeStreak(newDates) };
      } else {
        const newDates = [...h.completedDates, today];
        const newStreak = computeStreak(newDates);
        // ONLY reward if today was NEVER previously rewarded
        const alreadyRewarded = h.rewardedDates?.includes(today);
        if (!alreadyRewarded) {
          grantXp(20); grantGold(8);
          damageBoss(10); touch();
          setHero(hero => ({ ...hero, totalHabits: hero.totalHabits + 1 }));
          notify(`🔥 ${h.emoji} ${h.name} +20 XP`, '🔥', 'success');
        } else {
          notify(`✓ ${h.name} re-checked (no reward)`, '✓', 'info');
        }
        return {
          ...h,
          completedDates: newDates,
          streak: newStreak,
          longestStreak: Math.max(h.longestStreak, newStreak),
          rewardedDates: alreadyRewarded ? h.rewardedDates : [...(h.rewardedDates || []), today],
        };
      }
    }));
  };

  const deleteHabit = (id: string) => setHabits(p => p.filter(h => h.id !== id));
  const addHabit = (name: string, emoji: string, color: string) => {
    if (!name.trim()) return;
    setHabits(p => [{
      id: uid(), name: name.trim(), emoji, color,
      streak: 0, longestStreak: 0, completedDates: [], rewardedDates: [], createdAt: todayStr(),
    }, ...p]);
    notify(`New habit forged!`, '🔥', 'info');
  };

  const focusFinish = (mins: number, label: string) => {
    setSessions(p => [{ id: uid(), date: todayStr(), minutes: mins, label }, ...p]);
    const xp = mins * 2; const gold = Math.round(mins * 0.8);
    grantXp(xp); grantGold(gold);
    damageBoss(Math.round(mins * 0.6));
    touch();
    setHero(h => ({ ...h, totalFocus: h.totalFocus + mins }));
    notify(`⏱️ ${mins}m focus +${xp} XP`, '⏱️', 'success');
  };

  const buyItem = (item: ShopItem) => {
    if (inventory.includes(item.id)) return;
    if (hero.gold < item.cost) { notify('Not enough gold!', '⚠️', 'info'); return; }
    setHero(h => ({ ...h, gold: h.gold - item.cost }));
    setInventory(i => [...i, item.id]);
    notify(`🛒 Unlocked: ${item.name}`, '🛒', 'gold');
  };

  const equipItem = (item: ShopItem) => {
    setEquipped(e => ({ ...e, [item.type]: item.id }));
    notify(`⚡ Equipped: ${item.name}`, '⚡', 'info');
  };

  const avatarIcon = SHOP.find(i => i.id === equipped.avatar)?.icon || '🦊';
  const titleText = SHOP.find(i => i.id === equipped.title)?.value || 'Novice';

  const frameStyle = (): React.CSSProperties => {
    const fv = SHOP.find(i => i.id === equipped.frame)?.value;
    const styles: Record<string, React.CSSProperties> = {
      none: { border: '3px solid rgba(255,255,255,0.1)' },
      bronze: { border: '3px solid #CD7F32', boxShadow: '0 0 12px #CD7F3266' },
      silver: { border: '3px solid #E5E7EB', boxShadow: '0 0 12px #E5E7EB66' },
      emerald: { border: '3px solid #10B981', boxShadow: '0 0 14px #10B98166' },
      ruby: { border: '3px solid #EF4444', boxShadow: '0 0 14px #EF444466' },
      sapphire: { border: '3px solid #3B82F6', boxShadow: '0 0 14px #3B82F666' },
      gold: { border: '3px solid #FBBF24', boxShadow: '0 0 16px #FBBF2477' },
      fire: { border: '3px solid #EF4444', boxShadow: '0 0 18px #EF444477' },
      ice: { border: '3px solid #38BDF8', boxShadow: '0 0 16px #38BDF877' },
      thunder: { border: '3px solid #FACC15', boxShadow: '0 0 18px #FACC1588' },
      diamond: { border: '3px solid #A78BFA', boxShadow: '0 0 20px #A78BFA88' },
      cosmic: { border: '3px solid #EC4899', boxShadow: '0 0 22px #EC489988' },
      holy: { border: '3px solid #FEF3C7', boxShadow: '0 0 24px #FEF3C7AA' },
      rainbow: { border: '3px solid transparent', backgroundImage: 'linear-gradient(#0a0716,#0a0716), linear-gradient(45deg, #F43F5E, #FBBF24, #10B981, #06B6D4, #8B5CF6)', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box' },
    };
    return styles[fv || 'none'];
  };

  return (
    <div className="min-h-screen text-gray-100 flex flex-col md:flex-row font-sans"
      style={{ background: '#08060F', backgroundImage: `radial-gradient(circle at 20% 10%, ${accent}12 0%, transparent 50%), radial-gradient(circle at 80% 90%, ${accent}08 0%, transparent 50%)` }}>

      {/* TOASTS */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 max-w-xs">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, x: 30, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} exit={{ opacity: 0, x: 30 }}
              className="px-4 py-3 rounded-2xl backdrop-blur-xl border flex items-center gap-3 shadow-2xl"
              style={{ background: 'rgba(15,12,28,0.95)', borderColor: `${accent}44`, boxShadow: `0 8px 32px ${accent}22` }}>
              <span className="text-xl">{t.icon}</span>
              <p className="text-xs font-medium text-white leading-tight">{t.message}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* SIDEBAR (Desktop) */}
      <aside className="hidden md:flex flex-col w-60 border-r border-white/5 p-4 justify-between backdrop-blur-xl" style={{ background: 'rgba(11,8,22,0.5)' }}>
        <div className="space-y-6">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center relative"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}66)`, boxShadow: `0 4px 20px ${accent}66` }}>
              {/* Crossed swords logo */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4 4 L14 14 M14 4 L4 14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                <path d="M14 14 L20 20 M4 14 L2 20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <circle cx="4" cy="4" r="1.5" fill="white"/>
                <circle cx="14" cy="4" r="1.5" fill="white"/>
              </svg>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-yellow-400 border-2 border-[#08060F]" />
            </div>
            <div>
              <h1 className="font-black text-sm tracking-wider" style={{ color: accent }}>TASK FORGE</h1>
              <p className="text-[9px] text-gray-500 uppercase tracking-widest">Productivity RPG</p>
            </div>
          </div>
          <nav className="space-y-1">
            {[
              { id: 'dash', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'habits', label: 'Habit Forge', icon: Flame },
              { id: 'todos', label: 'Quest Log', icon: ListTodo },
              { id: 'focus', label: 'Focus Chamber', icon: Timer },
              { id: 'loot', label: 'Loot Locker', icon: ShoppingBag },
            ].map(i => {
              const active = tab === i.id;
              const Ic = i.icon;
              return (
                <button key={i.id} onClick={() => setTab(i.id as any)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'text-white' : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.03]'}`}
                  style={active ? { background: `${accent}20`, color: accent, border: `1px solid ${accent}40` } : {}}>
                  <Ic size={17} />
                  <span>{i.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
        <div className="space-y-3">
          <button onClick={() => setShowTutorialModal(true)} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-xs">
            <BookOpen size={13} /> View Tutorial
          </button>
          <div className="p-3 rounded-2xl border border-white/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-gray-400">Gold</span>
              <span className="font-black text-yellow-400 flex items-center gap-1"><Coins size={13} /> {hero.gold}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Streak</span>
              <span className="font-black text-orange-400 flex items-center gap-1"><Flame size={13} /> {hero.streakDays}d</span>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-4 md:p-8 max-w-6xl mx-auto w-full pb-24 md:pb-8">
        {tab === 'dash' && <DashboardView {...{ hero, setHero, boss, quickAtk, lastAtk, todos, habits, sessions, accent, avatarIcon, titleText, frameStyle, notify, setShowTutorialModal }} />}
        {tab === 'habits' && <HabitsView {...{ habits, addHabit, toggleHabit, deleteHabit, accent }} />}
        {tab === 'todos' && <TodosView {...{ todos, addTask, completeTask, uncompleteTask, deleteTask, accent }} />}
        {tab === 'focus' && <FocusView {...{ sessions, focusFinish, accent }} />}
        {tab === 'loot' && <LootView {...{ hero, inventory, equipped, buyItem, equipItem, accent }} />}
      </main>

      {/* MOBILE BOTTOM NAV */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl border-t border-white/5 flex items-center justify-around py-2 px-1" style={{ background: 'rgba(9,7,20,0.95)' }}>
        {[
          { id: 'dash', label: 'Home', icon: LayoutDashboard },
          { id: 'habits', label: 'Habits', icon: Flame },
          { id: 'todos', label: 'Quests', icon: ListTodo },
          { id: 'focus', label: 'Focus', icon: Timer },
          { id: 'loot', label: 'Loot', icon: ShoppingBag },
        ].map(i => {
          const active = tab === i.id;
          const Ic = i.icon;
          return (
            <button key={i.id} onClick={() => setTab(i.id as any)}
              className={`flex flex-col items-center gap-1 px-3 py-1 text-[10px] transition-all ${active ? 'text-white' : 'text-gray-500'}`}
              style={active ? { color: accent } : {}}>
              <Ic size={18} />
              <span>{i.label}</span>
            </button>
          );
        })}
      </nav>

      {/* INTERACTIVE TUTORIAL */}
      {showTutorialModal && (
        <InteractiveTutorial accent={accent} onFinish={() => { setShowTut(false); setShowTutorialModal(false); }} onNav={setTab} />
      )}
    </div>
  );
}

// ============================================
// INTERACTIVE TUTORIAL
// ============================================
function InteractiveTutorial({ accent, onFinish, onNav }: { accent: string; onFinish: () => void; onNav: (t: any) => void }) {
  const [step, setStep] = useState(0);
  const steps = [
    {
      icon: '⚔️',
      title: 'Welcome to Task Forge!',
      body: 'Your real life becomes an RPG. Complete tasks & habits to earn XP, gold, defeat bosses & unlock legendary loot.',
      action: null,
    },
    {
      icon: '📜',
      title: 'Quest Log',
      body: 'Add your own tasks! Mark them urgent or important. Complete them ONCE to earn XP + Gold. Try it now!',
      action: () => onNav('todos'),
      actionText: 'Open Quest Log →',
    },
    {
      icon: '🔥',
      title: 'Habit Forge',
      body: 'Build daily habits. Each new day earns rewards. Streaks unlock bigger rewards. No cheating — same-day re-checks give no gold.',
      action: () => onNav('habits'),
      actionText: 'Open Habit Forge →',
    },
    {
      icon: '⏱️',
      title: 'Focus Chamber',
      body: 'Deep-work timer with YouTube Ambient Radio (Jazz, Lofi, Ethiopian Worship, Christian Music) + procedural sounds.',
      action: () => onNav('focus'),
      actionText: 'Open Focus Chamber →',
    },
    {
      icon: '👹',
      title: 'Daily Boss',
      body: 'Every day a boss appears on your dashboard. Every quest, habit & focus session damages it. Defeat it for huge rewards!',
      action: () => onNav('dash'),
      actionText: 'View Dashboard →',
    },
    {
      icon: '🛒',
      title: 'Loot Locker',
      body: 'Spend gold on 70+ titles, avatars, frames & themes. From Common to Mythic rarity!',
      action: () => onNav('loot'),
      actionText: 'Open Loot Locker →',
    },
    {
      icon: '🎉',
      title: "You're all set!",
      body: 'Your progress is auto-saved to this browser. Each user has their own private data. Click your name on the dashboard to customize it. Now go forge greatness!',
      action: null,
    },
  ];
  const cur = steps[step];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/85 backdrop-blur p-4">
      <motion.div key={step} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full p-8 rounded-3xl border border-white/10 text-center space-y-5" style={{ background: '#0f0c1d' }}>
        <div className="text-6xl">{cur.icon}</div>
        <h3 className="text-2xl font-black" style={{ color: accent }}>{cur.title}</h3>
        <p className="text-sm text-gray-300 leading-relaxed">{cur.body}</p>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 py-2">
          {steps.map((_, i) => (
            <div key={i} className="rounded-full transition-all"
              style={{
                background: i === step ? accent : 'rgba(255,255,255,0.15)',
                width: i === step ? 24 : 8, height: 8,
              }} />
          ))}
        </div>

        {cur.action && (
          <button onClick={cur.action} className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1"
            style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}40` }}>
            {cur.actionText}
          </button>
        )}

        <div className="flex gap-2 pt-2">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-white/5 text-gray-400 flex items-center justify-center gap-1">
              <ChevronLeft size={14} /> Back
            </button>
          )}
          {step < steps.length - 1 ? (
            <button onClick={() => setStep(s => s + 1)} className="flex-1 py-2.5 rounded-xl text-xs font-black text-black flex items-center justify-center gap-1" style={{ background: accent }}>
              Next <ChevronRight size={14} />
            </button>
          ) : (
            <button onClick={onFinish} className="flex-1 py-2.5 rounded-xl text-xs font-black text-black" style={{ background: accent }}>
              Enter The Forge!
            </button>
          )}
        </div>

        <button onClick={onFinish} className="text-[10px] text-gray-500 hover:text-gray-300">Skip tutorial</button>
      </motion.div>
    </div>
  );
}

// ============================================
// DASHBOARD
// ============================================
function DashboardView({ hero, setHero, boss, quickAtk, lastAtk, todos, habits, sessions, accent, avatarIcon, titleText, frameStyle, setShowTutorialModal }: any) {
  const [editName, setEditName] = useState(false);
  const [nameVal, setNameVal] = useState(hero.name);
  const [cd, setCd] = useState('');

  // ROTATE VERSE EVERY HOUR
  const getHourlyVerseIdx = () => {
    const d = new Date();
    const hourStamp = Math.floor(d.getTime() / (60 * 60 * 1000));
    return hourStamp % VERSES.length;
  };
  const [verseIdx, setVerseIdx] = useState(getHourlyVerseIdx);

  useEffect(() => {
    const iv = setInterval(() => setVerseIdx(getHourlyVerseIdx()), 60000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    const t = setInterval(() => {
      const r = COOLDOWN - (Date.now() - lastAtk);
      if (r <= 0) setCd('');
      else setCd(`${Math.floor(r / 60000)}m ${Math.floor((r % 60000) / 1000)}s`);
    }, 1000);
    return () => clearInterval(t);
  }, [lastAtk]);

  const canAtk = Date.now() - lastAtk >= COOLDOWN;
  const today = todayStr();
  const todayTasks = todos.filter((t: Todo) => t.completedAt === today).length;
  const todayHabits = habits.filter((h: Habit) => h.completedDates.includes(today)).length;
  const todayFocus = sessions.filter((s: FocusSession) => s.date === today).reduce((a: number, b: FocusSession) => a + b.minutes, 0);

  const handlePic = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f || f.size > 2 * 1024 * 1024) return;
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = 200; c.height = 200;
        const ctx = c.getContext('2d')!;
        const s = Math.max(200 / img.width, 200 / img.height);
        ctx.drawImage(img, (200 - img.width * s) / 2, (200 - img.height * s) / 2, img.width * s, img.height * s);
        setHero((h: Hero) => ({ ...h, profilePic: c.toDataURL('image/jpeg', 0.8) }));
      };
      img.src = r.result as string;
    };
    r.readAsDataURL(f);
  };

  const v = VERSES[verseIdx];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-wide" style={{ color: accent }}>COMMAND CENTER</h2>
          <p className="text-xs text-gray-400">Welcome back, {hero.name}!</p>
        </div>
        <button onClick={() => setShowTutorialModal(true)} className="px-3 py-1.5 rounded-xl bg-white/5 text-gray-400 text-xs flex items-center gap-1.5">
          <BookOpen size={13} /> Tutorial
        </button>
      </div>

      {/* HOURLY VERSE — BIGGER FONT */}
      <div className="p-6 md:p-8 rounded-3xl border-2 relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${accent}0A, transparent)`, borderColor: `${accent}30` }}>
        <div className="absolute top-3 right-3 text-[9px] uppercase tracking-widest text-gray-500 flex items-center gap-1">
          <Clock size={10} /> Refreshes hourly
        </div>
        <Quote size={28} style={{ color: accent, opacity: 0.4 }} className="mb-3" />
        <p className="text-lg md:text-2xl text-white italic leading-relaxed font-serif mb-4" style={{ letterSpacing: '0.01em' }}>
          "{v.text}"
        </p>
        <p className="text-sm md:text-base font-black uppercase tracking-wider" style={{ color: accent }}>
          — {v.ref}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* HERO */}
        <div className="p-6 rounded-3xl border border-white/10 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <label className="relative mx-auto w-24 h-24 mb-3 cursor-pointer block">
            <div className="w-24 h-24 rounded-full flex items-center justify-center text-4xl overflow-hidden" style={frameStyle()}>
              {hero.profilePic ? <img src={hero.profilePic} className="w-full h-full object-cover" alt="Hero" /> : avatarIcon}
            </div>
            <input type="file" accept="image/*" className="hidden" onChange={handlePic} />
          </label>

          {editName ? (
            <div className="flex gap-2 mb-2">
              <input value={nameVal} onChange={e => setNameVal(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { setHero((h: Hero) => ({ ...h, name: nameVal.trim() || h.name })); setEditName(false); } }} autoFocus
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-center text-white font-bold focus:outline-none focus:border-white/30" maxLength={24} />
              <button onClick={() => { setHero((h: Hero) => ({ ...h, name: nameVal.trim() || h.name })); setEditName(false); }}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-black" style={{ background: accent }}>
                Save
              </button>
            </div>
          ) : (
            <button onClick={() => { setNameVal(hero.name); setEditName(true); }}
              className="font-black text-lg cursor-pointer hover:opacity-80 flex items-center justify-center gap-1 mx-auto">
              {hero.name} <Edit3 size={12} className="text-gray-500" />
            </button>
          )}
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">{titleText}</p>

          <div className="space-y-1.5 mb-4">
            <div className="flex justify-between text-xs">
              <span className="font-bold" style={{ color: accent }}>Level {hero.level}</span>
              <span className="text-gray-400">{hero.xp} / {xpForLevel(hero.level)} XP</span>
            </div>
            <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full transition-all duration-500 rounded-full" style={{ width: `${(hero.xp / xpForLevel(hero.level)) * 100}%`, background: `linear-gradient(90deg, ${accent}, ${accent}AA)` }} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-xl bg-white/[0.03]">
              <div className="text-yellow-400 font-black flex items-center justify-center gap-1"><Coins size={13} /> {hero.gold}</div>
              <div className="text-[10px] text-gray-500 uppercase">Gold</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.03]">
              <div className="text-orange-400 font-black flex items-center justify-center gap-1"><Flame size={13} /> {hero.streakDays}d</div>
              <div className="text-[10px] text-gray-500 uppercase">Streak</div>
            </div>
          </div>
        </div>

        {/* BOSS */}
        <div className="p-6 rounded-3xl border border-white/10 flex flex-col justify-between" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-black text-red-400 flex items-center gap-1.5 uppercase"><Sword size={13} /> Boss</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Lv {boss.level}</span>
            </div>
            <div className="text-center my-2">
              <motion.div className="text-5xl mb-1" animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2, repeat: Infinity }}>{boss.emoji}</motion.div>
              <h4 className="font-black text-base">{boss.name}</h4>
              <p className="text-[10px] text-gray-400">Defeated: {boss.defeatCount}×</p>
            </div>
            <div className="space-y-1 mb-3">
              <div className="flex justify-between text-xs text-gray-400">
                <span className="flex items-center gap-1 text-red-400"><Heart size={12} /> HP</span>
                <span>{boss.hp} / {boss.maxHp}</span>
              </div>
              <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-red-600 to-rose-400" animate={{ width: `${(boss.hp / boss.maxHp) * 100}%` }} transition={{ duration: 0.4 }} />
              </div>
            </div>
          </div>
          <button onClick={quickAtk} disabled={!canAtk} className="w-full py-2.5 rounded-xl text-xs font-black flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            style={{ background: canAtk ? `${accent}25` : 'rgba(255,255,255,0.03)', color: canAtk ? accent : '#666', border: `1px solid ${canAtk ? accent + '40' : 'transparent'}` }}>
            <Zap size={14} /> {canAtk ? 'Quick Attack' : cd}
          </button>
        </div>

        {/* TODAY */}
        <div className="p-6 rounded-3xl border border-white/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <h4 className="text-xs font-black uppercase text-gray-300 mb-4 flex items-center gap-2"><TrendingUp size={14} style={{ color: accent }} /> Today's Campaign</h4>
          <div className="space-y-2">
            {[
              { icon: Target, label: 'Quests', val: todayTasks },
              { icon: Flame, label: 'Habits', val: `${todayHabits}/${habits.length}` },
              { icon: Clock, label: 'Focus min', val: todayFocus },
              { icon: Sword, label: 'Bosses total', val: hero.totalBosses },
            ].map(s => {
              const Ic = s.icon;
              return (
                <div key={s.label} className="flex justify-between items-center text-xs p-2 rounded-xl bg-white/[0.02]">
                  <span className="text-gray-400 flex items-center gap-2"><Ic size={13} /> {s.label}</span>
                  <span className="font-black text-white">{s.val}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// HABITS
// ============================================
function HabitsView({ habits, addHabit, toggleHabit, deleteHabit, accent }: any) {
  const [show, setShow] = useState(false);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🎯');
  const [color, setColor] = useState('violet');
  const [delId, setDelId] = useState<string | null>(null);

  const colors = ['violet', 'cyan', 'emerald', 'rose', 'amber', 'sky', 'lime', 'fuchsia', 'orange', 'teal'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-wide" style={{ color: accent }}>HABIT FORGE</h2>
          <p className="text-xs text-gray-400">Build unbreakable daily streaks · No same-day cheating</p>
        </div>
        <button onClick={() => setShow(!show)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
          style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}40` }}>
          {show ? <X size={14} /> : <Plus size={14} />} {show ? 'Cancel' : 'New Habit'}
        </button>
      </div>

      <AnimatePresence>
        {show && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <div className="p-5 rounded-2xl border border-white/10 space-y-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div>
                <label className="text-xs text-gray-400 uppercase font-bold block mb-1.5">Habit Name</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Drink 2L Water"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30" maxLength={50} />
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase font-bold block mb-2">Icon ({EMOJIS.length} to choose from)</label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-white/[0.02] rounded-xl border border-white/5">
                  {EMOJIS.map(e => (
                    <button key={e} onClick={() => setEmoji(e)} className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${emoji === e ? 'ring-2' : 'bg-white/[0.03] hover:bg-white/[0.06]'}`}
                      style={emoji === e ? { background: `${accent}20`, boxShadow: `0 0 0 2px ${accent}` } : {}}>{e}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 uppercase font-bold block mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map(c => (
                    <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-white/60 scale-110' : ''}`} style={{ background: themeAccent(c) }} />
                  ))}
                </div>
              </div>
              <button onClick={() => { addHabit(name, emoji, color); setName(''); setEmoji('🎯'); setColor('violet'); setShow(false); }} disabled={!name.trim()}
                className="w-full py-3 rounded-xl text-sm font-black text-black disabled:opacity-40" style={{ background: accent }}>
                Create Habit
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {habits.length === 0 ? (
        <div className="p-12 rounded-2xl border border-white/10 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="text-5xl mb-3">🔥</div>
          <p className="text-gray-400">Forge your first habit above!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {habits.map((h: Habit) => {
            const done = h.completedDates.includes(todayStr());
            const rewardedToday = h.rewardedDates?.includes(todayStr());
            const hAcc = themeAccent(h.color);
            return (
              <motion.div key={h.id} layout className="p-4 rounded-2xl border border-white/10 flex items-center gap-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
                <button onClick={() => toggleHabit(h.id)} className="w-12 h-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-all"
                  style={{ background: done ? `${hAcc}30` : 'rgba(255,255,255,0.03)', border: `2px solid ${done ? hAcc : 'rgba(255,255,255,0.1)'}` }}>
                  {done ? <Check size={20} style={{ color: hAcc }} /> : h.emoji}
                </button>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-bold ${done ? 'line-through text-gray-500' : ''}`}>{h.name}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500">
                    <span className="text-orange-400 flex items-center gap-0.5"><Flame size={10} /> {h.streak}d</span>
                    <span>· Best {h.longestStreak}d</span>
                    {rewardedToday && <span className="px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 text-[9px]">✓ REWARDED</span>}
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 7 }).map((_, i) => {
                    const d = new Date(); d.setDate(d.getDate() - (6 - i));
                    const ds = todayStr(d);
                    return <div key={i} className="w-2 h-6 rounded-sm" style={{ background: h.completedDates.includes(ds) ? hAcc : 'rgba(255,255,255,0.05)' }} title={ds} />;
                  })}
                </div>
                {delId === h.id ? (
                  <div className="flex gap-1">
                    <button onClick={() => { deleteHabit(h.id); setDelId(null); }} className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400">Yes</button>
                    <button onClick={() => setDelId(null)} className="px-2 py-1 rounded text-xs bg-white/5 text-gray-400">No</button>
                  </div>
                ) : (
                  <button onClick={() => setDelId(h.id)} className="text-gray-600 hover:text-red-400 p-1"><Trash2 size={14} /></button>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================
// TODOS
// ============================================
function TodosView({ todos, addTask, completeTask, uncompleteTask, deleteTask, accent }: any) {
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [urgent, setUrgent] = useState(false);
  const [important, setImportant] = useState(false);
  const [delId, setDelId] = useState<string | null>(null);

  const active = todos.filter((t: Todo) => !t.completed);
  const done = todos.filter((t: Todo) => t.completed);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-wide" style={{ color: accent }}>QUEST LOG</h2>
          <p className="text-xs text-gray-400">Add your own quests · Earn XP once per completion</p>
        </div>
        <button onClick={() => setShow(!show)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
          style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}40` }}>
          {show ? <X size={14} /> : <Plus size={14} />} {show ? 'Cancel' : 'New Quest'}
        </button>
      </div>

      <AnimatePresence>
        {show && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <div className="p-5 rounded-2xl border border-white/10 space-y-4" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="What needs to be done?" autoFocus
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30" maxLength={120} />
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-white/30 resize-none h-20" maxLength={300} />
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={urgent} onChange={e => setUrgent(e.target.checked)} className="w-4 h-4 accent-red-500" />
                  <span className="text-xs text-red-400 flex items-center gap-1"><AlertTriangle size={12} /> Urgent</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={important} onChange={e => setImportant(e.target.checked)} className="w-4 h-4 accent-blue-500" />
                  <span className="text-xs text-blue-400 flex items-center gap-1"><Star size={12} /> Important</span>
                </label>
              </div>
              <button onClick={() => { addTask(title, notes, urgent, important); setTitle(''); setNotes(''); setUrgent(false); setImportant(false); setShow(false); }} disabled={!title.trim()}
                className="w-full py-3 rounded-xl text-sm font-black text-black disabled:opacity-40" style={{ background: accent }}>
                Add Quest
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {todos.length === 0 ? (
        <div className="p-12 rounded-2xl border border-white/10 text-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="text-5xl mb-3">📜</div>
          <p className="text-gray-400">Your quest log is empty. Add your first quest!</p>
        </div>
      ) : (
        <>
          <div className="p-5 rounded-2xl border border-white/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h3 className="text-xs font-black uppercase text-gray-400 mb-3">Active ({active.length})</h3>
            {active.length === 0 ? <p className="text-xs text-gray-500 italic">All done! 🎉</p> : (
              <div className="space-y-2">
                {active.map((t: Todo) => (
                  <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-all group">
                    <button onClick={() => completeTask(t.id)} className="w-6 h-6 rounded-lg border-2 border-white/20 hover:border-white/40 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">{t.title}</p>
                      {t.notes && <p className="text-xs text-gray-500 truncate">{t.notes}</p>}
                      <div className="flex gap-2 mt-1">
                        {t.urgent && <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">URGENT</span>}
                        {t.important && <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400">IMPORTANT</span>}
                        {t.rewardClaimed && <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400">CLAIMED</span>}
                      </div>
                    </div>
                    {delId === t.id ? (
                      <div className="flex gap-1">
                        <button onClick={() => { deleteTask(t.id); setDelId(null); }} className="px-2 py-1 rounded text-xs bg-red-500/20 text-red-400">Yes</button>
                        <button onClick={() => setDelId(null)} className="px-2 py-1 rounded text-xs bg-white/5 text-gray-400">No</button>
                      </div>
                    ) : (
                      <button onClick={() => setDelId(t.id)} className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {done.length > 0 && (
            <div className="p-5 rounded-2xl border border-white/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
              <h3 className="text-xs font-black uppercase text-gray-400 mb-3">Completed ({done.length})</h3>
              <div className="space-y-2">
                {done.map((t: Todo) => (
                  <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] opacity-60 group hover:opacity-90">
                    <button onClick={() => uncompleteTask(t.id)} className="w-6 h-6 rounded-lg bg-green-500/30 border-2 border-green-500/50 flex items-center justify-center flex-shrink-0">
                      <Check size={14} className="text-green-400" />
                    </button>
                    <p className="text-sm line-through flex-1">{t.title}</p>
                    <button onClick={() => deleteTask(t.id)} className="text-gray-600 hover:text-red-400"><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============================================
// FOCUS CHAMBER — with auto-fallback YouTube
// ============================================
function FocusView({ sessions, focusFinish, accent }: any) {
  const [preset, setPreset] = useState(1);
  const [total, setTotal] = useState(FOCUS_PRESETS[1].minutes * 60);
  const [rem, setRem] = useState(FOCUS_PRESETS[1].minutes * 60);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const savedRef = useRef(false);

  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [videoIdx, setVideoIdx] = useState(0);
  const [ytCustom, setYtCustom] = useState('');
  const [customList, setCustomList] = useState<{ id: string; name: string; videoId: string; tag: string }[]>([]);
  const [videoError, setVideoError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const [synth, setSynth] = useState<Set<SoundType>>(new Set());

  useEffect(() => {
    let iv: number | null = null;
    if (running && !paused) {
      iv = window.setInterval(() => {
        setRem(prev => {
          if (prev <= 1) {
            if (!savedRef.current) {
              savedRef.current = true;
              focusFinish(FOCUS_PRESETS[preset].minutes, FOCUS_PRESETS[preset].label);
            }
            setRunning(false); setPaused(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (iv) clearInterval(iv); };
  }, [running, paused, preset, focusFinish]);

  useEffect(() => () => { engine.stopAll(); }, []);

  const start = () => {
    if (rem <= 0) { setTotal(FOCUS_PRESETS[preset].minutes * 60); setRem(FOCUS_PRESETS[preset].minutes * 60); }
    savedRef.current = false;
    setRunning(true); setPaused(false);
  };
  const reset = () => { setRunning(false); setPaused(false); setRem(FOCUS_PRESETS[preset].minutes * 60); savedRef.current = false; };

  const toggleSynth = (t: SoundType) => {
    if (synth.has(t)) { engine.stop(t); setSynth(p => { const n = new Set(p); n.delete(t); return n; }); }
    else { engine.start(t, 0.5); setSynth(p => new Set(p).add(t)); }
  };

  const addYt = () => {
    let vid = ytCustom.trim();
    if (vid.includes('v=')) vid = vid.split('v=')[1].split('&')[0];
    else if (vid.includes('youtu.be/')) vid = vid.split('youtu.be/')[1].split('?')[0];
    if (vid.length !== 11) { alert('Invalid YouTube URL/ID'); return; }
    const s = { id: `c-${Date.now()}`, name: 'Custom Track', videoId: vid, tag: 'Custom' };
    setCustomList(p => [...p, s]);
    setYtCustom('');
  };

  // Combine categories with custom
  const allStreams = [
    ...YT_CATEGORIES,
    ...customList.map(c => ({ id: c.id, name: c.name, tag: c.tag, videos: [c.videoId] })),
  ];

  const activeStreamObj = allStreams.find(s => s.id === activeCat);
  const currentVideoId = activeStreamObj?.videos[videoIdx % activeStreamObj.videos.length];

  const tryNextVideo = () => {
    if (activeStreamObj && activeStreamObj.videos.length > 1) {
      setVideoIdx((videoIdx + 1) % activeStreamObj.videos.length);
      setVideoError(false);
    }
  };

  // Handle iframe load error detection - reset error state when stream changes
  useEffect(() => {
    setVideoError(false);
    setVideoIdx(0);
  }, [activeCat]);

  const today = todayStr();
  const circ = 2 * Math.PI * 85;
  const progress = total > 0 ? ((total - rem) / total) : 0;

  const soundOpts: { t: SoundType; icon: string; label: string }[] = [
    { t: 'rain', icon: '🌧️', label: 'Rain' }, { t: 'ocean', icon: '🌊', label: 'Ocean' },
    { t: 'cafe', icon: '☕', label: 'Café' }, { t: 'white', icon: '📻', label: 'White' },
    { t: 'pink', icon: '🩷', label: 'Pink' }, { t: 'brown', icon: '🟤', label: 'Brown' },
    { t: 'binaural', icon: '🧠', label: 'Alpha' },
  ];

  // Group streams by tag
  const grouped: Record<string, typeof allStreams> = {};
  allStreams.forEach(s => {
    if (!grouped[s.tag]) grouped[s.tag] = [];
    grouped[s.tag].push(s);
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl md:text-3xl font-black tracking-wide" style={{ color: accent }}>FOCUS CHAMBER</h2>
        <p className="text-xs text-gray-400">Deep work timer · YouTube Ambient Radio · Procedural sounds</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TIMER */}
        <div className="p-6 rounded-2xl border border-white/10 flex flex-col items-center" style={{ background: 'rgba(255,255,255,0.02)' }}>
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {FOCUS_PRESETS.map((p, i) => (
              <button key={p.label} disabled={running} onClick={() => { setPreset(i); setTotal(p.minutes * 60); setRem(p.minutes * 60); }}
                className="px-3 py-1.5 rounded-xl text-xs font-black transition-all disabled:opacity-50"
                style={preset === i ? { background: `${accent}25`, color: accent, border: `1px solid ${accent}40` } : { background: 'rgba(255,255,255,0.03)', color: '#888' }}>
                {p.label} · {p.minutes}m
              </button>
            ))}
          </div>
          <div className="relative w-56 h-56 flex items-center justify-center mb-8">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
              <circle cx="100" cy="100" r="85" fill="none" stroke={accent} strokeWidth="6" strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={circ * (1 - progress)} style={{ transition: 'stroke-dashoffset 0.5s' }} />
            </svg>
            <div className="absolute text-center">
              <div className="text-4xl font-black tracking-wider text-white">{formatTime(rem)}</div>
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">{FOCUS_PRESETS[preset].label}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {!running ? (
              <button onClick={start} className="px-8 py-3 rounded-xl text-xs font-black text-black flex items-center gap-2" style={{ background: accent, boxShadow: `0 4px 20px ${accent}55` }}>
                <Play size={14} fill="black" /> Engage
              </button>
            ) : (
              <>
                <button onClick={() => setPaused(!paused)} className="px-6 py-2.5 rounded-xl text-xs font-black flex items-center gap-2"
                  style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}40` }}>
                  {paused ? <><Play size={13} /> Resume</> : <><Pause size={13} /> Pause</>}
                </button>
                <button onClick={reset} className="px-4 py-2.5 rounded-xl text-xs font-black bg-white/5 text-gray-400"><Square size={13} /></button>
              </>
            )}
          </div>
        </div>

        {/* AUDIO */}
        <div className="space-y-4">
          {/* YouTube */}
          <div className="p-5 rounded-2xl border border-white/10 space-y-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 className="text-xs font-black uppercase text-red-400 flex items-center gap-2"><Youtube size={14} /> YouTube Ambient Radio</h4>
            <div className="flex gap-2">
              <input value={ytCustom} onChange={e => setYtCustom(e.target.value)} placeholder="Paste YouTube link/ID..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-white/30" />
              <button onClick={addYt} className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs flex items-center gap-1"><Plus size={12} /> Add</button>
            </div>

            {/* Grouped by tag */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {Object.entries(grouped).map(([tag, list]) => (
                <div key={tag}>
                  <div className="text-[10px] uppercase text-gray-500 font-bold mb-1 px-1">{tag}</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {list.map(s => {
                      const active = activeCat === s.id;
                      return (
                        <button key={s.id} onClick={() => setActiveCat(active ? null : s.id)}
                          className="p-2 rounded-xl text-left text-xs border transition-all"
                          style={active ? { background: `${accent}15`, borderColor: `${accent}40`, color: accent } : { background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)', color: '#aaa' }}>
                          <div className="font-bold truncate leading-tight">{s.name}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {activeStreamObj && currentVideoId && (
              <div className="space-y-2">
                <div className="rounded-xl overflow-hidden border border-white/10">
                  <iframe ref={iframeRef} key={`${activeStreamObj.id}-${videoIdx}`} className="w-full aspect-video"
                    src={`https://www.youtube.com/embed/${currentVideoId}?autoplay=1&modestbranding=1`}
                    allow="autoplay; encrypted-media" title="YT"
                    onError={() => setVideoError(true)} />
                </div>
                {activeStreamObj.videos.length > 1 && (
                  <button onClick={tryNextVideo} className="w-full py-2 rounded-xl text-xs font-bold bg-white/5 hover:bg-white/10 flex items-center justify-center gap-2">
                    <RefreshCw size={12} /> Try Next Video (if this one doesn't play)
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Synth */}
          <div className="p-5 rounded-2xl border border-white/10 space-y-3" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 className="text-xs font-black uppercase text-gray-300 flex items-center gap-2"><Volume2 size={14} style={{ color: accent }} /> Procedural Ambience</h4>
            <div className="grid grid-cols-4 gap-2">
              {soundOpts.map(s => {
                const active = synth.has(s.t);
                return (
                  <button key={s.t} onClick={() => toggleSynth(s.t)}
                    className="p-2.5 rounded-xl text-xs flex flex-col items-center gap-1 border transition-all"
                    style={active ? { background: `${accent}25`, borderColor: `${accent}40`, color: accent } : { background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)', color: '#888' }}>
                    <span className="text-lg">{s.icon}</span>
                    <span className="font-bold text-[10px]">{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Today */}
          <div className="p-5 rounded-2xl border border-white/10" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h4 className="text-xs font-black uppercase mb-2 text-gray-300">Today's Sessions</h4>
            {sessions.filter((s: FocusSession) => s.date === today).length === 0 ? (
              <p className="text-xs text-gray-500 italic">No sessions logged yet.</p>
            ) : (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {sessions.filter((s: FocusSession) => s.date === today).map((s: FocusSession) => (
                  <div key={s.id} className="flex justify-between text-xs p-2 rounded-lg bg-white/[0.02]">
                    <span>{s.label}</span>
                    <span className="text-gray-400">{s.minutes}m</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// LOOT LOCKER (Categorized)
// ============================================
function LootView({ hero, inventory, equipped, buyItem, equipItem, accent }: any) {
  const [cat, setCat] = useState<ShopType>('title');
  const items = SHOP.filter(i => i.type === cat);

  const tabs: { key: ShopType; label: string; icon: any }[] = [
    { key: 'title', label: 'Titles', icon: BookOpen },
    { key: 'avatar', label: 'Avatars', icon: User },
    { key: 'frame', label: 'Frames', icon: Target },
    { key: 'theme', label: 'Themes', icon: Music },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-wide" style={{ color: accent }}>LOOT LOCKER</h2>
          <p className="text-xs text-gray-400">Unlock 70+ legendary titles, avatars, frames & themes</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-sm font-black">
          <Coins size={14} /> {hero.gold} Gold
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map(t => {
          const Ic = t.icon;
          const active = cat === t.key;
          const count = SHOP.filter(i => i.type === t.key).length;
          const owned = SHOP.filter(i => i.type === t.key && inventory.includes(i.id)).length;
          return (
            <button key={t.key} onClick={() => setCat(t.key)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all"
              style={active ? { background: `${accent}25`, color: accent, border: `1px solid ${accent}40` } : { background: 'rgba(255,255,255,0.03)', color: '#888' }}>
              <Ic size={14} /> {t.label} <span className="text-[10px] opacity-60">({owned}/{count})</span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {items.map(item => {
            const owned = inventory.includes(item.id);
            const isEq = equipped[item.type] === item.id;
            const rc = rarityColor(item.rarity);
            const canAfford = hero.gold >= item.cost;
            return (
              <motion.div key={item.id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-2xl border relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', borderColor: isEq ? `${accent}55` : 'rgba(255,255,255,0.1)' }}>
                <div className="absolute top-2 right-2 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded" style={{ background: `${rc}20`, color: rc }}>
                  {item.rarity}
                </div>
                <div className="flex items-start gap-3 mb-4 mt-1">
                  <div className="text-3xl">{item.icon}</div>
                  <div className="flex-1">
                    <h4 className="text-sm font-black">{item.name}</h4>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                  </div>
                </div>
                {isEq ? (
                  <div className="py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-black text-center flex items-center justify-center gap-1.5">
                    <Check size={14} /> Equipped
                  </div>
                ) : owned ? (
                  <button onClick={() => equipItem(item)} className="w-full py-2 rounded-xl text-xs font-black transition-all hover:opacity-90"
                    style={{ background: `${accent}25`, color: accent, border: `1px solid ${accent}40` }}>
                    Equip
                  </button>
                ) : (
                  <button onClick={() => buyItem(item)} disabled={!canAfford} className="w-full py-2 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    style={{ background: canAfford ? accent : 'rgba(255,255,255,0.03)', color: canAfford ? '#000' : '#666' }}>
                    {canAfford ? <><Coins size={12} /> Buy · {item.cost}</> : <><Lock size={12} /> {item.cost} Gold</>}
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
