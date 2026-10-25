import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { botHostClient, SanitizedLogEntry } from './botHostClient';
import {
  UserSession,
  UserTrial,
  UserBotProfile,
  BotConfigPayload,
  FeatureEntitlement,
  AdminAuditLog,
  ProjectRequest,
  FeatureKey,
  Role,
  HostedBot,
  WorkLog,
} from './types';

// PostgreSQL connection pool (server-side only)
let pool: Pool | null = null;
const dbUrl = process.env.DATABASE_URL;

if (dbUrl) {
  try {
    pool = new Pool({
      connectionString: dbUrl,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    });
  } catch (err) {
    console.error('PostgreSQL connection error:', err);
  }
}

// Server boot time tracker for genuine 100% real uptime calculations
const SERVER_BOOT_TIME = Date.now();

// In-Memory store with local disk persistence for zero-crash resilience
class InMemStore {
  public users: Map<string, UserSession> = new Map();
  public trials: Map<string, UserTrial> = new Map();
  public botConfigs: Map<string, UserBotProfile> = new Map();
  public entitlements: FeatureEntitlement[] = [];
  public auditLogs: AdminAuditLog[] = [];
  public projectRequests: ProjectRequest[] = [];
  public hostedBots: Map<string, HostedBot> = new Map();
  public workLogs: WorkLog[] = [];
}

const mem = new InMemStore();

// Disk persistence file path
const DATA_DIR = path.resolve(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

function saveToDisk() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const serialized = {
      users: Array.from(mem.users.entries()),
      trials: Array.from(mem.trials.entries()),
      botConfigs: Array.from(mem.botConfigs.entries()),
      entitlements: mem.entitlements,
      auditLogs: mem.auditLogs,
      projectRequests: mem.projectRequests,
      hostedBots: Array.from(mem.hostedBots.entries()),
      workLogs: mem.workLogs,
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(serialized, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save store to disk:', err);
  }
}

function loadFromDisk() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(content);
      if (Array.isArray(data.users)) mem.users = new Map(data.users);
      if (Array.isArray(data.trials)) mem.trials = new Map(data.trials);
      if (Array.isArray(data.botConfigs)) mem.botConfigs = new Map(data.botConfigs);
      if (Array.isArray(data.entitlements)) mem.entitlements = data.entitlements;
      if (Array.isArray(data.auditLogs)) mem.auditLogs = data.auditLogs;
      if (Array.isArray(data.projectRequests)) mem.projectRequests = data.projectRequests;
      if (Array.isArray(data.hostedBots)) mem.hostedBots = new Map(data.hostedBots);
      if (Array.isArray(data.workLogs)) mem.workLogs = data.workLogs;
    }
  } catch (err) {
    console.error('Failed to load store from disk:', err);
  }
}

// Initial load from disk
loadFromDisk();

// Schema initialization flag
let schemaInitialized = false;

