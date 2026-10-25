export type Role = 'OWNER' | 'ADMIN' | 'SUPPORT' | 'USER';

export interface UserSession {
  id: string;
  discordId: string;
  username: string;
  avatarUrl?: string;
  role: Role;
  status: 'active' | 'suspended';
  createdAt: string;
}

export interface UserTrial {
  id: string;
  userId: string;
  startsAt: string;
  expiresAt: string;
  status: 'active' | 'expired' | 'revoked';
  extensionsCount: number;
}

export interface BotConfigPayload {
  applicationId: string;
  botName: string;
  commandPrefix: string;
  statusText: string;
  statusType: 'Custom' | 'Playing' | 'Watching' | 'Listening';
  logChannelId?: string;
  authorizedRoleIds?: string[];
  features: {
    workLogging: boolean;
    channelRouting: boolean;
    presenceSync: boolean;
    exportEnabled: boolean;
  };
}

export interface UserBotProfile {
  id: string;
  userId: string;
  applicationId: string;
  botName: string;
  config: BotConfigPayload;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type FeatureKey =
  | 'basic_bot_config'
  | 'advanced_bot_config'
  | 'premium_modules'
  | 'export_config'
  | 'extra_bot_slots';

export interface FeatureEntitlement {
  id: string;
  userId: string;
  featureKey: FeatureKey;
  grantedBy: string;
  grantedAt: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  adminUsername: string;
  action: string;
  targetType: 'USER' | 'TRIAL' | 'PERMISSION' | 'BOT_CONFIG' | 'SYSTEM';
  targetId: string;
  details?: Record<string, any>;
  createdAt: string;
}

export interface ProjectRequest {
  id: string;
  contactName: string;
  contactMethod: string;
  category: 'plugins' | 'discord-bots' | 'client' | 'builds' | 'full-stack';
  description: string;
  status: 'pending' | 'reviewed' | 'contacted' | 'completed' | 'archived';
  createdAt: string;
}

export interface ProductItem {
  id: string;
  title: string;
  category: 'plugins' | 'discord-bots' | 'client' | 'builds';
  tagline: string;
  description: string;
  status: 'Production' | 'Private Beta' | 'Commission Only' | 'Active';
  features: string[];
  compatibility?: string;
  href: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  summary: string;
  clientOrContext: string;
  tags: string[];
  highlights: string[];
}

export interface HostedBot {
  id: string;
  name: string;
  clientId: string; // Discord Application ID
  botId?: string; // Discord User Snowflake ID
  username?: string; // e.g. "Ongrywolf#1234"
  token?: string; // Stored exclusively on Render 1; never exposed to browser
  avatarUrl?: string;
  ownerAccount?: string;
  statusText: string;
  statusType?: string; // 'Custom' | 'Playing' | 'Watching' | 'Listening' | 'Streaming' | 'Competing'
  onlineMode?: 'online' | 'idle' | 'dnd' | 'invisible';
  streamingUrl?: string;
  hostingEnv: 'Dedicated (Render)' | 'Ongrywolf PRV' | 'Self-Hosted VPS';
  prefix: string;
  assignedCommands: string[];
  enabledModules?: string[];
  version?: string;
  gatewayStatus?: 'connected' | 'connecting' | 'disconnected';
  description?: string;
  codeArchiveName?: string;
  codeArchiveSize?: number;
  desiredEnabled: boolean;
  observedState: 'online' | 'offline' | 'starting' | 'stopping' | 'restarting' | 'error';
  pingMs?: number;
  guildCount?: number;
  uptimeSeconds?: number;
  totalMessagesProcessed: number;
  totalCommandsExecuted: number;
  trialStatus?: 'active' | 'expired' | 'exempt' | 'revoked';
  trialExpiresAt?: string;
  resourceUsage?: {
    memoryMb: number;
  };
  lastStartedAt: string;
  lastCheckedAt: string;
  lastError?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkLog {
  id: string;
  guildId: string;
  channelId: string;
  userId: string;
  username: string;
  description: string;
  createdAt: string;
}
