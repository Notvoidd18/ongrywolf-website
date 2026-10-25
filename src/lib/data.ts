import { ProductItem, PortfolioItem } from './types';

export const PRODUCTS: ProductItem[] = [
  {
    id: 'plugins',
    title: 'Minecraft Plugins & Custom Mobs',
    category: 'plugins',
    tagline: 'High-performance Spigot/Paper plugins, combat systems, and custom entity mechanics.',
    description:
      'Engineered for maximum server TPS and engaging gameplay. Custom AI behavior trees, bespoke particle mechanics, balanced boss encounters, and low-latency packet handling.',
    status: 'Production',
    features: [
      'Asynchronous database persistence (PostgreSQL / SQLite)',
      'Custom mob behavioral AI & phase transitions',
      'Configurable sound, particle, and damage mitigation models',
      'Zero-lag tick optimization for high-concurrency servers',
      'Complete YAML / MiniMessage customization',
    ],
    compatibility: 'Paper / Purpur / Spigot 1.20.x – 1.21.x',
    href: '/products/plugins',
  },
  {
    id: 'discord-bots',
    title: 'Discord Bots & Multi-Bot Platform',
    category: 'discord-bots',
    tagline: 'Modular, fault-tolerant Discord automation built with TypeScript & discord.js v14.',
    description:
      'Specialized management, staff work logging, and server moderation. Built on our isolated multi-bot runtime architecture with zero cross-instance interference.',
    status: 'Active',
    features: [
      'Independent bot lifecycle isolation (one crash never impacts another)',
      'Multi-guild staff work logging with persistent audit trails',
      'Slash command + legacy prefix dual-dispatch',
      'Graceful gateway intent fallback for unverified bots',
      'Full self-hosting export (.env, Docker compose, Cloud blueprint)',
    ],
    compatibility: 'Discord API v10, Node.js 18 – 24, PostgreSQL',
    href: '/products/discord-bots',
  },
  {
    id: 'client',
    title: 'Ongrywolf Custom Minecraft Client',
    category: 'client',
    tagline: 'Streamlined performance client engineered for competitive PvP and exploration.',
    description:
      'A stripped-down, high-framerate client module focusing on smooth input handling, minimal memory overhead, customizable HUD elements, and seamless mod integration.',
    status: 'Private Beta',
    features: [
      'Sub-millisecond frame rendering and garbage collection tweaks',
      'Modular drag-and-drop HUD (Armor status, CPS, Keystrokes, Coordinates)',
      'Clean technical aesthetic with customizable blue-accent themes',
      'Fabric / Quilt compatibility layer',
      'Integrated server pinger and network diagnostics',
    ],
    compatibility: 'Minecraft 1.20.4 – 1.21.x (Fabric)',
    href: '/products/client',
  },
  {
    id: 'builds',
    title: 'High-Quality Minecraft Builds',
    category: 'builds',
    tagline: 'Bespoke hub spawns, minigame arenas, RPG dungeons, and custom terrain.',
    description:
      'Architected by seasoned builders with deep understanding of player pathing, sightlines, lighting balance, and visual grandeur. Ready for instant schematic deployment.',
    status: 'Commission Only',
    features: [
      'Scale-optimized server lobbies & player hub zones',
      'Dynamic PvP & Minigame arena design with balanced sightlines',
      'Custom WorldEngine & WorldPainter procedural biomes',
      'Full schematic (.schem / WorldEdit) delivery with documentation',
      'Rendered lighting passes and barrier-block safety checks',
    ],
    compatibility: 'WorldEdit / FastAsyncWorldEdit / Litematica formats',
    href: '/products/builds',
  },
];

export const PORTFOLIO: PortfolioItem[] = [
  {
    id: 'ongrywolf-multi-bot',
    title: 'Ongrywolf Multi-Bot Platform Engine',
    category: 'Discord Bot Systems',
    summary:
      'Engineered an enterprise-grade multi-bot runtime concurrently executing Main and Private instances on an isolated high-availability cloud container with PostgreSQL logging.',
    clientOrContext: 'Ongrywolf Core Systems',
    tags: ['discord.js v14', 'TypeScript', 'PostgreSQL', 'Cloud Core Engine', 'Multi-tenant'],
    highlights: [
      'Sub-50ms command execution latency',
      'Isolated memory spaces per bot instance',
      'Persistent staff work log repository with guild channel routing',
    ],
  },
  {
    id: 'boss-mechanics-mob-suite',
    title: 'Spectral Overlord Custom Mob System',
    category: 'Minecraft Mechanics',
    summary:
      'Custom 3-phase raid boss with dynamic arena hazards, directional telegraphs, and custom loot distribution algorithms for competitive SMP networks.',
    clientOrContext: 'Custom Commission Showcase',
    tags: ['Paper API', 'MythicMob Integration', 'Raytracing Hits', 'MiniMessage', 'Java 21'],
    highlights: [
      'Custom velocity-calculated projectile arcs',
      'Dynamic aggro table based on party DPS and healing output',
      'Zero server tick lag during 20+ simultaneous player combat encounters',
    ],
  },
  {
    id: 'obsidian-citadel-spawn',
    title: 'The Obsidian Spire Hub & Spawn Arena',
    category: 'World Architecture',
    summary:
      'A monolithic 500x500 fantasy citadel featuring dark gothic architecture, floating celestial rings, and intuitive radial portals for minigame selection.',
    clientOrContext: 'Network Hub Commission',
    tags: ['FastAsyncWorldEdit', 'Dark Fantasy', 'Radial Pathing', 'Optimized Entities'],
    highlights: [
      'Seamless player distribution avoiding bottleneck choke points',
      'Pre-calculated chunk lighting ensuring zero lighting update lag',
      'Integrated NPC shop alcoves and leaderboards',
    ],
  },
  {
    id: 'fps-optimized-hud-client',
    title: 'Ongrywolf Performance Client Module',
    category: 'Client Architecture',
    summary:
      'Custom rendering pipeline enhancements delivering an average +35% FPS improvement on mid-tier hardware with an integrated blue-accent minimalist HUD.',
    clientOrContext: 'Internal Beta',
    tags: ['Fabric Loader', 'LWJGL', 'Custom HUD', 'Memory Optimization'],
    highlights: [
      'Real-time memory footprint under 1.2GB allocated heap',
      'Fully customizable toggle-sprint, keystroke, and armor telemetry overlays',
    ],
  },
];