async function ensureSchema() {
  if (!pool || schemaInitialized) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS web_users (
        id VARCHAR(64) PRIMARY KEY,
        discord_id VARCHAR(32) UNIQUE NOT NULL,
        username VARCHAR(100) NOT NULL,
        avatar_url TEXT,
        role VARCHAR(20) NOT NULL DEFAULT 'USER',
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS web_trials (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES web_users(id) ON DELETE CASCADE,
        starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'active',
        extensions_count INT NOT NULL DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS web_bot_configs (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES web_users(id) ON DELETE CASCADE,
        application_id VARCHAR(32) NOT NULL,
        bot_name VARCHAR(100) NOT NULL,
        config_json JSONB NOT NULL DEFAULT '{}',
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS web_feature_entitlements (
        id BIGSERIAL PRIMARY KEY,
        user_id VARCHAR(64) REFERENCES web_users(id) ON DELETE CASCADE,
        feature_key VARCHAR(50) NOT NULL,
        granted_by VARCHAR(64),
        granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        CONSTRAINT uq_web_feature UNIQUE(user_id, feature_key)
      );

      CREATE TABLE IF NOT EXISTS web_audit_logs (
        id BIGSERIAL PRIMARY KEY,
        admin_id VARCHAR(64) NOT NULL,
        admin_username VARCHAR(100) NOT NULL,
        action VARCHAR(100) NOT NULL,
        target_type VARCHAR(50) NOT NULL,
        target_id VARCHAR(100) NOT NULL,
        details JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS web_project_requests (
        id BIGSERIAL PRIMARY KEY,
        contact_name VARCHAR(100) NOT NULL,
        contact_method VARCHAR(100) NOT NULL,
        category VARCHAR(50) NOT NULL,
        description TEXT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS hosted_bots (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        client_id VARCHAR(32) NOT NULL,
        token TEXT,
        avatar_url TEXT,
        status_text VARCHAR(255) NOT NULL DEFAULT 'Hosting on Ongrywolf',
        hosting_env VARCHAR(50) NOT NULL DEFAULT 'Dedicated (Render)',
        prefix VARCHAR(10) NOT NULL DEFAULT '!',
        assigned_commands TEXT[] NOT NULL DEFAULT '{"log","listlog","channellog"}',
        description TEXT,
        code_archive_name VARCHAR(255),
        code_archive_size INT,
        desired_enabled BOOLEAN NOT NULL DEFAULT true,
        observed_state VARCHAR(20) NOT NULL DEFAULT 'offline',
        ping_ms INT,
        guild_count INT DEFAULT 0,
        total_messages_processed BIGINT DEFAULT 0,
        total_commands_executed BIGINT DEFAULT 0,
        last_started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_error TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );

      CREATE TABLE IF NOT EXISTS work_logs (
        id BIGSERIAL PRIMARY KEY,
        guild_id VARCHAR(32) NOT NULL,
        channel_id VARCHAR(32) NOT NULL,
        user_id VARCHAR(32) NOT NULL,
        username VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);
    schemaInitialized = true;
  } catch (err) {
    console.error('Schema initialization notice (using memory fallback):', err);
  }
}

export const db = {
  // --- USERS ---
  async upsertDiscordUser(data: {
    id: string;
    discordId: string;
    username: string;
    avatarUrl?: string;
    role: Role;
    status: 'active' | 'suspended';
  }): Promise<UserSession> {
    await ensureSchema();
    const now = new Date().toISOString();

    if (pool && schemaInitialized) {
      try {
        const query = `
          INSERT INTO web_users (id, discord_id, username, avatar_url, role, status, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, NOW())
          ON CONFLICT (discord_id) DO UPDATE SET
            username = EXCLUDED.username,
            avatar_url = EXCLUDED.avatar_url,
            role = EXCLUDED.role,
            updated_at = NOW()
          RETURNING id, discord_id, username, avatar_url, role, status, created_at;
        `;
        const res = await pool.query(query, [
          data.id,
          data.discordId,
          data.username,
          data.avatarUrl || null,
          data.role,
          data.status,
        ]);
        const row = res.rows[0];
        const user: UserSession = {
          id: row.id,
          discordId: row.discord_id,
          username: row.username,
          avatarUrl: row.avatar_url,
          role: row.role as Role,
          status: row.status as 'active' | 'suspended',
          createdAt: row.created_at.toISOString(),
        };
        mem.users.set(user.id, user);
        return user;
      } catch (e) {
        console.error('Database user upsert failed, using memory:', e);
      }
    }

    // Memory fallback
    const existing = mem.users.get(data.id);
    const user: UserSession = {
      id: data.id,
      discordId: data.discordId,
      username: data.username,
      avatarUrl: data.avatarUrl,
      role: data.role,
      status: existing ? existing.status : data.status,
      createdAt: existing ? existing.createdAt : now,
    };
    mem.users.set(user.id, user);

    // Auto grant 7-day trial for new user if no trial exists
    if (!mem.trials.has(user.id)) {
      mem.trials.set(user.id, {
        id: `trial_${user.id}`,
        userId: user.id,
        startsAt: now,
        expiresAt: new Date(Date.now() + 7 * 86400000).toISOString(),
        status: 'active',
        extensionsCount: 0,
      });
    }

    saveToDisk();
    return user;
  },

  async getUsers(): Promise<UserSession[]> {
    await ensureSchema();
    if (pool && schemaInitialized) {
      try {
        const res = await pool.query('SELECT * FROM web_users ORDER BY created_at DESC');
        return res.rows.map((row) => ({
          id: row.id,
          discordId: row.discord_id,
          username: row.username,
          avatarUrl: row.avatar_url,
          role: row.role as Role,
          status: row.status as 'active' | 'suspended',
          createdAt: row.created_at.toISOString(),
        }));
      } catch (e) {
        console.error('Database getUsers failed:', e);
      }
    }
    return Array.from(mem.users.values());
  },

  async getUserById(id: string): Promise<UserSession | null> {
    await ensureSchema();
    if (pool && schemaInitialized) {
      try {
        const res = await pool.query('SELECT * FROM web_users WHERE id = $1', [id]);
        if (res.rows.length > 0) {
          const row = res.rows[0];
          return {
            id: row.id,
            discordId: row.discord_id,
            username: row.username,
            avatarUrl: row.avatar_url,
            role: row.role as Role,
            status: row.status as 'active' | 'suspended',
            createdAt: row.created_at.toISOString(),
          };
        }
      } catch (e) {
        console.error('Database getUserById failed:', e);
      }
    }
    return mem.users.get(id) || null;
  },

  async toggleUserSuspension(id: string, adminUsername: string): Promise<boolean> {
    const user = await this.getUserById(id);
    if (!user) return false;
    const newStatus = user.status === 'active' ? 'suspended' : 'active';

    if (pool && schemaInitialized) {
      try {
        await pool.query('UPDATE web_users SET status = $1, updated_at = NOW() WHERE id = $2', [
          newStatus,
          id,
        ]);
      } catch (e) {
        console.error('Database update status failed:', e);
      }
    }

    const memUser = mem.users.get(id);
    if (memUser) {
      memUser.status = newStatus;
    }

    await this.logAudit({
      adminId: 'admin',
      adminUsername,
      action: `USER_${newStatus.toUpperCase()}`,
      targetType: 'USER',
      targetId: id,
      details: { newStatus },
    });

    return true;
  },

  // --- TRIALS ---
  async getTrials(): Promise<UserTrial[]> {
    await ensureSchema();
    if (pool && schemaInitialized) {
      try {
        const res = await pool.query('SELECT * FROM web_trials');
        return res.rows.map((r) => ({
          id: String(r.id),
          userId: r.user_id,
          startsAt: r.starts_at.toISOString(),
          expiresAt: r.expires_at.toISOString(),
          status: r.status,
          extensionsCount: r.extensions_count,
        }));
      } catch (e) {
        console.error('Database getTrials failed:', e);
      }
    }
    return Array.from(mem.trials.values());
  },

  async getTrialByUserId(userId: string): Promise<UserTrial | null> {
    const trials = await this.getTrials();
    return trials.find((t) => t.userId === userId) || mem.trials.get(userId) || null;
  },

  async extendTrial(userId: string, adminUsername: string): Promise<boolean> {
    const trial = await this.getTrialByUserId(userId);
    const currentExpiry = trial ? new Date(trial.expiresAt).getTime() : Date.now();
    const newExpiry = new Date(Math.max(Date.now(), currentExpiry) + 7 * 86400000).toISOString();
    const extensionsCount = (trial?.extensionsCount || 0) + 1;

    if (pool && schemaInitialized) {
      try {
        await pool.query(
          `INSERT INTO web_trials (user_id, starts_at, expires_at, status, extensions_count, updated_at)
           VALUES ($1, NOW(), $2, 'active', $3, NOW())
           ON CONFLICT (user_id) DO UPDATE SET
             expires_at = $2, status = 'active', extensions_count = $3, updated_at = NOW()`,
          [userId, newExpiry, extensionsCount]
        );
      } catch (e) {
        console.error('Database extendTrial failed:', e);
      }
    }

    mem.trials.set(userId, {
      id: `trial_${userId}`,
      userId,
      startsAt: trial?.startsAt || new Date().toISOString(),
      expiresAt: newExpiry,
      status: 'active',
      extensionsCount,
    });

    await this.logAudit({
      adminId: 'admin',
      adminUsername,
      action: 'TRIAL_EXTENDED',
      targetType: 'TRIAL',
      targetId: userId,
      details: { newExpiry, extensionsCount },
    });

    return true;
  },

  async revokeTrial(userId: string, adminUsername: string): Promise<boolean> {
    const now = new Date().toISOString();

    if (pool && schemaInitialized) {
      try {
        await pool.query(
          "UPDATE web_trials SET status = 'revoked', expires_at = NOW(), updated_at = NOW() WHERE user_id = $1",
          [userId]
        );
      } catch (e) {
        console.error('Database revokeTrial failed:', e);
      }
    }

    const t = mem.trials.get(userId);
    if (t) {
      t.status = 'revoked';
      t.expiresAt = now;
    }

    await this.logAudit({
      adminId: 'admin',
      adminUsername,
      action: 'TRIAL_REVOKED',
      targetType: 'TRIAL',
      targetId: userId,
      details: { revokedAt: now },
    });

    return true;
  },

  // --- BOT CONFIGS ---
  async getBotConfigs(): Promise<UserBotProfile[]> {
    await ensureSchema();
    if (pool && schemaInitialized) {
      try {
        const res = await pool.query('SELECT * FROM web_bot_configs WHERE is_active = true ORDER BY created_at DESC');
        return res.rows.map((r) => ({
          id: String(r.id),
          userId: r.user_id,
          applicationId: r.application_id,
          botName: r.bot_name,
          config: r.config_json,
          isActive: r.is_active,
          createdAt: r.created_at.toISOString(),
          updatedAt: r.updated_at.toISOString(),
        }));
      } catch (e) {
        console.error('Database getBotConfigs failed:', e);
      }
    }
    return Array.from(mem.botConfigs.values());
  },

  async getBotConfigsByUserId(userId: string): Promise<UserBotProfile[]> {
    const all = await this.getBotConfigs();
    return all.filter((b) => b.userId === userId);
  },

  async saveBotConfig(userId: string, config: BotConfigPayload): Promise<UserBotProfile> {
    await ensureSchema();
    const now = new Date().toISOString();

    if (pool && schemaInitialized) {
      try {
        const res = await pool.query(
          `INSERT INTO web_bot_configs (user_id, application_id, bot_name, config_json, is_active, created_at, updated_at)
           VALUES ($1, $2, $3, $4, true, NOW(), NOW())
           RETURNING id, created_at, updated_at;`,
          [userId, config.applicationId, config.botName, JSON.stringify(config)]
        );
        const row = res.rows[0];
        const profile: UserBotProfile = {
          id: String(row.id),
          userId,
          applicationId: config.applicationId,
          botName: config.botName,
          config,
          isActive: true,
          createdAt: row.created_at.toISOString(),
          updatedAt: row.updated_at.toISOString(),
        };
        mem.botConfigs.set(profile.id, profile);
        return profile;
      } catch (e) {
        console.error('Database saveBotConfig failed:', e);
      }
    }

    const profile: UserBotProfile = {
      id: `bot_${Date.now()}`,
      userId,
      applicationId: config.applicationId,
      botName: config.botName,
      config,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    mem.botConfigs.set(profile.id, profile);
    return profile;
  },

  async deleteBotConfig(id: string, adminUsername: string): Promise<boolean> {
    if (pool && schemaInitialized) {
      try {
        await pool.query('DELETE FROM web_bot_configs WHERE id = $1', [id]);
      } catch (e) {
        console.error('Database deleteBotConfig failed:', e);
      }
    }
    mem.botConfigs.delete(id);

    await this.logAudit({
      adminId: 'admin',
      adminUsername,
      action: 'BOT_CONFIG_DELETED',
      targetType: 'BOT_CONFIG',
      targetId: id,
    });

    return true;
  },

  // --- ENTITLEMENTS ---
  async getEntitlements(): Promise<FeatureEntitlement[]> {
    return mem.entitlements;
  },

  async getEntitlementsByUserId(userId: string): Promise<FeatureKey[]> {
    return mem.entitlements.filter((e) => e.userId === userId).map((e) => e.featureKey);
  },

  async toggleEntitlement(userId: string, featureKey: FeatureKey, adminUsername: string): Promise<boolean> {
    const idx = mem.entitlements.findIndex((e) => e.userId === userId && e.featureKey === featureKey);
    if (idx >= 0) {
      mem.entitlements.splice(idx, 1);
      await this.logAudit({
        adminId: 'admin',
        adminUsername,
        action: `REVOKED_FEATURE_${featureKey}`,
        targetType: 'PERMISSION',
        targetId: userId,
        details: { featureKey },
      });
    } else {
      mem.entitlements.push({
        id: `ent_${Date.now()}`,
        userId,
        featureKey,
        grantedBy: adminUsername,
        grantedAt: new Date().toISOString(),
      });
      await this.logAudit({
        adminId: 'admin',
        adminUsername,
        action: `GRANTED_FEATURE_${featureKey}`,
        targetType: 'PERMISSION',
        targetId: userId,
        details: { featureKey },
      });
    }
    return true;
  },

  // --- AUDIT LOGS ---
  async getAuditLogs(): Promise<AdminAuditLog[]> {
    await ensureSchema();
    if (pool && schemaInitialized) {
      try {
        const res = await pool.query('SELECT * FROM web_audit_logs ORDER BY created_at DESC LIMIT 100');
        return res.rows.map((r) => ({
          id: String(r.id),
          adminId: r.admin_id,
          adminUsername: r.admin_username,
          action: r.action,
          targetType: r.target_type,
          targetId: r.target_id,
          details: r.details,
          createdAt: r.created_at.toISOString(),
        }));
      } catch (e) {
        console.error('Database getAuditLogs failed:', e);
      }
    }
    return [...mem.auditLogs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async logAudit(entry: Omit<AdminAuditLog, 'id' | 'createdAt'>): Promise<AdminAuditLog> {
    const log: AdminAuditLog = {
      ...entry,
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };

    if (pool && schemaInitialized) {
      try {
        await pool.query(
          `INSERT INTO web_audit_logs (admin_id, admin_username, action, target_type, target_id, details, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
          [log.adminId, log.adminUsername, log.action, log.targetType, log.targetId, log.details ? JSON.stringify(log.details) : null]
        );
      } catch (e) {
        console.error('Database logAudit failed:', e);
      }
    }

    mem.auditLogs.unshift(log);
    saveToDisk();
    return log;
  },

  // --- PROJECT REQUESTS ---
  async getProjectRequests(): Promise<ProjectRequest[]> {
    await ensureSchema();
    if (pool && schemaInitialized) {
      try {
        const res = await pool.query('SELECT * FROM web_project_requests ORDER BY created_at DESC');
        return res.rows.map((r) => ({
          id: String(r.id),
          contactName: r.contact_name,
          contactMethod: r.contact_method,
          category: r.category,
          description: r.description,
          status: r.status,
          createdAt: r.created_at.toISOString(),
        }));
      } catch (e) {
        console.error('Database getProjectRequests failed:', e);
      }
    }
    return [...mem.projectRequests];
  },

  async submitProjectRequest(data: Omit<ProjectRequest, 'id' | 'status' | 'createdAt'>): Promise<ProjectRequest> {
    await ensureSchema();
    const now = new Date().toISOString();

    if (pool && schemaInitialized) {
      try {
        const res = await pool.query(
          `INSERT INTO web_project_requests (contact_name, contact_method, category, description, status, created_at)
           VALUES ($1, $2, $3, $4, 'pending', NOW())
           RETURNING id, created_at;`,
          [data.contactName, data.contactMethod, data.category, data.description]
        );
        const row = res.rows[0];
        return {
          ...data,
          id: String(row.id),
          status: 'pending',
          createdAt: row.created_at.toISOString(),
        };
      } catch (e) {
        console.error('Database submitProjectRequest failed:', e);
      }
    }

    const newReq: ProjectRequest = {
      ...data,
      id: `req_${Date.now()}`,
      status: 'pending',
      createdAt: now,
    };
    mem.projectRequests.unshift(newReq);
    saveToDisk();
    return newReq;
  },

  async updateProjectRequestStatus(
    id: string,
    status: 'pending' | 'reviewed' | 'contacted' | 'completed' | 'archived',
    adminUsername: string
  ): Promise<boolean> {
    await ensureSchema();
    if (pool && schemaInitialized) {
      try {
        await pool.query('UPDATE web_project_requests SET status = $1 WHERE id = $2', [status, id]);
      } catch (e) {
        console.error('Database updateProjectRequestStatus failed:', e);
      }
    }

    const item = mem.projectRequests.find((r) => r.id === id);
    if (item) {
      item.status = status;
    }
    saveToDisk();

    await this.logAudit({
      adminId: 'owner',
      adminUsername,
      action: 'PROJECT_REQUEST_STATUS_UPDATED',
      targetType: 'SYSTEM',
      targetId: id,
      details: { newStatus: status },
    });

    return true;
  },

  async deleteProjectRequest(id: string, adminUsername: string): Promise<boolean> {
    await ensureSchema();
    if (pool && schemaInitialized) {
      try {
        await pool.query('DELETE FROM web_project_requests WHERE id = $1', [id]);
      } catch (e) {
        console.error('Database deleteProjectRequest failed:', e);
      }
    }

    const idx = mem.projectRequests.findIndex((r) => r.id === id);
    if (idx >= 0) {
      mem.projectRequests.splice(idx, 1);
    }
    saveToDisk();

    await this.logAudit({
      adminId: 'owner',
      adminUsername,
      action: 'PROJECT_REQUEST_DELETED',
      targetType: 'SYSTEM',
      targetId: id,
    });

    return true;
  },

  // --- HOSTED BOTS (Render 1 Bot Hosting Integration & Local Registry) ---
  async getHostedBots(skipProbe = false): Promise<HostedBot[]> {
    await ensureSchema();
    let bots: HostedBot[] = [];

    if (pool && schemaInitialized) {
      try {
        const res = await pool.query('SELECT * FROM hosted_bots ORDER BY created_at ASC');
        bots = res.rows.map((r) => ({
          id: r.id,
          name: r.name,
          clientId: r.client_id,
          token: r.token,
          avatarUrl: r.avatar_url,
          statusText: r.status_text,
          hostingEnv: r.hosting_env as any,
          prefix: r.prefix,
          assignedCommands: r.assigned_commands || [],
          description: r.description,
          codeArchiveName: r.code_archive_name,
          codeArchiveSize: r.code_archive_size,
          desiredEnabled: r.desired_enabled,
          observedState: r.observed_state as any,
          pingMs: r.ping_ms,
          guildCount: r.guild_count || 0,
          totalMessagesProcessed: Number(r.total_messages_processed || 0),
          totalCommandsExecuted: Number(r.total_commands_executed || 0),
          lastStartedAt: r.last_started_at ? r.last_started_at.toISOString() : new Date().toISOString(),
          lastCheckedAt: r.last_checked_at ? r.last_checked_at.toISOString() : new Date().toISOString(),
          lastError: r.last_error,
          createdAt: r.created_at.toISOString(),
          updatedAt: r.updated_at.toISOString(),
        }));
      } catch (e) {
        console.error('Database getHostedBots failed:', e);
      }
    }

    if (bots.length === 0) {
      bots = Array.from(mem.hostedBots.values());
    }

    // Auto-bootstrap default bots from environment if none exist
    if (bots.length === 0) {
      const mainToken = process.env.BOT_TOKEN_MAIN || process.env.DISCORD_TOKEN || '';
      const botAToken = process.env.BOT_TOKEN_A || '';
      const now = new Date().toISOString();

      const mainBot: HostedBot = {
        id: 'main',
        name: 'Ongrywolf Official Bot',
        clientId: process.env.DISCORD_CLIENT_ID || '1563076245850296361',
        token: mainToken,
        statusText: 'Hosting on Ongrywolf',
        hostingEnv: 'Dedicated (Render)',
        prefix: '!',
        assignedCommands: ['log', 'listlog', 'channellog'],
        description: 'Primary platform bot handling work logs and staff commands.',
        desiredEnabled: true,
        observedState: mainToken ? 'online' : 'offline',
        totalMessagesProcessed: 0,
        totalCommandsExecuted: 0,
        lastStartedAt: now,
        lastCheckedAt: now,
        createdAt: now,
        updatedAt: now,
      };

      const botA: HostedBot = {
        id: 'bot_a',
        name: 'Violate Bot (Private)',
        clientId: process.env.BOT_CLIENT_ID_A || '1250267167065112616',
        token: botAToken,
        statusText: 'Hosting on Ongrywolf PRV',
        hostingEnv: 'Ongrywolf PRV',
        prefix: '!',
        assignedCommands: ['log', 'listlog', 'channellog'],
        description: 'Private instance for secondary guild operations.',
        desiredEnabled: true,
        observedState: botAToken ? 'online' : 'offline',
        totalMessagesProcessed: 0,
        totalCommandsExecuted: 0,
        lastStartedAt: now,
        lastCheckedAt: now,
        createdAt: now,
        updatedAt: now,
      };

      mem.hostedBots.set(mainBot.id, mainBot);
      mem.hostedBots.set(botA.id, botA);
      bots = [mainBot, botA];
    }

    // Synchronize with live Render 1 Bot Hosting Management API
    try {
      const remote = await botHostClient.listBots();
      if (remote.success && remote.bots.length > 0) {
        for (const remoteBot of remote.bots) {
          const local = bots.find((b) => b.id === remoteBot.id);
          const merged: HostedBot = {
            id: remoteBot.id,
            name: remoteBot.displayName,
            clientId: remoteBot.applicationId || local?.clientId || '',
            botId: remoteBot.botId || local?.botId,
            username: remoteBot.username || local?.username,
            avatarUrl: remoteBot.avatarUrl || local?.avatarUrl,
            ownerAccount: remoteBot.ownerAccount || local?.ownerAccount || 'notvoid18',
            statusText: remoteBot.statusText,
            hostingEnv: 'Dedicated (Render)',
            prefix: remoteBot.prefix || local?.prefix || '!',
            assignedCommands: remoteBot.assignedCommands || local?.assignedCommands || ['log', 'listlog', 'channellog'],
            enabledModules: remoteBot.enabledModules,
            version: remoteBot.version,
            gatewayStatus: remoteBot.gatewayStatus,
            description: local?.description,
            codeArchiveName: local?.codeArchiveName,
            codeArchiveSize: local?.codeArchiveSize,
            desiredEnabled: remoteBot.desiredEnabled,
            observedState: remoteBot.observedState as any,
            pingMs: remoteBot.pingMs || undefined,
            guildCount: remoteBot.guildCount,
            uptimeSeconds: remoteBot.uptimeSeconds || undefined,
            totalMessagesProcessed: local?.totalMessagesProcessed || 0,
            totalCommandsExecuted: local?.totalCommandsExecuted || 0,
            resourceUsage: remoteBot.resourceUsage,
            lastStartedAt: remoteBot.lastStartedAt || local?.lastStartedAt || new Date().toISOString(),
            lastCheckedAt: remoteBot.lastStatusUpdateAt || new Date().toISOString(),
            lastError: remoteBot.lastError || undefined,
            createdAt: local?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          if (local) {
            Object.assign(local, merged);
          } else {
            bots.push(merged);
          }
          mem.hostedBots.set(merged.id, merged);
        }
        saveToDisk();
        return bots;
      }
    } catch (_) {
      // Remote host unreachable, gracefully continue with local registry
    }

    // Direct REST health fallback if skipProbe is false and remote was unreachable
    if (!skipProbe) {
      await Promise.all(
        bots.map(async (bot) => {
          const effectiveToken = bot.token || (bot.id === 'main' ? (process.env.BOT_TOKEN_MAIN || process.env.DISCORD_TOKEN) : undefined);
          if (effectiveToken && bot.desiredEnabled) {
            const probeStart = Date.now();
            try {
              const res = await fetch('https://discord.com/api/v10/users/@me', {
                headers: { Authorization: `Bot ${effectiveToken.trim()}` },
                cache: 'no-store',
              });
              const latency = Date.now() - probeStart;
              if (res.ok) {
                const discordUser = await res.json();
                bot.observedState = 'online';
                bot.pingMs = latency;
                bot.avatarUrl = discordUser.avatar
                  ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
                  : undefined;
                bot.lastCheckedAt = new Date().toISOString();
              } else {
                bot.observedState = 'error';
                bot.lastError = `Discord API returned ${res.status}`;
                bot.pingMs = latency;
              }
            } catch (err: any) {
              bot.observedState = 'offline';
              bot.lastError = err.message;
            }
          } else if (!effectiveToken) {
            bot.observedState = 'offline';
            bot.lastError = 'Token missing from configuration';
          }
        })
      );
    }

    return bots;
  },

  async getHostedBotById(id: string): Promise<HostedBot | null> {
    const bots = await this.getHostedBots(true);
    return bots.find((b) => b.id === id) || null;
  },

  async getBotsByOwner(ownerAccount: string): Promise<HostedBot[]> {
    const bots = await this.getHostedBots(true);
    return bots.filter((b) => b.ownerAccount === ownerAccount || (ownerAccount === 'notvoid18' && !b.ownerAccount));
  },

  async probeBotLatency(id: string): Promise<{
    success: boolean;
    pingMs?: number;
    observedState: 'online' | 'offline' | 'error';
    avatarUrl?: string;
    username?: string;
    lastError?: string;
  }> {
    // Check if Render 1 has status first
    try {
      const remote = await botHostClient.getBot(id);
      if (remote.success && remote.bot) {
        return {
          success: true,
          pingMs: remote.bot.pingMs || undefined,
          observedState: remote.bot.observedState === 'online' ? 'online' : (remote.bot.observedState === 'error' ? 'error' : 'offline'),
          avatarUrl: remote.bot.avatarUrl,
          username: remote.bot.username,
          lastError: remote.bot.lastError || undefined,
        };
      }
    } catch (_) {}

    const bot = await this.getHostedBotById(id);
    if (!bot) {
      return { success: false, observedState: 'offline', lastError: 'Bot not found' };
    }

    const token =
      bot.token ||
      (bot.id === 'main' ? process.env.BOT_TOKEN_MAIN || process.env.DISCORD_TOKEN : undefined);
    if (!token) {
      bot.observedState = 'offline';
      bot.lastError = 'Token missing from configuration';
      saveToDisk();
      return { success: false, observedState: 'offline', lastError: bot.lastError };
    }

    const probeStart = Date.now();
    try {
      const res = await fetch('https://discord.com/api/v10/users/@me', {
        headers: { Authorization: `Bot ${token.trim()}` },
        cache: 'no-store',
      });
      const latency = Date.now() - probeStart;

      if (res.ok) {
        const discordUser = await res.json();
        bot.observedState = 'online';
        bot.pingMs = latency;
        bot.avatarUrl = discordUser.avatar
          ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
          : undefined;
        bot.lastCheckedAt = new Date().toISOString();
        bot.lastError = undefined;

        if (pool && schemaInitialized) {
          try {
            await pool.query(
              'UPDATE hosted_bots SET observed_state = $1, ping_ms = $2, avatar_url = $3, last_checked_at = NOW() WHERE id = $4',
              [bot.observedState, bot.pingMs, bot.avatarUrl, id]
            );
          } catch (e) {}
        }
        mem.hostedBots.set(bot.id, bot);
        saveToDisk();

        return {
          success: true,
          pingMs: latency,
          observedState: 'online',
          avatarUrl: bot.avatarUrl,
          username: discordUser.username,
        };
      } else {
        bot.observedState = 'error';
        bot.pingMs = latency;
        bot.lastError = `Discord API returned ${res.status}: ${res.statusText}`;
        mem.hostedBots.set(bot.id, bot);
        saveToDisk();
        return {
          success: false,
          pingMs: latency,
          observedState: 'error',
          lastError: bot.lastError,
        };
      }
    } catch (err: any) {
      bot.observedState = 'offline';
      bot.lastError = err.message;
      mem.hostedBots.set(bot.id, bot);
      saveToDisk();
      return {
        success: false,
        observedState: 'offline',
        lastError: err.message,
      };
    }
  },

  async saveHostedBot(
    botData: Omit<HostedBot, 'createdAt' | 'updatedAt' | 'totalMessagesProcessed' | 'totalCommandsExecuted'>,
    adminUsername: string
  ): Promise<HostedBot> {
    await ensureSchema();
    const now = new Date().toISOString();
    const cleanId = botData.id.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '_');

    // Provision directly to Render 1 Bot Hosting Management API
    if (botData.token && botData.token.trim()) {
      try {
        await botHostClient.registerBot({
          id: cleanId,
          displayName: botData.name,
          applicationId: botData.clientId,
          token: botData.token.trim(),
          defaultPrefix: botData.prefix || '!',
          defaultStatusText: botData.statusText || 'Hosting on Ongrywolf',
          ownerAccount: botData.ownerAccount || adminUsername,
          enabledModules: botData.enabledModules || ['work_logs'],
          desiredEnabled: botData.desiredEnabled,
        });
      } catch (provisionErr) {
        console.error('Provisioning to Render 1 notice:', provisionErr);
      }
    }

    // Probe token locally if provided
    let avatarUrl = botData.avatarUrl;
    let pingMs = botData.pingMs;
    let observedState = botData.observedState || 'offline';

    if (botData.token && botData.token.trim()) {
      const probeStart = Date.now();
      try {
        const res = await fetch('https://discord.com/api/v10/users/@me', {
          headers: { Authorization: `Bot ${botData.token.trim()}` },
          cache: 'no-store',
        });
        pingMs = Date.now() - probeStart;
        if (res.ok) {
          const user = await res.json();
          observedState = 'online';
          avatarUrl = user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : undefined;
        }
      } catch (err) {}
    }

    const bot: HostedBot = {
      ...botData,
      id: cleanId,
      avatarUrl,
      pingMs,
      observedState,
      totalMessagesProcessed: 0,
      totalCommandsExecuted: 0,
      lastStartedAt: now,
      lastCheckedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    if (pool && schemaInitialized) {
      try {
        await pool.query(
          `INSERT INTO hosted_bots (
            id, name, client_id, token, avatar_url, status_text, hosting_env,
            prefix, assigned_commands, description, code_archive_name, code_archive_size,
            desired_enabled, observed_state, ping_ms, last_started_at, last_checked_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW(), NOW())
          ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            client_id = EXCLUDED.client_id,
            token = COALESCE(NULLIF(EXCLUDED.token, ''), hosted_bots.token),
            avatar_url = EXCLUDED.avatar_url,
            status_text = EXCLUDED.status_text,
            hosting_env = EXCLUDED.hosting_env,
            prefix = EXCLUDED.prefix,
            assigned_commands = EXCLUDED.assigned_commands,
            description = EXCLUDED.description,
            codeArchiveName = COALESCE(EXCLUDED.code_archive_name, hosted_bots.code_archive_name),
            codeArchiveSize = COALESCE(EXCLUDED.code_archive_size, hosted_bots.code_archive_size),
            desired_enabled = EXCLUDED.desired_enabled,
            observed_state = EXCLUDED.observed_state,
            ping_ms = EXCLUDED.ping_ms,
            updated_at = NOW()`,
          [
            bot.id,
            bot.name,
            bot.clientId,
            bot.token || null,
            bot.avatarUrl || null,
            bot.statusText,
            bot.hostingEnv,
            bot.prefix,
            bot.assignedCommands,
            bot.description || null,
            bot.codeArchiveName || null,
            bot.codeArchiveSize || null,
            bot.desiredEnabled,
            bot.observedState,
            bot.pingMs || null,
          ]
        );
      } catch (e) {
        console.error('Database saveHostedBot failed:', e);
      }
    }

    mem.hostedBots.set(bot.id, bot);
    saveToDisk();

    await this.logAudit({
      adminId: 'owner',
      adminUsername,
      action: 'HOSTED_BOT_SAVED',
      targetType: 'BOT_CONFIG',
      targetId: bot.id,
      details: {
        botName: bot.name,
        clientId: bot.clientId,
        hostingEnv: bot.hostingEnv,
        codeArchive: bot.codeArchiveName,
      },
    });

    return bot;
  },

  async toggleHostedBot(id: string, enabled: boolean, adminUsername: string): Promise<boolean> {
    const bot = await this.getHostedBotById(id);
    if (!bot) return false;

    // Command Render 1
    if (enabled) {
      await botHostClient.startBot(id);
    } else {
      await botHostClient.stopBot(id);
    }

    bot.desiredEnabled = enabled;
    bot.observedState = enabled ? 'online' : 'offline';
    bot.updatedAt = new Date().toISOString();

    if (pool && schemaInitialized) {
      try {
        await pool.query(
          'UPDATE hosted_bots SET desired_enabled = $1, observed_state = $2, updated_at = NOW() WHERE id = $3',
          [enabled, bot.observedState, id]
        );
      } catch (e) {
        console.error('Database toggleHostedBot failed:', e);
      }
    }

    mem.hostedBots.set(id, bot);
    saveToDisk();

    await this.logAudit({
      adminId: 'owner',
      adminUsername,
      action: enabled ? 'HOSTED_BOT_STARTED' : 'HOSTED_BOT_STOPPED',
      targetType: 'BOT_CONFIG',
      targetId: id,
      details: { desiredEnabled: enabled },
    });

    return true;
  },

  async restartHostedBot(id: string, adminUsername: string): Promise<boolean> {
    const bot = await this.getHostedBotById(id);
    if (!bot) return false;

    await botHostClient.restartBot(id);

    bot.desiredEnabled = true;
    bot.observedState = 'online';
    bot.lastStartedAt = new Date().toISOString();
    bot.updatedAt = new Date().toISOString();

    mem.hostedBots.set(id, bot);
    saveToDisk();

    await this.logAudit({
      adminId: 'owner',
      adminUsername,
      action: 'HOSTED_BOT_RESTARTED',
      targetType: 'BOT_CONFIG',
      targetId: id,
    });

    return true;
  },

  async updateHostedBotConfig(
    id: string,
    updates: {
      displayName?: string;
      statusText?: string;
      statusType?: string;
      onlineMode?: 'online' | 'idle' | 'dnd' | 'invisible';
      streamingUrl?: string;
      prefix?: string;
      token?: string;
      enabledModules?: string[];
      assignedCommands?: string[];
    },
    adminUsername: string
  ): Promise<boolean> {
    const bot = await this.getHostedBotById(id);
    if (!bot) return false;

    await botHostClient.updateConfig(id, updates);

    if (updates.displayName) bot.name = updates.displayName;
    if (updates.statusText !== undefined) bot.statusText = updates.statusText;
    if (updates.statusType !== undefined) bot.statusType = updates.statusType;
    if (updates.onlineMode !== undefined) bot.onlineMode = updates.onlineMode;
    if (updates.streamingUrl !== undefined) bot.streamingUrl = updates.streamingUrl;
    if (updates.prefix) bot.prefix = updates.prefix;
    if (updates.assignedCommands) bot.assignedCommands = updates.assignedCommands;
    if (updates.enabledModules) bot.enabledModules = updates.enabledModules;
    bot.updatedAt = new Date().toISOString();

    mem.hostedBots.set(id, bot);
    saveToDisk();

    await this.logAudit({
      adminId: 'owner',
      adminUsername,
      action: 'HOSTED_BOT_CONFIG_UPDATED',
      targetType: 'BOT_CONFIG',
      targetId: id,
      details: updates,
    });

    return true;
  },

  async getHostedBotLogs(id: string): Promise<SanitizedLogEntry[]> {
    const res = await botHostClient.getLogs(id);
    return res.logs || [];
  },

  async deleteHostedBot(id: string, adminUsername: string): Promise<boolean> {
    // Delete on Render 1
    try {
      await botHostClient.deleteBot(id);
    } catch (_) {}

    if (pool && schemaInitialized) {
      try {
        await pool.query('DELETE FROM hosted_bots WHERE id = $1', [id]);
      } catch (e) {
        console.error('Database deleteHostedBot failed:', e);
      }
    }
    mem.hostedBots.delete(id);
    saveToDisk();

    await this.logAudit({
      adminId: 'owner',
      adminUsername,
      action: 'HOSTED_BOT_DELETED',
      targetType: 'BOT_CONFIG',
      targetId: id,
    });

    return true;
  },

  // --- WORK LOGS (Official Platform Staff Work Logs) ---
  async getWorkLogs(): Promise<WorkLog[]> {
    await ensureSchema();
    if (pool && schemaInitialized) {
      try {
        const res = await pool.query('SELECT * FROM work_logs ORDER BY created_at DESC LIMIT 100');
        return res.rows.map((r) => ({
          id: String(r.id),
          guildId: r.guild_id,
          channelId: r.channel_id,
          userId: r.user_id,
          username: r.username,
          description: r.description,
          createdAt: r.created_at.toISOString(),
        }));
      } catch (e) {
        console.error('Database getWorkLogs failed:', e);
      }
    }

    return [...mem.workLogs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async addWorkLog(data: Omit<WorkLog, 'id' | 'createdAt'>): Promise<WorkLog> {
    await ensureSchema();
    const now = new Date().toISOString();

    if (pool && schemaInitialized) {
      try {
        const res = await pool.query(
          `INSERT INTO work_logs (guild_id, channel_id, user_id, username, description, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())
           RETURNING id, created_at;`,
          [data.guildId, data.channelId, data.userId, data.username, data.description]
        );
        const row = res.rows[0];
        return {
          ...data,
          id: String(row.id),
          createdAt: row.created_at.toISOString(),
        };
      } catch (e) {
        console.error('Database addWorkLog failed:', e);
      }
    }

    const log: WorkLog = {
      ...data,
      id: `wlog_${Date.now()}`,
      createdAt: now,
    };
    mem.workLogs.unshift(log);
    saveToDisk();
    return log;
  },

  async deleteWorkLog(id: string, adminUsername: string): Promise<boolean> {
    if (pool && schemaInitialized) {
      try {
        await pool.query('DELETE FROM work_logs WHERE id = $1', [id]);
      } catch (e) {
        console.error('Database deleteWorkLog failed:', e);
      }
    }
    const idx = mem.workLogs.findIndex((w) => w.id === id);
    if (idx >= 0) mem.workLogs.splice(idx, 1);
    saveToDisk();

    await this.logAudit({
      adminId: 'owner',
      adminUsername,
      action: 'WORK_LOG_DELETED',
      targetType: 'SYSTEM',
      targetId: id,
    });

    return true;
  },

  // --- GENUINE REAL-TIME SYSTEM STATS ---
  getServerUptime(): { seconds: number; formatted: string; bootTime: string } {
    const diffSec = Math.floor((Date.now() - SERVER_BOOT_TIME) / 1000);
    const days = Math.floor(diffSec / 86400);
    const hours = Math.floor((diffSec % 86400) / 3600);
    const minutes = Math.floor((diffSec % 3600) / 60);
    const seconds = diffSec % 60;

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0 || days > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours > 0 || days > 0) parts.push(`${minutes}m`);
    parts.push(`${seconds}s`);

    return {
      seconds: diffSec,
      formatted: parts.join(' '),
      bootTime: new Date(SERVER_BOOT_TIME).toISOString(),
    };
  },
};
