/**
 * App Registry - Source of Truth
 * All app data for Lab and Shadow sections
 */

export interface LabApp {
  id: string;
  name: string;
  desc: string;
  techTags: string[];
  color: string;
  url: string;
  accessLevel: 'guest' | 'user' | 'admin';
  badge?: string;
  image: string;
}

export interface ShadowNode {
  id: string;
  name: string;
  icon: string;
  desc: string;
  url: string;
  role: 'user' | 'admin';
  warning?: string;
}

export const LAB_APPS: LabApp[] = [
  {
    id: 'marifah',
    name: 'Marifah',
    desc: 'Thai Restaurant · Meyrin, Geneva · Bilingual FR/EN',
    techTags: ['React', 'Tailwind', 'Supabase'],
    color: '#4ADE80',
    url: 'https://marifah.naskaus.com',
    accessLevel: 'guest',
    image: '/images/marifah.jpg',
  },
  {
    id: 'meetbeyond',
    name: 'Meet Beyond',
    desc: 'Travel Voucher App · Thailand DMC Partners · Works Offline',
    techTags: ['PWA', 'Vanilla JS', 'Offline-first', 'QR Vouchers'],
    color: '#FF6B6B',
    url: 'https://meetbeyond.naskaus.com',
    accessLevel: 'guest',
    image: '/images/meetbeyond.jpg',
  },
  {
    id: 'aperipommes',
    name: 'Aperi Pommes',
    desc: 'Swiss Made · 100% Fruit · Artisan Craft · Multilingual FR/DE/EN',
    techTags: ['Vue.js', 'i18n', 'Admin CMS', 'SEO'],
    color: '#8B5E3C',
    url: 'https://aperipommes.naskaus.com',
    accessLevel: 'guest',
    image: '/images/aperipommes.jpg',
  },
  {
    id: 'pantiesfan',
    name: 'PantiesFan',
    desc: 'Niche Auction Platform · Adults Only · Real-Time Bidding',
    techTags: ['HTML', 'CSS', 'JS', 'Custom Auction Engine'],
    color: '#DC143C',
    url: 'https://pantiesfan.com',
    accessLevel: 'guest',
    badge: '18+',
    image: '/images/pantiesfan.jpg',
  },
];

export const SHADOW_NODES: ShadowNode[] = [
  {
    id: 'agency',
    name: 'Agency Performance',
    icon: '📊',
    desc: 'Staff records. Bonus payroll calculator.',
    url: 'https://agency.naskaus.com',
    role: 'user',
  },
  {
    id: 'tasks',
    name: 'CEO/COO Tasks',
    icon: '📋',
    desc: 'Executive task & schedule management.',
    url: 'https://tasks.naskaus.com',
    role: 'user',
  },
  {
    id: 'party',
    name: 'Party Planner',
    icon: '🎉',
    desc: 'Team event planning & coordination.',
    url: 'https://tasks.naskaus.com/party',
    role: 'user',
  },
  {
    id: 'purchase',
    name: 'Purchase Manager',
    icon: '🛒',
    desc: 'Procurement tracking & expense validation.',
    url: 'https://naskaus.pythonanywhere.com/login',
    role: 'admin',
  },
  {
    id: 'workflows',
    name: 'AI Workflows',
    icon: '⚡',
    desc: 'n8n automation pipelines.',
    url: 'https://digital-shadow.tailf44989.ts.net/home/workflows',
    role: 'admin',
    warning: 'Internal network only — requires Tailscale VPN',
  },
  {
    id: 'moltbot',
    name: 'Moltbot Agent',
    icon: '🤖',
    desc: 'Personal AI. Slack · Telegram · Google. Runs 24/7.',
    url: 'http://127.0.0.1:18789/chat',
    role: 'admin',
    warning: 'Server local — admin terminal only',
  },
];

// AI Tools data for Phase 4
export interface AITool {
  id: string;
  name: string;
  maker: string;
  desc: string;
  url: string;
}

export const AI_TOOLS: AITool[] = [
  {
    id: 'claude',
    name: 'Claude / Anthropic Console',
    maker: 'Anthropic',
    desc: 'The AI backbone of all Naskaus apps',
    url: 'https://console.anthropic.com',
  },
  {
    id: 'claude-code',
    name: 'Claude Code',
    maker: 'Anthropic',
    desc: 'Agentic AI coding in the terminal',
    url: 'https://claude.ai/code',
  },
  {
    id: 'antigravity',
    name: 'Google Antigravity',
    maker: 'Google',
    desc: 'Next-gen development IDE',
    url: 'https://antigravity.google',
  },
  {
    id: 'ai-studio',
    name: 'Google AI Studio',
    maker: 'Google',
    desc: 'Rapid prototyping with Gemini',
    url: 'https://aistudio.google.com',
  },
  {
    id: 'stitch',
    name: 'Google Stitch',
    maker: 'Google',
    desc: 'AI-powered design-to-code',
    url: 'https://stitch.withgoogle.com',
  },
  {
    id: 'gemini',
    name: 'Gemini',
    maker: 'Google',
    desc: 'Multimodal AI assistant',
    url: 'https://gemini.google.com',
  },
  {
    id: 'flow',
    name: 'Google Flow (Veo 3.1)',
    maker: 'Google Labs',
    desc: 'AI video and image generation',
    url: 'https://labs.google/flow',
  },
];
